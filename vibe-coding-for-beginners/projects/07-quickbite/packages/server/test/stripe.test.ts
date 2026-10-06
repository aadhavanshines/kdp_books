/**
 * Stripe end to end, offline: the gateway's HTTP calls go to a simulator of
 * Stripe's API, and Stripe's webhooks are signed by the simulator.
 */
import { describe, expect, it } from 'vitest';
import { RazorpayGateway } from '../src/gateways/razorpay';
import { StripeGateway } from '../src/gateways/stripe';
import { ASHA, catalog, catalogWithProvider, placed, setup } from '../src/testSetup';
import {
  RAZORPAY_TEST_KEYS,
  RazorpaySimulator,
  STRIPE_TEST_KEYS,
  StripeSimulator,
} from './providerSimulators';

/** A region whose paymentProvider is Stripe (like a future UK region), with both providers configured. */
function stripeSetup(options: { regionStripe?: boolean } = {}) {
  const sim = new StripeSimulator();
  const stripe = new StripeGateway({ ...STRIPE_TEST_KEYS, fetch: sim.fetch });
  const razorpay = new RazorpayGateway({
    ...RAZORPAY_TEST_KEYS,
    fetch: new RazorpaySimulator().fetch,
  });
  const ctx = setup({
    gateways: { stripe, razorpay },
    catalog: options.regionStripe === false ? catalog : catalogWithProvider('stripe'),
  });
  sim.now = () => Math.floor(ctx.now().getTime() / 1000);
  return { ...ctx, sim, stripe };
}

type Ctx = ReturnType<typeof stripeSetup>;

async function placedWithStripe(ctx: Ctx, overrides = {}) {
  const { result, order } = await placed(ctx, overrides);
  if (result.payment.provider !== 'stripe') throw new Error('expected Stripe');
  return { order, payment: result.payment };
}

const deliver = (ctx: Ctx, hook: { rawBody: string; headers: Record<string, string> }) =>
  ctx.service.handleWebhook('stripe', hook.rawBody, hook.headers);

describe('StripeGateway HTTP calls', () => {
  it('creates a PaymentIntent (form-encoded, idempotent, pinned API version)', async () => {
    const { sim, stripe } = stripeSetup();
    const start = await stripe.createPayment({
      orderId: 'ord_abc123',
      amount: 1_250,
      currency: 'GBP',
    });
    const intent = sim.intents.get(start.providerOrderId)!;
    expect(start).toEqual({
      provider: 'stripe',
      providerOrderId: expect.stringMatching(/^pi_/),
      amount: 1_250,
      currency: 'GBP',
      publishableKey: STRIPE_TEST_KEYS.publishableKey,
      clientSecret: intent.client_secret,
    });
    const [request] = sim.requests;
    expect(request).toMatchObject({
      method: 'POST',
      url: 'https://api.stripe.com/v1/payment_intents',
      headers: {
        authorization: `Bearer ${STRIPE_TEST_KEYS.secretKey}`,
        'content-type': 'application/x-www-form-urlencoded',
        'idempotency-key': 'quickbite-order-ord_abc123',
        'stripe-version': '2026-09-30.endive',
      },
    });
    expect(Object.fromEntries(new URLSearchParams(request!.body))).toEqual({
      amount: '1250',
      currency: 'gbp',
      'automatic_payment_methods[enabled]': 'true',
      description: 'QuickBite order ord_abc123',
      'metadata[quickbite_order_id]': 'ord_abc123',
    });

    // A retried create for the same order gets the same intent back.
    const again = await stripe.createPayment({
      orderId: 'ord_abc123',
      amount: 1_250,
      currency: 'GBP',
    });
    expect(again.providerOrderId).toBe(start.providerOrderId);
    expect(sim.intents.size).toBe(1);
  });

  it('fetches the client secret again for a retry, and reports Stripe errors', async () => {
    const { sim, stripe } = stripeSetup();
    const start = await stripe.createPayment({ orderId: 'o1', amount: 500, currency: 'GBP' });
    if (start.provider !== 'stripe') throw new Error();
    expect(
      await stripe.resumePayment({
        providerOrderId: start.providerOrderId,
        amount: 500,
        currency: 'GBP',
      }),
    ).toEqual(start);
    expect(sim.requests.at(-1)).toMatchObject({ method: 'GET' });
    await expect(
      stripe.resumePayment({
        providerOrderId: start.providerOrderId,
        amount: 501,
        currency: 'GBP',
      }),
    ).rejects.toMatchObject({ code: 'unexpected_response' });
    await expect(
      stripe.resumePayment({ providerOrderId: 'pi_missing', amount: 1, currency: 'GBP' }),
    ).rejects.toMatchObject({ status: 404, code: 'resource_missing' });
    const wrongKey = new StripeGateway({
      ...STRIPE_TEST_KEYS,
      secretKey: 'sk_test_wrong',
      fetch: sim.fetch,
    });
    await expect(
      wrongKey.createPayment({ orderId: 'o', amount: 1, currency: 'GBP' }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'invalid_request_error',
    });
  });
});

describe('choosing the provider per region', () => {
  it('uses Stripe for a Stripe region and Razorpay for India', async () => {
    const abroad = stripeSetup();
    expect((await placed(abroad)).order.paymentProvider).toBe('stripe');
    const india = stripeSetup({ regionStripe: false });
    expect((await placed(india)).order.paymentProvider).toBe('razorpay');
  });

  it('honours test-mode region overrides', async () => {
    const sim = new StripeSimulator();
    const ctx = setup({
      gateways: {
        stripe: new StripeGateway({ ...STRIPE_TEST_KEYS, fetch: sim.fetch }),
        razorpay: new RazorpayGateway({
          ...RAZORPAY_TEST_KEYS,
          fetch: new RazorpaySimulator().fetch,
        }),
      },
      regionProviders: { IN: 'stripe' },
    });
    expect((await placed(ctx)).order.paymentProvider).toBe('stripe');
  });

  it('refuses to take an order when the region’s provider is not configured', async () => {
    const ctx = setup({
      gateways: {
        razorpay: new RazorpayGateway({
          ...RAZORPAY_TEST_KEYS,
          fetch: new RazorpaySimulator().fetch,
        }),
      },
      catalog: catalogWithProvider('stripe'),
    });
    expect(await ctx.service.placeOrder(ASHA, ctx.cart())).toEqual({
      ok: false,
      error: 'PAYMENTS_UNAVAILABLE',
    });
    expect(ctx.store.snapshot().orders).toEqual({});
  });

  it('fake mode pays every region with the fake provider', async () => {
    const ctx = setup({ catalog: catalogWithProvider('stripe') });
    expect((await placed(ctx)).order.paymentProvider).toBe('fake');
  });
});

describe('paying with Stripe', () => {
  it('places the order only from a verified payment_intent.succeeded', async () => {
    const ctx = stripeSetup();
    const { order, payment } = await placedWithStripe(ctx, { couponCode: 'WELCOME50' });
    expect(payment.amount).toBe(order.bill.grandTotal);
    expect(ctx.sim.intents.get(payment.providerOrderId)).toMatchObject({
      amount: order.bill.grandTotal,
      currency: 'inr',
      metadata: { quickbite_order_id: order.id },
    });

    const hook = ctx.sim.succeed(payment.providerOrderId);
    expect(await deliver(ctx, hook)).toEqual({
      status: 200,
      body: { received: true, outcome: 'placed' },
    });
    expect(await ctx.store.getOrder(order.id)).toMatchObject({
      status: 'placed',
      paymentStatus: 'paid',
      providerPaymentId: payment.providerOrderId,
    });
    expect(ctx.store.snapshot().payments).toMatchObject([
      { provider: 'stripe', status: 'captured', eventId: hook.event.id },
    ]);
    expect(ctx.store.snapshot().redemptions).toHaveLength(1);
  });

  it('skips a replay inside the window and refuses one after it', async () => {
    const ctx = stripeSetup();
    const { payment } = await placedWithStripe(ctx);
    const hook = ctx.sim.succeed(payment.providerOrderId);
    expect((await deliver(ctx, hook)).body.outcome).toBe('placed');
    ctx.advance(60);
    expect((await deliver(ctx, hook)).body.outcome).toBe('duplicate_event');
    ctx.advance(300);
    expect(await deliver(ctx, hook)).toMatchObject({ status: 400 });
    expect(ctx.store.snapshot().payments).toHaveLength(1);
  });

  it.each([
    ['less collected than the total', (total: number) => ({ amountReceived: total - 1 })],
    ['another currency', () => ({ currency: 'usd' })],
  ])('does not place the order when Stripe reports %s', async (_label, change) => {
    const ctx = stripeSetup();
    const { order, payment } = await placedWithStripe(ctx);
    const hook = ctx.sim.succeed(payment.providerOrderId, change(order.bill.grandTotal));
    expect((await deliver(ctx, hook)).body.outcome).toBe('amount_mismatch');
    expect(await ctx.store.getOrder(order.id)).toMatchObject({
      status: 'pending_payment',
      needsReview: true,
    });
  });

  it('marks a declined card as failed, then accepts a later success on the same intent', async () => {
    const ctx = stripeSetup();
    const { order, payment } = await placedWithStripe(ctx);
    expect((await deliver(ctx, ctx.sim.decline(payment.providerOrderId))).body.outcome).toBe(
      'payment_failed',
    );
    expect((await ctx.store.getOrder(order.id))!.status).toBe('payment_failed');

    const retry = await ctx.service.startPayment(ASHA, { orderId: order.id });
    expect(retry).toEqual(payment);
    expect(ctx.sim.intents.size).toBe(1);
    expect((await deliver(ctx, ctx.sim.succeed(payment.providerOrderId))).body.outcome).toBe(
      'placed',
    );
  });

  it('rejects tampered, forged and wrong-mode events, and ignores unrelated ones', async () => {
    const ctx = stripeSetup();
    const { order, payment } = await placedWithStripe(ctx);
    const intent = ctx.sim.intents.get(payment.providerOrderId)!;
    const hook = ctx.sim.succeed(payment.providerOrderId);
    const rejected = [
      {
        rawBody: hook.rawBody.replace(
          `"amount_received": ${order.bill.grandTotal}`,
          '"amount_received": 100',
        ),
        headers: hook.headers,
      },
      ctx.sim.webhook('payment_intent.succeeded', intent, { secret: 'whsec_someone_else' }),
      ctx.sim.webhook('payment_intent.succeeded', intent, { livemode: true }),
      ctx.sim.webhook('payment_intent.succeeded', intent, { timestamp: ctx.sim.now() - 301 }),
      { rawBody: hook.rawBody, headers: {} },
    ];
    for (const bad of rejected) expect((await deliver(ctx, bad)).status).toBe(400);
    expect(ctx.store.snapshot().webhookEvents).toEqual({});

    const unrelated = ctx.sim.webhook('payment_intent.created', intent);
    expect((await deliver(ctx, unrelated)).body).toEqual({ received: true, outcome: 'ignored' });
    expect((await ctx.store.getOrder(order.id))!.status).toBe('pending_payment');
  });

  it('acknowledges events for intents it does not know', async () => {
    const ctx = stripeSetup();
    const start = await ctx.stripe.createPayment({
      orderId: 'elsewhere',
      amount: 100,
      currency: 'INR',
    });
    expect((await deliver(ctx, ctx.sim.succeed(start.providerOrderId))).body.outcome).toBe(
      'unknown_order',
    );
  });
});
