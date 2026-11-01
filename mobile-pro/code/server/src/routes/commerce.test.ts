import { beforeEach, describe, expect, it } from 'vitest';
import type { ApiErrorBody, Cart, GroceryItem, Order, OrderStreamEvent, OrderSummary, ProductListResponse, Restaurant } from '@pro/api/types';

import { createHarness, type Harness } from '../test/harness';

let h: Harness;
let token: string;
beforeEach(async () => {
  h = createHarness();
  token = await h.login();
});

async function firstItems(id: string) {
  const r = await h.json<Restaurant>('GET', `/platter/restaurants/${id}`);
  return r.menu.slice(1).flatMap((c) => c.items).filter((i) => i.isAvailable);
}

describe('cart', () => {
  it('sets quantities, merges identical lines and removes at zero', async () => {
    const [item] = await firstItems('r-02');
    let cart = await h.json<Cart>('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 1 } });
    cart = await h.json<Cart>('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 3 } });
    expect(cart.items).toHaveLength(1);
    expect(cart.itemCount).toBe(3);
    expect(cart.restaurant!.id).toBe('r-02');
    expect(cart.bill.itemTotal).toBe(item!.price * 3);
    cart = await h.json<Cart>('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 0 } });
    expect(cart.items).toHaveLength(0);
    expect(cart.restaurant).toBeNull();
    expect(cart.bill.total).toBe(0);
  });

  it('prices customizations and keeps different choices on separate lines', async () => {
    const items = await firstItems('r-05');
    const custom = items.find((i) => i.customizations.some((g) => g.kind === 'single' && g.options.some((o) => o.price > 0)));
    expect(custom).toBeTruthy();
    const group = custom!.customizations.find((g) => g.kind === 'single' && g.options.some((o) => o.price > 0))!;
    const pricey = group.options.find((o) => o.price > 0)!;
    await h.json<Cart>('PUT', '/cart/platter/items', { token, body: { productId: custom!.id, quantity: 1 } });
    const cart = await h.json<Cart>('PUT', '/cart/platter/items', {
      token,
      body: { productId: custom!.id, quantity: 1, options: [{ groupId: group.id, optionId: pricey.id }] },
    });
    expect(cart.items).toHaveLength(2);
    const upgraded = cart.items.find((l) => l.options.some((o) => o.optionId === pricey.id))!;
    expect(upgraded.unitPrice).toBe(custom!.price + pricey.price);
    expect(upgraded.optionsLabel).toContain(pricey.name);
    const bad = await h.json<ApiErrorBody>('PUT', '/cart/platter/items', {
      token,
      body: { productId: custom!.id, quantity: 1, options: [{ groupId: group.id, optionId: 'nope' }] },
      status: 400,
    });
    expect(bad.error.message).toMatch(/Unknown option/);
  });

  it('keeps a Platter cart to one restaurant unless replaced', async () => {
    const [a] = await firstItems('r-01');
    const [b] = await firstItems('r-02');
    await h.json('PUT', '/cart/platter/items', { token, body: { productId: a!.id, quantity: 1 } });
    const err = await h.json<ApiErrorBody>('PUT', '/cart/platter/items', { token, body: { productId: b!.id, quantity: 1 }, status: 409 });
    expect(err.error.code).toBe('CART_CONFLICT');
    const replaced = await h.json<Cart>('PUT', '/cart/platter/items', { token, body: { productId: b!.id, quantity: 1, replaceCart: true } });
    expect(replaced.restaurant!.id).toBe('r-02');
    expect(replaced.items).toHaveLength(1);
  });

  it('applies and removes coupons and explains failures', async () => {
    const [item] = await firstItems('r-03');
    await h.json('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 1 } });
    const tooSmall = await h.json<ApiErrorBody>('POST', '/cart/platter/coupon', { token, body: { code: 'PLATTER125' }, status: 400 });
    expect(tooSmall.error.code).toBe('COUPON_NOT_APPLICABLE');
    expect(tooSmall.error.message).toMatch(/^Add ₹\d+ more to apply$/);
    await h.json('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 5 } });
    const applied = await h.json<Cart>('POST', '/cart/platter/coupon', { token, body: { code: 'platter125' } });
    expect(applied.coupon!.code).toBe('PLATTER125');
    expect(applied.bill.couponDiscount).toBe(125);
    const removed = await h.json<Cart>('DELETE', '/cart/platter/coupon', { token });
    expect(removed.bill.couponDiscount).toBe(0);
    await h.json('POST', '/cart/platter/coupon', { token, body: { code: 'FRESH50' }, status: 400 });
  });

  it('sets a tip and shows the Minutely free-delivery nudge', async () => {
    const [g] = await h.json<GroceryItem[]>('GET', '/minutely/products?category=fruits');
    let cart = await h.json<Cart>('PUT', '/cart/minutely/items', { token, body: { productId: g!.id, quantity: 1 } });
    expect(cart.amountToFreeDelivery).toBeGreaterThan(0);
    cart = await h.json<Cart>('PUT', '/cart/minutely/tip', { token, body: { amount: 20 } });
    expect(cart.bill.tip).toBe(20);
  });

  it('rejects quantities above the limit and out-of-stock items', async () => {
    const all = await h.json<GroceryItem[]>('GET', '/minutely/products');
    const limited = all.find((g) => g.inStock)!;
    const err = await h.json<ApiErrorBody>('PUT', '/cart/minutely/items', {
      token,
      body: { productId: limited.id, quantity: limited.maxPerOrder + 1 },
      status: 409,
    });
    expect(err.error.code).toBe('MAX_QUANTITY');
    const gone = all.find((g) => !g.inStock)!;
    expect((await h.json<ApiErrorBody>('PUT', '/cart/minutely/items', { token, body: { productId: gone.id, quantity: 1 }, status: 409 })).error.code).toBe(
      'OUT_OF_STOCK',
    );
  });

  it('saves Cartly lines for later with variants', async () => {
    const list = await h.json<ProductListResponse>('GET', '/cartly/products?category=mobiles');
    const phone = list.items[0]!;
    let cart = await h.json<Cart>('PUT', '/cart/cartly/items', { token, body: { productId: phone.id, quantity: 1 } });
    expect(cart.items[0]!.optionsLabel).toBeTruthy();
    cart = await h.json<Cart>('PATCH', `/cart/cartly/lines/${cart.items[0]!.id}`, { token, body: { savedForLater: true } });
    expect(cart.items).toHaveLength(0);
    expect(cart.savedForLater).toHaveLength(1);
    expect(cart.bill.total).toBe(0);
  });

  it('keeps carts separate per app and per user', async () => {
    const [item] = await firstItems('r-01');
    await h.json('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 2 } });
    expect((await h.json<Cart>('GET', '/cart/minutely', { token })).items).toHaveLength(0);
    const other = await h.login('9988776655');
    expect((await h.json<Cart>('GET', '/cart/platter', { token: other })).items).toHaveLength(0);
    await h.json('GET', '/cart/lumo', { token, status: 400 });
  });
});

describe('orders', () => {
  async function placePlatterOrder() {
    const [item] = await firstItems('r-04');
    await h.json('PUT', '/cart/platter/items', { token, body: { productId: item!.id, quantity: 2 } });
    await h.json('PUT', '/cart/platter/tip', { token, body: { amount: 30 } });
    return h.json<Order>('POST', '/orders', { token, body: { app: 'platter', addressId: 'addr_home', payment: { kind: 'upi' } }, status: 201 });
  }

  it('places an order, empties the cart and lists it first', async () => {
    const order = await placePlatterOrder();
    expect(order.status).toBe('confirmed');
    expect(order.number).toMatch(/^PLT-\d{6}$/);
    expect(order.bill.tip).toBe(30);
    expect(order.payment.label).toMatch(/^UPI/);
    expect(order.timeline[0]).toMatchObject({ status: 'confirmed', done: true });
    expect(order.tracking!.route.length).toBeGreaterThan(1);
    expect(order.canCancel).toBe(true);
    expect((await h.json<Cart>('GET', '/cart/platter', { token })).items).toHaveLength(0);
    const list = await h.json<OrderSummary[]>('GET', '/orders?app=platter', { token });
    expect(list[0]!.id).toBe(order.id);
    expect(list.length).toBeGreaterThan(1);
  });

  it('refuses an empty cart', async () => {
    await h.json('POST', '/orders', { token, body: { app: 'minutely', addressId: 'addr_home', payment: { kind: 'cash' } }, status: 400 });
  });

  it('advances status over time, moves the rider and can be rated after delivery', async () => {
    const order = await placePlatterOrder();
    h.advance(10_000);
    expect((await h.json<Order>('GET', `/orders/${order.id}`, { token })).status).toBe('preparing');
    h.advance(50_000);
    const moving = await h.json<Order>('GET', `/orders/${order.id}`, { token });
    expect(moving.status).toBe('on_the_way');
    expect(moving.rider).not.toBeNull();
    expect(moving.tracking!.progress).toBeGreaterThan(0);
    expect(moving.tracking!.progress).toBeLessThan(1);
    expect(moving.canCancel).toBe(false);
    await h.json<ApiErrorBody>('POST', `/orders/${order.id}/rating`, { token, body: { stars: 5 }, status: 409 });
    h.advance(10 * 60_000);
    const done = await h.json<Order>('GET', `/orders/${order.id}`, { token });
    expect(done.status).toBe('delivered');
    expect(done.timeline.every((s) => s.done)).toBe(true);
    expect(done.etaMinutes).toBe(0);
    expect(done.tracking!.progress).toBe(1);
    const rated = await h.json<Order>('POST', `/orders/${order.id}/rating`, { token, body: { stars: 4, comment: 'Tasty', tags: ['Hot food'] } });
    expect(rated.rating!.stars).toBe(4);
    expect(rated.canRate).toBe(false);
  });

  it('cancels only early', async () => {
    const order = await placePlatterOrder();
    const cancelled = await h.json<Order>('POST', `/orders/${order.id}/cancel`, { token });
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.timeline.at(-1)!.status).toBe('cancelled');
    h.advance(10 * 60_000);
    expect((await h.json<Order>('GET', `/orders/${order.id}`, { token })).status).toBe('cancelled');
    await h.json('POST', `/orders/${order.id}/cancel`, { token, status: 409 });
  });

  it('handles a Cartly return after delivery', async () => {
    const list = await h.json<ProductListResponse>('GET', '/cartly/products?category=fashion');
    await h.json('PUT', '/cart/cartly/items', { token, body: { productId: list.items[0]!.id, quantity: 1 } });
    const order = await h.json<Order>('POST', '/orders', { token, body: { app: 'cartly', addressId: 'addr_home', payment: { kind: 'card', cardLast4: '1111' } }, status: 201 });
    expect(order.payment.label).toBe('Card •••• 1111');
    await h.json('POST', `/orders/${order.id}/returns`, { token, body: { lineIds: ['l1'], reason: 'Size too small' }, status: 409 });
    h.advance(5 * 60_000);
    const returned = await h.json<Order>('POST', `/orders/${order.id}/returns`, { token, body: { lineIds: ['l1'], reason: 'Size too small' }, status: 201 });
    expect(returned.returns[0]).toMatchObject({ status: 'pickup_scheduled', refundAmount: order.bill.itemTotal });
    expect(returned.canReturn).toBe(false);
  });

  it('keeps orders private to their owner', async () => {
    const order = await placePlatterOrder();
    const other = await h.login('9988776655');
    await h.json('GET', `/orders/${order.id}`, { token: other, status: 404 });
  });

  it('publishes status and location events from the simulator', async () => {
    const order = await placePlatterOrder();
    const events: OrderStreamEvent[] = [];
    h.deps.bus.on(`order:${order.id}`, (e: OrderStreamEvent) => events.push(e));
    h.advance(40_000);
    h.sim.tick();
    h.advance(20_000);
    h.sim.tick();
    expect(events.filter((e) => e.type === 'status').map((e) => e.type === 'status' && e.order.status)).toEqual(['on_the_way']);
    const locations = events.filter((e) => e.type === 'location');
    expect(locations.length).toBe(2);
    expect(locations[1]!.type === 'location' && locations[1]!.progress).toBeGreaterThan(locations[0]!.type === 'location' ? locations[0]!.progress : 1);
    h.advance(10 * 60_000);
    h.sim.tick();
    expect(events.at(-1)).toMatchObject({ type: 'status', order: { status: 'delivered' } });
  });

  it('streams order events over SSE', async () => {
    const order = await placePlatterOrder();
    const res = await h.request('GET', `/orders/${order.id}/events?token=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    const readUntil = async (needle: string) => {
      while (!text.includes(needle)) {
        const { value, done } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
    };
    await readUntil('event: snapshot');
    await readUntil('\n\n');
    h.advance(10 * 60_000);
    h.sim.tick();
    // The server closes the stream after the final status.
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    expect(text).toMatch(/event: snapshot\ndata: \{"type":"snapshot"/);
    expect(text).toContain('event: status');
  });

  it('rejects the SSE stream without a token', async () => {
    const order = await placePlatterOrder();
    expect((await h.request('GET', `/orders/${order.id}/events`)).status).toBe(401);
  });
});
