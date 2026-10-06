/** Helpers shared by the Supabase database tests. */
import { buildCatalog } from '@quickbite/seed';
import { FakeGateway, OrderService, type RateLimit } from '@quickbite/server';
import postgres from 'postgres';
import { inject } from 'vitest';
import { PostgresOrderStore } from '../../supabase/server/postgresStore';
import { postgresJs } from '../../supabase/server/sql';

export const catalog = buildCatalog();
export const restaurant = catalog.restaurants.find((r) => r.slug === 'tandoor-tales-koramangala')!;
export const butterChicken = catalog.items.find(
  (i) => i.restaurantId === restaurant.id && i.name === 'Butter Chicken',
)!;
export const garlicNaan = catalog.items.find(
  (i) => i.restaurantId === restaurant.id && i.name === 'Garlic Naan',
)!;
export const SECRET = 'test-fake-webhook-secret';

/** A connection as the database owner (what the Edge Functions use). */
export function connect(max = 4) {
  return postgres(inject('dbUrl'), { max, prepare: false, onnotice: () => {} });
}

export type Client = ReturnType<typeof connect>;

/** Creates a customer in auth.users (what signing up does) and returns their id. */
export async function createUser(db: Client, who: string): Promise<string> {
  const id = crypto.randomUUID();
  await db.unsafe('insert into auth.users (id, email) values ($1::uuid, $2::text)', [
    id,
    `${who}.${id.slice(0, 8)}@example.com`,
  ]);
  return id;
}

/** Saves an address for a customer (as the owner) and returns its id. */
export async function createAddress(
  db: Client,
  userId: string,
  areaId = 'blr-koramangala',
): Promise<string> {
  const [row] = await db.unsafe<{ id: string }[]>(
    `insert into public.addresses (user_id, label, name, phone, line1, line2, landmark, area_id, pincode)
     values ($1::uuid, 'Home', 'Asha Rao', '9876543210', 'Flat 4B', '5th Block', '', $2::text, '560095')
     returning id`,
    [userId, areaId],
  );
  return row!.id;
}

/** The order workflow on the Postgres store with the fake provider and a controllable clock. */
export function services(db: Client, options: { rateLimit?: RateLimit; start?: string } = {}) {
  const clock = { now: new Date(options.start ?? Date.now()) };
  const now = () => clock.now;
  const store = new PostgresOrderStore(postgresJs(db));
  const gateway = new FakeGateway(SECRET);
  const service = new OrderService({
    store,
    gateways: { fake: gateway },
    now,
    rateLimit: options.rateLimit,
  });
  const advance = (seconds: number) => {
    clock.now = new Date(clock.now.getTime() + seconds * 1000);
  };
  return { store, gateway, service, clock, now, advance };
}

let keys = 0;
export const cart = (addressId: string, overrides: Record<string, unknown> = {}) => ({
  restaurantId: restaurant.id,
  items: [
    { itemId: butterChicken.id, qty: 2 },
    { itemId: garlicNaan.id, qty: 1 },
  ],
  addressId,
  idempotencyKey: `pg-${Date.now().toString(36)}-${++keys}`,
  ...overrides,
});

/**
 * Runs `work` as a Supabase API role inside a transaction that is always
 * rolled back, the way PostgREST runs a request: `set local role` plus the
 * JWT claims that auth.uid() reads. `userId` null means a signed-out visitor.
 */
export async function asRole<T>(
  db: Client,
  role: 'anon' | 'authenticated' | 'service_role',
  userId: string | null,
  work: (sql: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  const ROLLBACK = Symbol('rollback');
  let result: T;
  try {
    await db.begin(async (sql) => {
      const claims = JSON.stringify({ role, ...(userId ? { sub: userId } : {}) });
      await sql.unsafe(`select set_config('request.jwt.claims', $1, true)`, [claims]);
      await sql.unsafe(`set local role ${role}`);
      result = await work(sql);
      throw ROLLBACK;
    });
  } catch (error) {
    if (error !== ROLLBACK) throw error;
  }
  return result!;
}

/**
 * Runs one statement in its own savepoint and returns the Postgres error it
 * fails with (code and message), or null if it succeeded. The savepoint keeps
 * the surrounding transaction usable after a failure.
 */
export async function failure(
  sql: postgres.TransactionSql,
  statement: string,
  params: unknown[] = [],
): Promise<{ code: string; message: string } | null> {
  try {
    await sql.savepoint((sp) => sp.unsafe(statement, params as never[]));
    return null;
  } catch (error) {
    const e = error as { code?: string; message: string };
    return { code: e.code ?? 'unknown', message: e.message };
  }
}
