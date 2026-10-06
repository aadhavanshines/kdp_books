/**
 * The payment webhook: an order becomes "placed" only for a correctly signed,
 * fresh webhook whose amount and currency match the order, and only once.
 */
import type { Order } from '@quickbite/core';
import { describe, expect, it } from 'vitest';
import { hmacSha256Hex } from './crypto';
import { FAKE_SIGNATURE_HEADER, FakeGateway } from './gateways/fake';
import { fakePay } from './orderService';
import { expireUnpaidOrders } from './simulator';
import { ASHA, placed, RAVI, setup } from './testSetup';

type Ctx = ReturnType<typeof setup>;

/** A webhook body exactly as the fake provider would send it. */
function eventFor(ctx: Ctx, order: Order, overrides: Record<string, unknown> = {}) {
  const event = ctx.gateway.buildEvent({
    providerOrderId: order.providerOrderId!,
    outcome: 'success',
    amount: order.bill.grandTotal,
    currency: order.currency,
    now: ctx.now(),
  });
  return { ...event, data: { ...event.data, ...overrides } };
}

async function signed(ctx: Ctx, body: unknown) {
  const raw = JSON.stringify(body);
  return { raw, headers: await ctx.gateway.sign(raw, ctx.now()) };
}

const pay = (ctx: Ctx, orderId: string, outcome: 'success' | 'failure', userId = ASHA) =>
  fakePay({
    ...ctx,
    userId,
    input: { orderId, outcome },
    deliver: (body, headers) => ctx.service.handleWebhook('fake', body, headers),
  });

describe('signature checks', () => {
  it('accepts a correctly signed webhook and places the order', async () => {
    const ctx = setup();
    const { order } = await placed(ctx, { couponCode: 'WELCOME50' });
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));
    expect(await ctx.service.handleWebhook('fake', raw, headers)).toEqual({
      status: 200,
      body: { received: true, outcome: 'placed' },
    });
    const after = (await ctx.store.getOrder(order.id))!;
    expect(after).toMatchObject({ status: 'placed', paymentStatus: 'paid', needsReview: false });
    expect(after.statusHistory.map((s) => s.status)).toEqual(['pending_payment', 'placed']);
    const state = ctx.store.snapshot();
    expect(state.payments).toMatchObject([
      { orderId: order.id, status: 'captured', amount: order.bill.grandTotal },
    ]);
    expect(Object.keys(state.webhookEvents)).toHaveLength(1);
    expect(state.redemptions).toMatchObject([
      { userId: ASHA, couponCode: 'WELCOME50', orderId: order.id },
    ]);
  });

  it('rejects a tampered body, a wrong secret, a missing header and stale or future timestamps', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));

    // Body changed after signing (e.g. someone lowers the amount in transit).
    const tampered = raw.replace(`"amount":${order.bill.grandTotal}`, '"amount":100');
    expect(tampered).not.toBe(raw);
    const otherProvider = new FakeGateway('a-completely-different-secret');
    const t = Math.floor(ctx.now().getTime() / 1000);
    const attempts: [string, Record<string, string>][] = [
      [tampered, headers],
      [raw, await otherProvider.sign(raw, ctx.now())],
      [raw, {}],
      [raw, { [FAKE_SIGNATURE_HEADER]: 'garbage' }],
      [raw, { [FAKE_SIGNATURE_HEADER]: `t=${t},v1=` }],
      [raw, { [FAKE_SIGNATURE_HEADER]: `t=${t},v1=${'0'.repeat(64)}` }],
      [raw, await ctx.gateway.sign(raw, new Date(ctx.now().getTime() - 301_000))],
      [raw, await ctx.gateway.sign(raw, new Date(ctx.now().getTime() + 301_000))],
      // Correct signature for a different timestamp than the one claimed.
      [
        raw,
        {
          [FAKE_SIGNATURE_HEADER]: `t=${t - 1},v1=${await hmacSha256Hex('test-fake-webhook-secret', `${t}.${raw}`)}`,
        },
      ],
    ];
    for (const [body, h] of attempts) {
      const response = await ctx.service.handleWebhook('fake', body, h);
      expect(response.status).toBe(400);
      expect(response.body.received).toBe(false);
    }
    // Nothing was recorded and the order is still waiting.
    const state = ctx.store.snapshot();
    expect(state.payments).toEqual([]);
    expect(state.webhookEvents).toEqual({});
    expect((await ctx.store.getOrder(order.id))!.status).toBe('pending_payment');

    // The genuine webhook still works afterwards.
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe('placed');
  });

  it('rejects signed bodies that are not valid events', async () => {
    const ctx = setup();
    for (const body of [
      { hello: 'world' },
      { ...eventFor(ctx, (await placed(ctx)).order), id: 'evt/../x' },
    ]) {
      const { raw, headers } = await signed(ctx, body);
      expect((await ctx.service.handleWebhook('fake', raw, headers)).status).toBe(400);
    }
    const notJson = 'not json';
    expect(
      (await ctx.service.handleWebhook('fake', notJson, await ctx.gateway.sign(notJson, ctx.now())))
        .status,
    ).toBe(400);
  });
});

describe('amount checks', () => {
  it.each([
    ['one paisa less', (o: Order) => ({ amount: o.bill.grandTotal - 1 })],
    ['more', (o: Order) => ({ amount: o.bill.grandTotal + 100 })],
    ['₹1', () => ({ amount: 100 })],
    ['zero', () => ({ amount: 0 })],
    ['another currency', () => ({ currency: 'USD' })],
  ])('does not place an order paid with the wrong amount (%s)', async (_label, change) => {
    const ctx = setup();
    const { order } = await placed(ctx);
    const { raw, headers } = await signed(ctx, eventFor(ctx, order, change(order)));
    expect(await ctx.service.handleWebhook('fake', raw, headers)).toEqual({
      status: 200,
      body: { received: true, outcome: 'amount_mismatch' },
    });
    const after = (await ctx.store.getOrder(order.id))!;
    expect(after).toMatchObject({
      status: 'pending_payment',
      paymentStatus: 'pending',
      needsReview: true,
    });
    expect(ctx.store.snapshot().payments).toMatchObject([{ status: 'amount_mismatch' }]);
    expect(ctx.store.snapshot().redemptions).toEqual([]);
  });
});

describe('repeated and out-of-order webhooks', () => {
  it('processes a repeated webhook only once', async () => {
    const ctx = setup();
    const { order } = await placed(ctx, { couponCode: 'WELCOME50' });
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));
    const first = await ctx.service.handleWebhook('fake', raw, headers);
    const second = await ctx.service.handleWebhook('fake', raw, headers);
    const third = await ctx.service.handleWebhook('fake', raw, headers);
    expect([first, second, third].map((r) => [r.status, r.body.outcome])).toEqual([
      [200, 'placed'],
      [200, 'duplicate_event'],
      [200, 'duplicate_event'],
    ]);
    const state = ctx.store.snapshot();
    expect(state.payments).toHaveLength(1);
    expect(state.redemptions).toHaveLength(1);
    expect(state.orders[order.id]!.statusHistory.filter((s) => s.status === 'placed')).toHaveLength(
      1,
    );
  });

  it('handles the same webhook delivered concurrently', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));
    const results = await Promise.all(
      Array.from({ length: 5 }, () => ctx.service.handleWebhook('fake', raw, headers)),
    );
    expect(results.map((r) => r.body.outcome).sort()).toEqual([
      'duplicate_event',
      'duplicate_event',
      'duplicate_event',
      'duplicate_event',
      'placed',
    ]);
    expect(ctx.store.snapshot().payments).toHaveLength(1);
  });

  it('flags a second, different payment for an order that is already paid', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    await pay(ctx, order.id, 'success');
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe(
      'already_paid',
    );
    const after = (await ctx.store.getOrder(order.id))!;
    expect(after).toMatchObject({ status: 'placed', needsReview: true });
    expect(ctx.store.snapshot().payments.map((p) => p.status)).toEqual(['captured', 'duplicate']);
  });

  it('lets the customer retry after a failed payment', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    expect(await pay(ctx, order.id, 'failure')).toEqual({ outcome: 'payment_failed' });
    expect((await ctx.store.getOrder(order.id))!).toMatchObject({
      status: 'payment_failed',
      paymentStatus: 'failed',
    });
    expect(await pay(ctx, order.id, 'success')).toEqual({ outcome: 'placed' });
    const after = (await ctx.store.getOrder(order.id))!;
    expect(after.statusHistory.map((s) => s.status)).toEqual([
      'pending_payment',
      'payment_failed',
      'placed',
    ]);
  });

  it('accepts but flags a payment that arrives after the order expired', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    ctx.advance(31 * 60);
    expect(await expireUnpaidOrders(ctx.store, { now: ctx.now() })).toBe(1);
    const { raw, headers } = await signed(ctx, eventFor(ctx, order));
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe(
      'paid_needs_review',
    );
    expect((await ctx.store.getOrder(order.id))!).toMatchObject({
      status: 'expired',
      paymentStatus: 'paid',
      needsReview: true,
    });
  });

  it('acknowledges events for unknown orders without changing anything', async () => {
    const ctx = setup();
    const event = ctx.gateway.buildEvent({
      providerOrderId: 'fake_order_nope',
      outcome: 'success',
      amount: 100,
      currency: 'INR',
      now: ctx.now(),
    });
    const { raw, headers } = await signed(ctx, event);
    expect((await ctx.service.handleWebhook('fake', raw, headers)).body.outcome).toBe(
      'unknown_order',
    );
  });
});

describe('fakePay (the fake provider)', () => {
  it('only pays the customer’s own orders that are waiting for payment', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    await expect(pay(ctx, order.id, 'success', RAVI)).rejects.toMatchObject({ code: 'not-found' });
    await expect(pay(ctx, 'nope', 'success')).rejects.toMatchObject({ code: 'not-found' });
    await expect(
      fakePay({
        ...ctx,
        userId: ASHA,
        input: { orderId: order.id, outcome: 'maybe' },
        deliver: async () => ({ status: 200, body: { received: true } }),
      }),
    ).rejects.toMatchObject({ code: 'invalid-argument' });
    await pay(ctx, order.id, 'success');
    await expect(pay(ctx, order.id, 'success')).rejects.toMatchObject({
      code: 'failed-precondition',
    });
  });

  it('goes through the real webhook handler, so a rejected webhook surfaces as an error', async () => {
    const ctx = setup();
    const { order } = await placed(ctx);
    const wrongSecret = new FakeGateway('another-secret-entirely');
    await expect(
      fakePay({
        ...ctx,
        gateway: wrongSecret,
        userId: ASHA,
        input: { orderId: order.id, outcome: 'success' },
        deliver: (body, headers) => ctx.service.handleWebhook('fake', body, headers),
      }),
    ).rejects.toMatchObject({ code: 'failed-precondition' });
    expect((await ctx.store.getOrder(order.id))!.status).toBe('pending_payment');
  });
});
