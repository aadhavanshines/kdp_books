/**
 * The shared order workflow (@quickbite/server) on the PostgresOrderStore,
 * against real PostgreSQL: atomic order creation, idempotency, signed
 * webhooks applied exactly once (also when delivered concurrently), amount
 * checks, coupon limits and the simulator.
 */
import { advanceDemoOrders, expireUnpaidOrders, type PaymentEvent } from '@quickbite/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  butterChicken,
  cart,
  connect,
  createAddress,
  createUser,
  garlicNaan,
  restaurant,
  services,
  type Client,
} from './db';

let db: Client;
let asha: string;
let home: string;

beforeAll(async () => {
  db = connect(8);
  asha = await createUser(db, 'asha');
  home = await createAddress(db, asha);
});

afterAll(async () => {
  await db?.end();
});

type Ctx = ReturnType<typeof services>;

async function place(ctx: Ctx, userId: string, addressId: string, overrides = {}) {
  const result = await ctx.service.placeOrder(userId, cart(addressId, overrides));
  if (!result.ok) throw new Error(result.error);
  return (await ctx.store.getOrder(result.orderId))!;
}

async function webhook(ctx: Ctx, providerOrderId: string, amount: number, outcome = 'success') {
  const event = ctx.gateway.buildEvent({
    providerOrderId,
    outcome: outcome as 'success' | 'failure',
    amount,
    currency: 'INR',
    now: ctx.now(),
  });
  const raw = JSON.stringify(event);
  return { raw, headers: await ctx.gateway.sign(raw, ctx.now()) };
}

const count = async (table: string, where: string, params: unknown[]) =>
  (
    await db.unsafe<{ n: number }[]>(
      `select count(*)::int as n from public.${table} where ${where}`,
      params as never[],
    )
  )[0]!.n;

describe('placing orders', () => {
  it('stores the server-priced order with its item snapshot, and reads it back unchanged', async () => {
    const ctx = services(db);
    const quote = await ctx.service.quote(asha, cart(home));
    const order = await place(ctx, asha, home);
    if (!quote.ok) throw new Error(quote.error);
    expect(order).toMatchObject({
      userId: asha,
      restaurantId: restaurant.id,
      status: 'pending_payment',
      paymentStatus: 'pending',
      paymentProvider: 'fake',
      providerOrderId: `fake_order_${order.id}`,
      needsReview: false,
      bill: quote.bill,
      address: { areaId: 'blr-koramangala', areaName: 'Koramangala', line1: 'Flat 4B' },
    });
    expect(order.items).toEqual(quote.lines);
    expect(order.items.map((l) => l.itemId)).toEqual([butterChicken.id, garlicNaan.id]);
    expect(order.createdAt).toBe(ctx.now().toISOString());
    // A second read (outside any transaction) is identical: the row mapping is lossless.
    expect(await ctx.store.getOrder(order.id)).toEqual(order);
    const [row] = await db.unsafe<{ n: number }[]>(
      'select count(*)::int as n from public.order_items where order_id = $1',
      [order.id],
    );
    expect(row!.n).toBe(2);
  });

  it('returns the same order for a repeated idempotency key, also when sent concurrently', async () => {
    const ctx = services(db);
    const request = cart(home);
    const results = await Promise.all(
      Array.from({ length: 6 }, () => ctx.service.placeOrder(asha, request)),
    );
    const ids = new Set(results.map((r) => (r.ok ? r.orderId : r.error)));
    expect(ids.size).toBe(1);
    expect(
      await count('orders', 'user_id = $1::uuid and idempotency_key = $2', [
        asha,
        request.idempotencyKey,
      ]),
    ).toBe(1);
  });

  it('limits how many orders a customer can create per minute', async () => {
    const ravi = await createUser(db, 'ravi');
    const raviHome = await createAddress(db, ravi);
    const ctx = services(db, { rateLimit: { maxOrders: 2, windowSeconds: 60 } });
    await place(ctx, ravi, raviHome);
    await place(ctx, ravi, raviHome);
    expect(await ctx.service.placeOrder(ravi, cart(raviHome))).toEqual({
      ok: false,
      error: 'RATE_LIMITED',
    });
    ctx.advance(61);
    expect((await ctx.service.placeOrder(ravi, cart(raviHome))).ok).toBe(true);
  });

  it('never uses another customer’s address', async () => {
    const ravi = await createUser(db, 'ravi');
    const ctx = services(db);
    expect(await ctx.service.placeOrder(ravi, cart(home))).toEqual({
      ok: false,
      error: 'ADDRESS_NOT_FOUND',
    });
  });
});

describe('payment webhooks', () => {
  it('places the order once, records the payment, the event and the coupon redemption', async () => {
    const ctx = services(db);
    const customer = await createUser(db, 'coupon');
    const address = await createAddress(db, customer);
    const order = await place(ctx, customer, address, { couponCode: 'WELCOME50' });
    const { raw, headers } = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal);

    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe('placed');
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe(
      'duplicate_event',
    );

    const after = (await ctx.store.getOrder(order.id))!;
    expect(after).toMatchObject({ status: 'placed', paymentStatus: 'paid', needsReview: false });
    expect(after.statusHistory.map((s) => s.status)).toEqual(['pending_payment', 'placed']);
    expect(await count('payments', 'order_id = $1 and status = $2', [order.id, 'captured'])).toBe(
      1,
    );
    expect(await count('webhook_events', 'order_id = $1', [order.id])).toBe(1);
    expect(await count('coupon_redemptions', 'order_id = $1', [order.id])).toBe(1);

    // WELCOME50 is once per customer: the next order can't use it.
    expect(
      await ctx.service.placeOrder(customer, cart(address, { couponCode: 'WELCOME50' })),
    ).toEqual({ ok: false, error: 'COUPON_NOT_APPLICABLE' });
  });

  it('applies the same webhook delivered concurrently exactly once', async () => {
    const ctx = services(db);
    const order = await place(ctx, asha, home);
    const { raw, headers } = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal);
    const outcomes = await Promise.all(
      Array.from({ length: 8 }, () => ctx.service.handleWebhook('fake', raw, headers)),
    );
    const placed = outcomes.filter((o) => o.body.outcome === 'placed');
    expect(placed).toHaveLength(1);
    expect(outcomes.every((o) => o.status === 200)).toBe(true);
    expect(await count('payments', 'order_id = $1', [order.id])).toBe(1);
    expect((await ctx.store.getOrder(order.id))!.statusHistory).toHaveLength(2);
  });

  it('does not place an order when the amount differs, and flags it', async () => {
    const ctx = services(db);
    const order = await place(ctx, asha, home);
    const { raw, headers } = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal - 1);
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe(
      'amount_mismatch',
    );
    expect(await ctx.store.getOrder(order.id)).toMatchObject({
      status: 'pending_payment',
      paymentStatus: 'pending',
      needsReview: true,
    });
    expect(
      await count('payments', 'order_id = $1 and status = $2', [order.id, 'amount_mismatch']),
    ).toBe(1);
  });

  it('rejects a bad signature without recording anything', async () => {
    const ctx = services(db);
    const order = await place(ctx, asha, home);
    const { raw, headers } = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal);
    const tampered = raw.replace(String(order.bill.grandTotal), '100');
    expect((await ctx.service.handleWebhook('fake', tampered, headers)).status).toBe(400);
    expect(await count('webhook_events', 'order_id = $1', [order.id])).toBe(0);
    expect((await ctx.store.getOrder(order.id))!.status).toBe('pending_payment');
  });

  it('lets the customer retry after a failed payment', async () => {
    const ctx = services(db);
    const order = await place(ctx, asha, home);
    const failed = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal, 'failure');
    expect((await ctx.service.handleWebhook('fake', failed.raw, failed.headers)).body.outcome).toBe(
      'payment_failed',
    );
    const paid = await webhook(ctx, order.providerOrderId!, order.bill.grandTotal);
    expect((await ctx.service.handleWebhook('fake', paid.raw, paid.headers)).body.outcome).toBe(
      'placed',
    );
    expect((await ctx.store.getOrder(order.id))!.statusHistory.map((s) => s.status)).toEqual([
      'pending_payment',
      'payment_failed',
      'placed',
    ]);
  });

  it('reports events for unknown orders without changing anything', async () => {
    const ctx = services(db);
    const event: PaymentEvent = {
      provider: 'fake',
      eventId: 'evt_unknown_order',
      type: 'payment.captured',
      providerOrderId: 'fake_order_missing',
      providerPaymentId: 'pay_x',
      amount: 100,
      currency: 'INR',
    };
    const raw = JSON.stringify({
      id: event.eventId,
      type: event.type,
      created: Math.floor(ctx.now().getTime() / 1000),
      data: { order_id: event.providerOrderId, payment_id: 'pay_x', amount: 100, currency: 'INR' },
    });
    const result = await ctx.service.handleWebhook(
      'fake',
      raw,
      await ctx.gateway.sign(raw, ctx.now()),
    );
    expect(result.body.outcome).toBe('unknown_order');
  });
});

describe('the simulator', () => {
  it('moves paid orders along one step at a time and expires unpaid ones', async () => {
    const ctx = services(db);
    const paid = await place(ctx, asha, home);
    const unpaid = await place(ctx, asha, home);
    const { raw, headers } = await webhook(ctx, paid.providerOrderId!, paid.bill.grandTotal);
    await ctx.service.handleWebhook('fake', raw, headers);

    ctx.advance(46);
    await advanceDemoOrders(ctx.store, { now: ctx.now(), stepSeconds: 45 });
    expect((await ctx.store.getOrder(paid.id))!.status).toBe('accepted');
    // Not again until another step has passed.
    await advanceDemoOrders(ctx.store, { now: ctx.now(), stepSeconds: 45 });
    expect((await ctx.store.getOrder(paid.id))!.status).toBe('accepted');

    ctx.advance(31 * 60);
    await expireUnpaidOrders(ctx.store, { now: ctx.now() });
    expect((await ctx.store.getOrder(unpaid.id))!.status).toBe('expired');
    for (let i = 0; i < 4; i++) {
      ctx.advance(46);
      await advanceDemoOrders(ctx.store, { now: ctx.now(), stepSeconds: 45 });
    }
    const delivered = (await ctx.store.getOrder(paid.id))!;
    expect(delivered.statusHistory.map((s) => s.status)).toEqual([
      'pending_payment',
      'placed',
      'accepted',
      'preparing',
      'out_for_delivery',
      'delivered',
    ]);
  });
});
