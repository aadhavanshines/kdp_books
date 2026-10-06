import { describe, expect, it } from 'vitest';
import { ServerError } from './errors';
import { fakePay } from './orderService';
import {
  ASHA,
  butterChicken,
  catalog,
  garlicNaan,
  placed,
  RAVI,
  restaurant,
  setup,
} from './testSetup';

describe('OrderService.quote', () => {
  it('prices from the store and ignores prices sent by the browser', async () => {
    const { service, cart } = setup();
    const { idempotencyKey: _key, ...request } = cart({
      items: [{ itemId: butterChicken.id, qty: 2, price: 1, unitPrice: 1 }],
    });
    const quote = await service.quote(ASHA, { ...request, grandTotal: 100 });
    if (!quote.ok) throw new Error(quote.error);
    expect(quote.lines[0]!.unitPrice).toBe(butterChicken.price);
    expect(quote.bill.itemTotal).toBe(butterChicken.price * 2);
  });

  it('validates every input', async () => {
    const { service, cart } = setup();
    for (const bad of [
      cart({ items: [{ itemId: butterChicken.id, qty: 0 }] }),
      cart({ items: [{ itemId: butterChicken.id, qty: 21 }] }),
      cart({ items: [{ itemId: butterChicken.id, qty: 1.5 }] }),
      cart({ items: [] }),
      cart({ couponCode: 'bad code!' }),
      { ...cart(), restaurantId: undefined },
      'not an object',
    ]) {
      await expect(service.quote(ASHA, bad)).rejects.toMatchObject({ code: 'invalid-argument' });
    }
  });

  it('only uses the customer’s own addresses', async () => {
    const { service, cart } = setup();
    expect(await service.quote(RAVI, cart({ addressId: 'asha-home' }))).toEqual({
      ok: false,
      error: 'ADDRESS_NOT_FOUND',
    });
  });
});

describe('OrderService.placeOrder', () => {
  it('creates an order waiting for payment, priced and snapshotted on the server', async () => {
    const ctx = setup();
    const quote = await ctx.service.quote(ASHA, ctx.cart());
    const { result, order } = await placed(ctx, { couponCode: 'welcome50' });
    if (!quote.ok) throw new Error();

    expect(order).toMatchObject({
      userId: ASHA,
      restaurantId: restaurant.id,
      status: 'pending_payment',
      paymentStatus: 'pending',
      paymentProvider: 'fake',
      couponCode: 'WELCOME50',
      needsReview: false,
      restaurant: { name: restaurant.name, slug: restaurant.slug },
      address: { areaName: 'Koramangala', city: 'Bengaluru', line1: 'Flat 4B' },
    });
    expect(order.items.map((l) => [l.name, l.qty, l.unitPrice])).toEqual([
      ['Butter Chicken', 2, butterChicken.price],
      ['Garlic Naan', 1, garlicNaan.price],
    ]);
    expect(order.bill.discount).toBeGreaterThan(0);
    expect(order.statusHistory).toEqual([{ status: 'pending_payment', at: order.createdAt }]);
    expect(result.payment).toEqual({
      provider: 'fake',
      providerOrderId: `fake_order_${order.id}`,
      amount: order.bill.grandTotal,
      currency: 'INR',
    });
    expect(order.providerOrderId).toBe(result.payment.providerOrderId);
  });

  it('returns the same order when the same idempotency key is sent again', async () => {
    const ctx = setup();
    const request = ctx.cart();
    const [a, b] = await Promise.all([
      ctx.service.placeOrder(ASHA, request),
      ctx.service.placeOrder(ASHA, request),
    ]);
    const c = await ctx.service.placeOrder(ASHA, request);
    expect(a.ok && b.ok && c.ok).toBe(true);
    expect(new Set([a, b, c].map((r) => r.ok && r.orderId)).size).toBe(1);
    expect(Object.keys(ctx.store.snapshot().orders)).toHaveLength(1);

    // Keys are per customer: Ravi reusing Asha's key gets his own order.
    const ravi = await ctx.service.placeOrder(RAVI, { ...request, addressId: 'ravi-home' });
    expect(ravi.ok && ravi.orderId).not.toBe(a.ok && a.orderId);
  });

  it('limits each customer to 10 orders a minute', async () => {
    const ctx = setup();
    for (let i = 0; i < 10; i++) await placed(ctx);
    expect(await ctx.service.placeOrder(ASHA, ctx.cart())).toEqual({
      ok: false,
      error: 'RATE_LIMITED',
    });
    // Other customers are unaffected, and the limit resets after the window.
    await placed(ctx, { addressId: 'ravi-home' }, RAVI);
    ctx.advance(61);
    await placed(ctx);
  });

  it('refuses carts it cannot honour', async () => {
    const ctx = setup();
    const closed = catalog.restaurants.find((r) => !r.isOpen)!;
    const closedItem = catalog.items.find((i) => i.restaurantId === closed.id)!;
    const unavailable = catalog.items.find(
      (i) => i.restaurantId === restaurant.id && !i.isAvailable,
    );
    const cases: [Record<string, unknown>, string][] = [
      [{ addressId: 'nope' }, 'ADDRESS_NOT_FOUND'],
      [{ addressId: 'asha-far' }, 'NOT_DELIVERABLE'],
      [{ restaurantId: 'nope' }, 'RESTAURANT_NOT_FOUND'],
      [
        { restaurantId: closed.id, items: [{ itemId: closedItem.id, qty: 1 }] },
        'RESTAURANT_CLOSED',
      ],
      [{ items: [{ itemId: 'someone-else:item', qty: 1 }] }, 'EMPTY_CART'],
      [
        {
          items: [
            { itemId: butterChicken.id, qty: 1 },
            { itemId: 'gone', qty: 1 },
          ],
        },
        'UNAVAILABLE_ITEMS',
      ],
      [{ couponCode: 'PARTY20' }, 'COUPON_NOT_APPLICABLE'],
      [{ couponCode: 'NOPE123' }, 'COUPON_NOT_APPLICABLE'],
    ];
    if (unavailable) {
      cases.push([
        {
          items: [
            { itemId: butterChicken.id, qty: 1 },
            { itemId: unavailable.id, qty: 1 },
          ],
        },
        'UNAVAILABLE_ITEMS',
      ]);
    }
    for (const [overrides, error] of cases) {
      expect(await ctx.service.placeOrder(ASHA, ctx.cart(overrides)), error).toEqual({
        ok: false,
        error,
      });
    }
    expect(Object.keys(ctx.store.snapshot().orders)).toHaveLength(0);
  });

  it('lets a once-per-customer coupon be used once', async () => {
    const ctx = setup();
    const { order } = await placed(ctx, { couponCode: 'WELCOME50' });
    await fakePay({
      ...ctx,
      userId: ASHA,
      input: { orderId: order.id, outcome: 'success' },
      deliver: (body, headers) => ctx.service.handleWebhook('fake', body, headers),
    });
    const quote = await ctx.service.quote(ASHA, { ...ctx.cart(), couponCode: 'WELCOME50' });
    expect(quote.ok && quote.bill.couponRejection).toEqual({ reason: 'USAGE_LIMIT' });
    expect(await ctx.service.placeOrder(ASHA, ctx.cart({ couponCode: 'WELCOME50' }))).toEqual({
      ok: false,
      error: 'COUPON_NOT_APPLICABLE',
    });
    // Ravi has never used it.
    await placed(ctx, { couponCode: 'WELCOME50', addressId: 'ravi-home' }, RAVI);
  });
});

describe('getOrderFor', () => {
  it('never returns someone else’s order', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    expect((await ctx.service.getOrderFor(ASHA, order.id)).id).toBe(order.id);
    await expect(ctx.service.getOrderFor(RAVI, order.id)).rejects.toBeInstanceOf(ServerError);
  });
});
