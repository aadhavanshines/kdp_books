/**
 * Row Level Security and grants, tested as Supabase's API roles the way
 * PostgREST runs a request (role + JWT claims, see asRole): a signed-out
 * visitor (anon), customers Asha and Ravi (authenticated), and server code.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  asRole,
  butterChicken,
  cart,
  catalog,
  connect,
  createAddress,
  createUser,
  failure,
  restaurant,
  services,
  type Client,
} from './db';

let db: Client;
let asha: string;
let ravi: string;
let ashaAddress: string;
let raviAddress: string;
let ashaOrder: string;
let raviOrder: string;

const DENIED = '42501'; // insufficient_privilege

const anon = <T>(work: Parameters<typeof asRole<T>>[3]) => asRole(db, 'anon', null, work);
const as = <T>(userId: string, work: Parameters<typeof asRole<T>>[3]) =>
  asRole(db, 'authenticated', userId, work);

beforeAll(async () => {
  db = connect();
  asha = await createUser(db, 'asha');
  ravi = await createUser(db, 'ravi');
  ashaAddress = await createAddress(db, asha);
  raviAddress = await createAddress(db, ravi);
  await db.unsafe(
    `insert into public.profiles (user_id, name, phone) values ($1::uuid, 'Asha Rao', '9876543210'),
     ($2::uuid, 'Ravi Kumar', '9123456780')`,
    [asha, ravi],
  );

  // Real orders, created and paid by the server workflow (with a coupon redemption).
  const { service, store, gateway, now } = services(db);
  const place = async (userId: string, addressId: string, couponCode?: string) => {
    const result = await service.placeOrder(userId, cart(addressId, { couponCode }));
    if (!result.ok) throw new Error(result.error);
    return (await store.getOrder(result.orderId))!;
  };
  const a = await place(asha, ashaAddress, 'WELCOME50');
  const r = await place(ravi, raviAddress);
  const event = gateway.buildEvent({
    providerOrderId: a.providerOrderId!,
    outcome: 'success',
    amount: a.bill.grandTotal,
    currency: a.currency,
    now: now(),
  });
  const raw = JSON.stringify(event);
  expect((await service.handleWebhook('fake', raw, await gateway.sign(raw, now()))).status).toBe(
    200,
  );
  ashaOrder = a.id;
  raviOrder = r.id;
});

afterAll(async () => {
  await db?.end();
});

describe('the schema', () => {
  it('has RLS enabled on every table in public', async () => {
    const rows = await db.unsafe<{ relname: string }[]>(
      `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
    );
    expect(rows.map((r) => r.relname)).toEqual([]);
  });

  it('lets browsers execute only the search function', async () => {
    const rows = await db.unsafe<{ fn: string }[]>(
      `select p.proname as fn from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and (has_function_privilege('anon', p.oid, 'execute')
           or has_function_privilege('authenticated', p.oid, 'execute'))`,
    );
    expect(rows.map((r) => r.fn)).toEqual(['search_menu_items']);
  });

  it('publishes order changes to Realtime', async () => {
    const rows = await db.unsafe<{ tablename: string }[]>(
      `select tablename from pg_publication_tables where pubname = 'supabase_realtime'`,
    );
    expect(rows.map((r) => r.tablename)).toEqual(['orders']);
  });
});

describe('a signed-out visitor (anon)', () => {
  it('reads the whole public catalog', async () => {
    await anon(async (sql) => {
      const count = async (table: string) =>
        (await sql.unsafe<{ n: number }[]>(`select count(*)::int as n from public.${table}`))[0]!.n;
      expect(await count('regions')).toBe(catalog.regions.length);
      expect(await count('areas')).toBe(catalog.areas.length);
      expect(await count('restaurants')).toBe(catalog.restaurants.length);
      expect(await count('menu_categories')).toBe(catalog.categories.length);
      expect(await count('menu_items')).toBe(catalog.items.length);
    });
  });

  it('sees active coupons through the public view, but not the coupons table', async () => {
    await anon(async (sql) => {
      const codes = await sql.unsafe<{ code: string }[]>(
        'select code from public.public_coupons order by code',
      );
      expect(codes.map((c) => c.code)).toEqual(
        catalog.coupons
          .filter((c) => c.active)
          .map((c) => c.code)
          .sort(),
      );
      expect((await failure(sql, 'select * from public.coupons'))?.code).toBe(DENIED);
    });
  });

  it('can search dishes', async () => {
    await anon(async (sql) => {
      const rows = await sql.unsafe<{ name: string }[]>(
        `select name from public.search_menu_items('blr-koramangala', 'butter')`,
      );
      expect(rows.map((r) => r.name)).toContain('Butter Chicken');
    });
  });

  it('cannot read any customer or payment data', async () => {
    for (const table of [
      'profiles',
      'addresses',
      'orders',
      'order_items',
      'payments',
      'webhook_events',
      'coupon_redemptions',
    ]) {
      const error = await anon((sql) => failure(sql, `select * from public.${table}`));
      expect(error?.code, table).toBe(DENIED);
    }
  });

  it('cannot change prices or the catalog', async () => {
    const attempts = [
      `update public.menu_items set price = 100 where id = '${butterChicken.id}'`,
      `insert into public.restaurants (id) values ('evil')`,
      `delete from public.menu_items where id = '${butterChicken.id}'`,
      `update public.regions set platform_fee = 0`,
      `insert into public.coupons (code) values ('FREEFOOD')`,
    ];
    for (const statement of attempts) {
      const error = await anon((sql) => failure(sql, statement));
      expect(error?.code, statement).toBe(DENIED);
    }
  });

  it('cannot create orders', async () => {
    const error = await anon((sql) =>
      failure(sql, `insert into public.orders (id) values ('ord_fake')`),
    );
    expect(error?.code).toBe(DENIED);
  });
});

describe('a signed-in customer (authenticated)', () => {
  it('reads the catalog too, but cannot change prices', async () => {
    await as(asha, async (sql) => {
      const [item] = await sql.unsafe<{ price: number }[]>(
        'select price from public.menu_items where id = $1',
        [butterChicken.id],
      );
      expect(item!.price).toBe(butterChicken.price);
      for (const statement of [
        `update public.menu_items set price = 1 where id = '${butterChicken.id}'`,
        `update public.restaurants set is_open = false where id = '${restaurant.id}'`,
        `update public.coupons set value = 10000 where code = 'WELCOME50'`,
        `select * from public.coupons`,
      ]) {
        expect((await failure(sql, statement))?.code, statement).toBe(DENIED);
      }
    });
  });

  describe('profiles', () => {
    it('reads only their own profile', async () => {
      const rows = await as(asha, (sql) =>
        sql.unsafe<{ user_id: string; name: string }[]>(
          'select user_id, name from public.profiles',
        ),
      );
      expect(rows).toEqual([{ user_id: asha, name: 'Asha Rao' }]);
    });

    it('updates their own profile, and nobody else’s', async () => {
      await as(asha, async (sql) => {
        const own = await sql.unsafe(
          `update public.profiles set name = 'Asha R' where user_id = $1::uuid returning user_id`,
          [asha],
        );
        expect(own).toHaveLength(1);
        const other = await sql.unsafe(
          `update public.profiles set name = 'Hacked' where user_id = $1::uuid returning user_id`,
          [ravi],
        );
        expect(other).toHaveLength(0);
      });
    });

    it('cannot set or change user_id', async () => {
      await as(asha, async (sql) => {
        expect(
          (
            await failure(
              sql,
              `update public.profiles set user_id = $1::uuid where user_id = $2::uuid`,
              [ravi, asha],
            )
          )?.code,
        ).toBe(DENIED);
      });
      const fresh = await createUser(db, 'fresh');
      await as(fresh, async (sql) => {
        expect(
          (
            await failure(
              sql,
              `insert into public.profiles (user_id, name, phone) values ($1::uuid, 'X', '')`,
              [ravi],
            )
          )?.code,
        ).toBe(DENIED);
        // Without user_id it defaults to the caller: an upsert of the caller's own profile.
        const [row] = await sql.unsafe<{ user_id: string }[]>(
          `insert into public.profiles (name, phone) values ('Fresh', '')
           on conflict (user_id) do update set name = excluded.name returning user_id`,
        );
        expect(row!.user_id).toBe(fresh);
      });
    });

    it('cannot delete profiles', async () => {
      const error = await as(asha, (sql) =>
        failure(sql, 'delete from public.profiles where user_id = $1::uuid', [asha]),
      );
      expect(error?.code).toBe(DENIED);
    });
  });

  describe('addresses', () => {
    it('lists only their own addresses', async () => {
      const ids = await as(asha, (sql) =>
        sql.unsafe<{ id: string }[]>('select id from public.addresses'),
      );
      expect(ids.map((r) => r.id)).toEqual([ashaAddress]);
    });

    it('adds addresses for themselves only', async () => {
      await as(asha, async (sql) => {
        const [row] = await sql.unsafe<{ user_id: string }[]>(
          `insert into public.addresses (label, name, phone, line1, line2, landmark, area_id, pincode)
           values ('Work', 'Asha Rao', '9876543210', 'Tower B', 'Outer Ring Road', '', 'blr-koramangala', '560095')
           returning user_id`,
        );
        expect(row!.user_id).toBe(asha);
        const forged = await failure(
          sql,
          `insert into public.addresses (user_id, label, name, phone, line1, line2, area_id, pincode)
             values ($1::uuid, 'Home', 'Asha', '9876543210', 'Flat 1', 'Street 2', 'blr-koramangala', '560095')`,
          [ravi],
        );
        expect(forged?.code).toBe(DENIED);
      });
    });

    it('cannot store coordinates (they come from the area)', async () => {
      const error = await as(asha, (sql) =>
        failure(sql, `update public.addresses set lat = 1 where id = $1`, [ashaAddress]),
      );
      expect(error).not.toBeNull();
    });

    it('cannot change, move or delete someone else’s address', async () => {
      await as(asha, async (sql) => {
        expect(
          await sql.unsafe(
            `update public.addresses set line1 = 'Hacked' where id = $1 returning id`,
            [raviAddress],
          ),
        ).toHaveLength(0);
        expect(
          await sql.unsafe('delete from public.addresses where id = $1 returning id', [
            raviAddress,
          ]),
        ).toHaveLength(0);
        expect(
          (
            await failure(sql, 'update public.addresses set user_id = $1::uuid where id = $2', [
              ravi,
              ashaAddress,
            ])
          )?.code,
        ).toBe(DENIED);
      });
      const [stillThere] = await db.unsafe<{ line1: string }[]>(
        'select line1 from public.addresses where id = $1',
        [raviAddress],
      );
      expect(stillThere!.line1).toBe('Flat 4B');
    });

    it('rejects invalid addresses', async () => {
      await as(asha, async (sql) => {
        const insert = (areaId: string, pincode: string, phone = '9876543210') =>
          failure(
            sql,
            `insert into public.addresses (label, name, phone, line1, line2, area_id, pincode)
               values ('Home', 'Asha', $1, 'Flat 1', 'Street 2', $2, $3)`,
            [phone, areaId, pincode],
          );
        expect((await insert('atlantis', '560095'))?.code).toBe('23503'); // unknown area
        expect((await insert('blr-koramangala', '012345'))?.code).toBe('23514'); // bad pincode
        expect((await insert('blr-koramangala', '560095', '12345'))?.code).toBe('23514'); // bad phone
      });
    });
  });

  describe('orders', () => {
    it('reads only their own orders and order items', async () => {
      await as(asha, async (sql) => {
        const orders = await sql.unsafe<{ id: string }[]>('select id from public.orders');
        expect(orders.map((o) => o.id)).toEqual([ashaOrder]);
        const items = await sql.unsafe<{ order_id: string }[]>(
          'select distinct order_id from public.order_items',
        );
        expect(items.map((i) => i.order_id)).toEqual([ashaOrder]);
      });
      await as(ravi, async (sql) => {
        expect(
          await sql.unsafe('select id from public.orders where id = $1', [ashaOrder]),
        ).toHaveLength(0);
        expect(
          await sql.unsafe('select 1 from public.order_items where order_id = $1', [ashaOrder]),
        ).toHaveLength(0);
      });
    });

    it('cannot create, change or delete orders, even their own', async () => {
      const attempts: [string, unknown[]][] = [
        [
          `insert into public.orders (id, user_id, restaurant_id, restaurant, status, status_history,
             address, bill, distance_km, currency, payment_provider, payment_status, idempotency_key,
             eta_minutes, created_at, updated_at, status_updated_at)
           values ('ord_forged', $1::uuid, $2, '{}', 'placed', '[]', '{}', '{"grandTotal": 100}', 1,
             'INR', 'fake', 'paid', 'forged-key-123', '{}', now(), now(), now())`,
          [asha, restaurant.id],
        ],
        [`update public.orders set status = 'delivered' where id = $1`, [ashaOrder]],
        [`update public.orders set payment_status = 'paid' where id = $1`, [raviOrder]],
        [`update public.orders set bill = '{"grandTotal": 100}' where id = $1`, [ashaOrder]],
        [`delete from public.orders where id = $1`, [ashaOrder]],
        [
          `insert into public.order_items (order_id, line_no, menu_item_id, name, unit_price, qty, is_veg, line_total)
           values ($1, 9, 'x', 'Free food', 0, 1, true, 0)`,
          [ashaOrder],
        ],
        [
          `update public.order_items set unit_price = 0, line_total = 0 where order_id = $1`,
          [ashaOrder],
        ],
      ];
      for (const [statement, params] of attempts) {
        const error = await as(asha, (sql) => failure(sql, statement, params as never[]));
        expect(error?.code, statement).toBe(DENIED);
      }
    });
  });

  describe('payments, webhook events and coupon redemptions', () => {
    it('cannot read them, even for their own order', async () => {
      for (const table of ['payments', 'webhook_events', 'coupon_redemptions']) {
        const error = await as(asha, (sql) => failure(sql, `select * from public.${table}`));
        expect(error?.code, table).toBe(DENIED);
      }
    });

    it('cannot record a payment or a webhook event, or erase a coupon redemption', async () => {
      const attempts: [string, unknown[]][] = [
        [
          `insert into public.payments (id, order_id, user_id, provider, provider_order_id,
             provider_payment_id, amount, currency, status, event_id, created_at)
           values ('pay_forged', $1, $2::uuid, 'fake', 'x', 'y', 0, 'INR', 'captured', 'evt', now())`,
          [raviOrder, ravi],
        ],
        [
          `insert into public.webhook_events (provider, event_id, type, outcome, order_id, received_at)
           values ('fake', 'evt_forged', 'payment.captured', 'placed', $1, now())`,
          [raviOrder],
        ],
        [`delete from public.coupon_redemptions where user_id = $1::uuid`, [asha]],
        [`update public.payments set amount = 0`, []],
      ];
      for (const [statement, params] of attempts) {
        const error = await as(asha, (sql) => failure(sql, statement, params as never[]));
        expect(error?.code, statement).toBe(DENIED);
      }
      const [row] = await db.unsafe<{ n: number }[]>(
        'select count(*)::int as n from public.coupon_redemptions where user_id = $1::uuid',
        [asha],
      );
      expect(row!.n).toBe(1);
    });
  });
});

describe('server code', () => {
  it('the service role can read server-only tables (it bypasses RLS)', async () => {
    const rows = await asRole(db, 'service_role', null, (sql) =>
      sql.unsafe<{ order_id: string }[]>(
        'select order_id from public.payments where order_id = $1',
        [ashaOrder],
      ),
    );
    expect(rows).toHaveLength(1);
  });
});
