/**
 * Razorpay end to end, offline: the gateway's HTTP calls go to a simulator of
 * Razorpay's API, Checkout and webhooks (see providerSimulators.ts).
 */
import { describe, expect, it } from 'vitest';
import { ProviderApiError } from '../src/errors';
import { RazorpayGateway } from '../src/gateways/razorpay';
import { expireUnpaidOrders } from '../src/simulator';
import { ASHA, placed, RAVI, setup } from '../src/testSetup';
import { RAZORPAY_TEST_KEYS, RazorpaySimulator } from './providerSimulators';

function razorpaySetup() {
  const sim = new RazorpaySimulator();
  const gateway = new RazorpayGateway({ ...RAZORPAY_TEST_KEYS, fetch: sim.fetch });
  const ctx = setup({ gateways: { razorpay: gateway } });
  sim.now = () => Math.floor(ctx.now().getTime() / 1000);
  return { ...ctx, sim, rzp: gateway };
}

type Ctx = ReturnType<typeof razorpaySetup>;

async function placedWithRazorpay(ctx: Ctx, overrides = {}) {
  const { result, order } = await placed(ctx, overrides);
  if (result.payment.provider !== 'razorpay') throw new Error('expected Razorpay');
  return { order, payment: result.payment };
}

const confirm = (ctx: Ctx, orderId: string, checkout: object, userId = ASHA) =>
  ctx.service.confirmRazorpayPayment(userId, { orderId, ...checkout });

describe('RazorpayGateway HTTP calls', () => {
  it('creates an order with Basic auth, the exact amount, a receipt and notes', async () => {
    const { sim, rzp } = razorpaySetup();
    const start = await rzp.createPayment({
      orderId: 'ord_abc123',
      amount: 49_900,
      currency: 'INR',
    });
    expect(start).toEqual({
      provider: 'razorpay',
      providerOrderId: expect.stringMatching(/^order_/),
      amount: 49_900,
      currency: 'INR',
      keyId: RAZORPAY_TEST_KEYS.keyId,
    });
    const [request] = sim.requests;
    expect(request).toMatchObject({
      method: 'POST',
      url: 'https://api.razorpay.com/v1/orders',
      headers: {
        authorization: `Basic ${Buffer.from(`${RAZORPAY_TEST_KEYS.keyId}:${RAZORPAY_TEST_KEYS.keySecret}`).toString('base64')}`,
        'content-type': 'application/json',
      },
    });
    expect(JSON.parse(request!.body)).toEqual({
      amount: 49_900,
      currency: 'INR',
      receipt: 'ord_abc123',
      notes: { quickbite_order_id: 'ord_abc123' },
    });
    expect(sim.orders.get(start.providerOrderId)).toMatchObject({
      amount: 49_900,
      status: 'created',
    });
  });

  it('reports Razorpay errors, bad credentials and network failures as ProviderApiError', async () => {
    const { sim, rzp } = razorpaySetup();
    await expect(
      rzp.createPayment({ orderId: 'o', amount: 50, currency: 'INR' }),
    ).rejects.toMatchObject({
      name: 'ProviderApiError',
      status: 400,
      code: 'BAD_REQUEST_ERROR',
      message: expect.stringMatching(/atleast INR 1.00/),
    });
    const wrongKey = new RazorpayGateway({
      ...RAZORPAY_TEST_KEYS,
      keySecret: 'wrong',
      fetch: sim.fetch,
    });
    await expect(
      wrongKey.createPayment({ orderId: 'o', amount: 100, currency: 'INR' }),
    ).rejects.toMatchObject({
      status: 401,
      message: expect.stringMatching(/Authentication failed/),
    });
    await expect(rzp.fetchPayment('pay_doesnotexist01')).rejects.toBeInstanceOf(ProviderApiError);
    sim.down = true;
    await expect(
      rzp.createPayment({ orderId: 'o', amount: 100, currency: 'INR' }),
    ).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });
  });

  it('refuses a response that does not match the request', async () => {
    const rzp = new RazorpayGateway({
      ...RAZORPAY_TEST_KEYS,
      fetch: async () =>
        Response.json({ id: 'order_X1', amount: 100, currency: 'INR', status: 'created' }),
    });
    await expect(
      rzp.createPayment({ orderId: 'o', amount: 999, currency: 'INR' }),
    ).rejects.toMatchObject({
      code: 'unexpected_response',
    });
  });
});

describe('paying an Indian order with Razorpay', () => {
  it('picks Razorpay for the India region and charges the server-priced total', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    expect(order).toMatchObject({
      paymentProvider: 'razorpay',
      providerOrderId: payment.providerOrderId,
      status: 'pending_payment',
    });
    expect(payment.amount).toBe(order.bill.grandTotal);
    expect(ctx.sim.orders.get(payment.providerOrderId)!.amount).toBe(order.bill.grandTotal);
  });

  it('places the order after a verified Checkout payment; the webhook afterwards is a no-op', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx, { couponCode: 'WELCOME50' });
    const { payment: rzpPayment, checkout } = ctx.sim.pay(payment.providerOrderId);

    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'placed' });
    expect(await ctx.store.getOrder(order.id)).toMatchObject({
      status: 'placed',
      paymentStatus: 'paid',
      providerPaymentId: rzpPayment.id,
    });
    expect(ctx.store.snapshot().payments).toMatchObject([
      { provider: 'razorpay', status: 'captured', amount: order.bill.grandTotal },
    ]);

    for (const event of ['payment.captured', 'order.paid']) {
      const hook = ctx.sim.webhook(event, rzpPayment);
      expect(await ctx.service.handleWebhook('razorpay', hook.rawBody, hook.headers)).toEqual({
        status: 200,
        body: { received: true, outcome: 'duplicate_event' },
      });
    }
    // Confirming again (a double tap, or a replayed request) changes nothing.
    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'duplicate_event' });
    expect(ctx.store.snapshot().payments).toHaveLength(1);
    expect(ctx.store.snapshot().redemptions).toHaveLength(1);
  });

  it('places the order from the webhook alone when the customer closes the tab', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment, checkout } = ctx.sim.pay(payment.providerOrderId);
    const hook = ctx.sim.webhook('order.paid', rzpPayment);
    expect(
      (await ctx.service.handleWebhook('razorpay', hook.rawBody, hook.headers)).body.outcome,
    ).toBe('placed');
    expect((await ctx.store.getOrder(order.id))!.status).toBe('placed');
    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'duplicate_event' });
  });

  it('refuses tampered or borrowed Checkout responses without changing anything', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const other = await placedWithRazorpay(ctx);
    const { checkout } = ctx.sim.pay(payment.providerOrderId);
    const sig = checkout.razorpay_signature;
    const flipped = sig.slice(0, -1) + (sig.endsWith('a') ? 'b' : 'a');

    const attempts = [
      // One hex digit of the signature changed.
      [order.id, { ...checkout, razorpay_signature: flipped }],
      // A genuine payment of another Razorpay order presented for this one.
      [other.order.id, { ...checkout, razorpay_order_id: other.payment.providerOrderId }],
      // The genuine response, but for the wrong QuickBite order.
      [other.order.id, checkout],
      // A made-up payment id with the original signature.
      [order.id, { ...checkout, razorpay_payment_id: 'pay_MadeUpPayment01' }],
    ] as const;
    for (const [orderId, body] of attempts) {
      await expect(confirm(ctx, orderId, body)).rejects.toMatchObject({
        code: 'permission-denied',
      });
    }
    await expect(confirm(ctx, order.id, checkout, RAVI)).rejects.toMatchObject({
      code: 'not-found',
    });
    await expect(
      confirm(ctx, order.id, { ...checkout, razorpay_signature: 'nothex' }),
    ).rejects.toMatchObject({
      code: 'invalid-argument',
    });
    expect(ctx.store.snapshot().payments).toEqual([]);
    expect((await ctx.store.getOrder(order.id))!.status).toBe('pending_payment');
    expect((await ctx.store.getOrder(other.order.id))!.status).toBe('pending_payment');

    // The genuine response still works afterwards.
    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'placed' });
  });

  it('captures an authorized payment when automatic capture is off', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment, checkout } = ctx.sim.pay(payment.providerOrderId, {
      capture: 'manual',
    });
    expect(rzpPayment.status).toBe('authorized');
    // Razorpay only says "authorized": no webhook for that places anything.
    const authorized = ctx.sim.webhook('payment.authorized', rzpPayment);
    expect(
      (await ctx.service.handleWebhook('razorpay', authorized.rawBody, authorized.headers)).body,
    ).toEqual({
      received: true,
      outcome: 'ignored',
    });

    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'placed' });
    const capture = ctx.sim.requests.find((r) => r.url.endsWith('/capture'))!;
    expect(JSON.parse(capture.body)).toEqual({ amount: order.bill.grandTotal, currency: 'INR' });
    expect(ctx.sim.payments.get(rzpPayment.id)!.status).toBe('captured');
  });

  it('copes with automatic capture winning the race against our capture', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment, checkout } = ctx.sim.pay(payment.providerOrderId, {
      capture: 'manual',
    });
    const original = ctx.sim.fetch;
    const racing = new RazorpayGateway({
      ...RAZORPAY_TEST_KEYS,
      fetch: async (url, init) => {
        if (url.endsWith('/capture')) {
          rzpPayment.status = 'captured';
          rzpPayment.captured = true;
        }
        return original(url, init);
      },
    });
    const result = await racing.settleCheckoutPayment({
      providerOrderId: payment.providerOrderId,
      paymentId: checkout.razorpay_payment_id,
      signature: checkout.razorpay_signature,
      amount: order.bill.grandTotal,
      currency: 'INR',
    });
    expect(result).toMatchObject({ type: 'payment.captured', providerPaymentId: rzpPayment.id });
  });

  it('does not place an order whose captured amount differs', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment, checkout } = ctx.sim.pay(payment.providerOrderId);
    rzpPayment.amount = order.bill.grandTotal - 1;
    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'amount_mismatch' });
    expect(await ctx.store.getOrder(order.id)).toMatchObject({
      status: 'pending_payment',
      needsReview: true,
    });
  });

  it('marks a declined attempt as failed and lets the customer pay again', async () => {
    const ctx = razorpaySetup();
    const { order, payment } = await placedWithRazorpay(ctx);
    const declined = ctx.sim.webhook('payment.failed', ctx.sim.decline(payment.providerOrderId));
    expect(
      (await ctx.service.handleWebhook('razorpay', declined.rawBody, declined.headers)).body
        .outcome,
    ).toBe('payment_failed');
    expect((await ctx.store.getOrder(order.id))!.status).toBe('payment_failed');

    // "Try paying again" reuses the same Razorpay order; no new one is created.
    const ordersCreated = ctx.sim.orders.size;
    expect(await ctx.service.startPayment(ASHA, { orderId: order.id })).toEqual(payment);
    expect(ctx.sim.orders.size).toBe(ordersCreated);
    const { checkout } = ctx.sim.pay(payment.providerOrderId);
    expect(await confirm(ctx, order.id, checkout)).toEqual({ outcome: 'placed' });
    expect((await ctx.store.getOrder(order.id))!.statusHistory.map((s) => s.status)).toEqual([
      'pending_payment',
      'payment_failed',
      'placed',
    ]);
    // The failure report for the first attempt arriving late changes nothing.
    expect(
      (await ctx.service.handleWebhook('razorpay', declined.rawBody, declined.headers)).body
        .outcome,
    ).toBe('duplicate_event');
  });
});

describe('Razorpay webhooks: tampering and replays', () => {
  it('rejects tampered webhooks and records nothing', async () => {
    const ctx = razorpaySetup();
    const { payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment } = ctx.sim.pay(payment.providerOrderId);
    const hook = ctx.sim.webhook('payment.captured', rzpPayment);
    const forged = ctx.sim.webhook('payment.captured', rzpPayment, {
      secret: 'not-the-webhook-secret',
    });
    for (const [body, headers] of [
      [hook.rawBody.replace(`"amount":${rzpPayment.amount}`, '"amount":100'), hook.headers],
      [forged.rawBody, forged.headers],
      [hook.rawBody, { 'content-type': 'application/json' }],
    ] as const) {
      expect((await ctx.service.handleWebhook('razorpay', body, headers)).status).toBe(400);
    }
    expect(ctx.store.snapshot().webhookEvents).toEqual({});
    expect(ctx.store.snapshot().payments).toEqual([]);
  });

  it('skips a replayed webhook, even with a forged x-razorpay-event-id header', async () => {
    const ctx = razorpaySetup();
    const { payment } = await placedWithRazorpay(ctx);
    const { payment: rzpPayment } = ctx.sim.pay(payment.providerOrderId);
    const hook = ctx.sim.webhook('payment.captured', rzpPayment);
    const send = (headers: Record<string, string>) =>
      ctx.service.handleWebhook('razorpay', hook.rawBody, headers);
    expect((await send(hook.headers)).body.outcome).toBe('placed');
    expect((await send(hook.headers)).body.outcome).toBe('duplicate_event');
    expect(
      (await send({ ...hook.headers, 'x-razorpay-event-id': 'evt_SomethingNew01' })).body.outcome,
    ).toBe('duplicate_event');
    // Days later, the same genuine message is refused outright.
    ctx.advance(4 * 24 * 3600);
    expect((await send(hook.headers)).status).toBe(400);
    expect(ctx.store.snapshot().payments).toHaveLength(1);
  });

  it('routes webhooks by provider and refuses providers that are not configured', async () => {
    const ctx = razorpaySetup();
    for (const provider of ['stripe', 'fake', 'paypal', 'constructor', '__proto__']) {
      expect((await ctx.service.handleWebhook(provider, '{}', {})).status).toBe(404);
    }
  });
});

describe('checkout retries with Razorpay', () => {
  it('returns the same order and Razorpay order for a repeated checkout', async () => {
    const ctx = razorpaySetup();
    const cart = ctx.cart();
    const first = await ctx.service.placeOrder(ASHA, cart);
    const second = await ctx.service.placeOrder(ASHA, cart);
    expect(second).toEqual(first);
    expect(ctx.sim.orders.size).toBe(1);
  });

  it('survives Razorpay being unreachable: the retry creates the payment', async () => {
    const ctx = razorpaySetup();
    const cart = ctx.cart();
    ctx.sim.down = true;
    await expect(ctx.service.placeOrder(ASHA, cart)).rejects.toMatchObject({ code: 'unavailable' });
    ctx.sim.down = false;
    const retry = await ctx.service.placeOrder(ASHA, cart);
    if (!retry.ok) throw new Error(retry.error);
    expect(Object.keys(ctx.store.snapshot().orders)).toEqual([retry.orderId]);
    expect((await ctx.store.getOrder(retry.orderId))!.providerOrderId).toBe(
      retry.payment.providerOrderId,
    );
  });

  it('gives concurrent retries the same Razorpay order', async () => {
    const ctx = razorpaySetup();
    ctx.sim.down = true;
    const cart = ctx.cart();
    await expect(ctx.service.placeOrder(ASHA, cart)).rejects.toThrow();
    ctx.sim.down = false;
    const orderId = Object.keys(ctx.store.snapshot().orders)[0]!;
    const starts = await Promise.all(
      [1, 2, 3].map(() => ctx.service.startPayment(ASHA, { orderId })),
    );
    const stored = (await ctx.store.getOrder(orderId))!.providerOrderId;
    expect(starts.map((s) => s.providerOrderId)).toEqual([stored, stored, stored]);
  });

  it('tells the customer when the same checkout was already paid or has expired', async () => {
    const ctx = razorpaySetup();
    const cart = ctx.cart();
    const first = await ctx.service.placeOrder(ASHA, cart);
    if (!first.ok) throw new Error(first.error);
    const { checkout } = ctx.sim.pay(first.payment.providerOrderId);
    await confirm(ctx, first.orderId, checkout);
    expect(await ctx.service.placeOrder(ASHA, cart)).toEqual({ ok: false, error: 'ALREADY_PAID' });
    await expect(ctx.service.startPayment(ASHA, { orderId: first.orderId })).rejects.toMatchObject({
      code: 'failed-precondition',
    });

    const unpaid = ctx.cart();
    await ctx.service.placeOrder(ASHA, unpaid);
    ctx.advance(31 * 60);
    await expireUnpaidOrders(ctx.store, { now: ctx.now() });
    expect(await ctx.service.placeOrder(ASHA, unpaid)).toEqual({
      ok: false,
      error: 'CHECKOUT_EXPIRED',
    });
  });
});
