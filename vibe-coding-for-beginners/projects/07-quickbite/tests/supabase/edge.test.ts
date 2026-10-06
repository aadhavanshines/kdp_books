/**
 * The Edge Function handlers as HTTP: what the browser, the payment provider
 * and pg_cron see. Runs the handlers on Node against real PostgreSQL; the
 * deployed functions serve these same handlers on Deno.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FetchLike } from '@quickbite/server';
import {
  RAZORPAY_TEST_KEYS,
  RazorpaySimulator,
  STRIPE_TEST_KEYS,
  StripeSimulator,
} from '../../packages/server/test/providerSimulators';
import { createEdgeHandlers, type EdgeHandlers, type Env } from '../../supabase/server/edge';
import { PostgresOrderStore } from '../../supabase/server/postgresStore';
import { postgresJs } from '../../supabase/server/sql';
import { cart, connect, createAddress, createUser, type Client } from './db';

let db: Client;
let asha: string;
let ravi: string;
let meera: string;
let home: string;
let meeraHome: string;

const LOCAL: Env = {
  SUPABASE_URL: 'http://127.0.0.1:54321',
  CRON_SECRET: 'a-cron-secret-for-tests',
};

function handlers(env: Env = LOCAL, providerFetch?: FetchLike): EdgeHandlers {
  const tokens: Record<string, string> = {
    'token-asha': asha,
    'token-ravi': ravi,
    'token-meera': meera,
  };
  const h: EdgeHandlers = createEdgeHandlers({
    store: new PostgresOrderStore(postgresJs(db)),
    env,
    authenticate: async (req) =>
      tokens[(req.headers.get('authorization') ?? '').replace('Bearer ', '')] ?? null,
    // Delivered to the real webhook handler as an HTTP request, like the provider does.
    deliverWebhook: async (rawBody, headers) => {
      const res = await h.paymentWebhook(
        new Request('http://functions/payment-webhook?provider=fake', {
          method: 'POST',
          headers,
          body: rawBody,
        }),
      );
      return { status: res.status, body: await res.json() };
    },
    sleep: async () => undefined,
    providerFetch,
  });
  return h;
}

const post = (body: unknown, token?: string, raw?: string) =>
  new Request('http://functions/fn', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: raw ?? JSON.stringify(body),
  });

beforeAll(async () => {
  db = connect();
  asha = await createUser(db, 'asha');
  ravi = await createUser(db, 'ravi');
  home = await createAddress(db, asha);
  meera = await createUser(db, 'meera');
  meeraHome = await createAddress(db, meera);
});

afterAll(async () => {
  await db?.end();
});

describe('customer functions (quote-order, create-order, fake-pay)', () => {
  it('answer CORS preflights and refuse other methods', async () => {
    const h = handlers();
    const preflight = await h.quoteOrder(new Request('http://f/', { method: 'OPTIONS' }));
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-headers')).toContain('authorization');
    expect((await h.createOrder(new Request('http://f/', { method: 'GET' }))).status).toBe(405);
  });

  it('need a signed-in customer', async () => {
    const h = handlers();
    const res = await h.quoteOrder(post(cart(home)));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: 'unauthenticated', message: 'Please sign in to continue.' },
    });
    expect((await h.createOrder(post(cart(home), 'token-unknown'))).status).toBe(401);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('validate the body', async () => {
    const h = handlers();
    expect((await h.quoteOrder(post(null, 'token-asha', '{not json'))).status).toBe(400);
    const res = await h.createOrder(post({ ...cart(home), items: [] }, 'token-asha'));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('invalid-argument');
  });

  it('quote, create and pay an order end to end', async () => {
    const h = handlers();
    const quote = await (await h.quoteOrder(post(cart(home), 'token-asha'))).json();
    expect(quote).toMatchObject({ ok: true, bill: { currency: 'INR' } });

    const created = (await (await h.createOrder(post(cart(home), 'token-asha'))).json()) as {
      ok: true;
      orderId: string;
      payment: { amount: number };
    };
    expect(created).toMatchObject({ ok: true, payment: { provider: 'fake', currency: 'INR' } });

    // Someone else can't pay (or learn about) Asha's order.
    const intruder = await h.fakePay(
      post({ orderId: created.orderId, outcome: 'success' }, 'token-ravi'),
    );
    expect(intruder.status).toBe(404);

    const paid = await h.fakePay(
      post({ orderId: created.orderId, outcome: 'success' }, 'token-asha'),
    );
    expect(paid.status).toBe(200);
    expect(await paid.json()).toEqual({ outcome: 'placed' });
    const [row] = await db.unsafe<{ status: string; payment_status: string }[]>(
      'select status, payment_status from public.orders where id = $1',
      [created.orderId],
    );
    expect(row).toEqual({ status: 'placed', payment_status: 'paid' });

    // Paying again is refused: the order isn't waiting for payment any more.
    const again = await h.fakePay(
      post({ orderId: created.orderId, outcome: 'success' }, 'token-asha'),
    );
    expect(again.status).toBe(412);
  });

  it('refuse fake payments when live keys are configured, or when the mode isn’t set in production', async () => {
    const live = handlers({ ...LOCAL, RAZORPAY_KEY_ID: 'rzp_live_abc' });
    expect((await live.createOrder(post(cart(home), 'token-asha'))).status).toBe(500);
    const production = handlers({ SUPABASE_URL: 'https://abc.supabase.co' });
    expect((await production.createOrder(post(cart(home), 'token-asha'))).status).toBe(500);
  });
});

describe('payment-webhook', () => {
  it('rejects unsigned or badly signed bodies and unknown providers', async () => {
    const h = handlers();
    const unsigned = await h.paymentWebhook(
      new Request('http://functions/payment-webhook?provider=fake', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_x' }),
      }),
    );
    expect(unsigned.status).toBe(400);
    expect(await unsigned.json()).toMatchObject({ received: false });
    // No provider named: nothing to verify it against.
    expect((await h.paymentWebhook(post({ id: 'evt_x' }))).status).toBe(404);
    // Real providers aren't configured in fake mode.
    for (const provider of ['razorpay', 'stripe']) {
      const res = await h.paymentWebhook(
        new Request(`http://functions/payment-webhook?provider=${provider}`, {
          method: 'POST',
          body: '{}',
        }),
      );
      expect(res.status).toBe(404);
    }
    const unknown = await h.paymentWebhook(
      new Request('http://functions/payment-webhook?provider=paypal', {
        method: 'POST',
        body: '{}',
      }),
    );
    expect(unknown.status).toBe(404);
  });
});

describe('scheduled-jobs', () => {
  it('only runs with the cron secret', async () => {
    const call = (h: EdgeHandlers, secret?: string) =>
      h.scheduledJobs(
        new Request('http://functions/scheduled-jobs', {
          method: 'POST',
          headers: secret ? { 'x-cron-secret': secret } : {},
          body: '{}',
        }),
      );
    expect((await call(handlers({ SUPABASE_URL: LOCAL.SUPABASE_URL }))).status).toBe(503);
    expect((await call(handlers(), 'wrong-secret-value')).status).toBe(401);
    const ok = await call(handlers(), LOCAL.CRON_SECRET);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({
      advanced: expect.any(Number),
      expired: expect.any(Number),
    });
  });
});

describe('real payment providers (test mode)', () => {
  const REAL: Env = {
    ...LOCAL,
    PAYMENTS_MODE: 'real',
    RAZORPAY_KEY_ID: RAZORPAY_TEST_KEYS.keyId,
    RAZORPAY_KEY_SECRET: RAZORPAY_TEST_KEYS.keySecret,
    RAZORPAY_WEBHOOK_SECRET: RAZORPAY_TEST_KEYS.webhookSecret,
    STRIPE_SECRET_KEY: STRIPE_TEST_KEYS.secretKey,
    STRIPE_PUBLISHABLE_KEY: STRIPE_TEST_KEYS.publishableKey,
    STRIPE_WEBHOOK_SECRET: STRIPE_TEST_KEYS.webhookSecret,
  };

  /** Both providers' APIs, offline. */
  function providers() {
    const rzp = new RazorpaySimulator();
    const stripe = new StripeSimulator();
    const fetch: FetchLike = (url, init) =>
      url.startsWith('https://api.razorpay.com/') ? rzp.fetch(url, init) : stripe.fetch(url, init);
    return { rzp, stripe, fetch };
  }

  const webhook = (h: EdgeHandlers, path: string, hook: { rawBody: string; headers: object }) =>
    h.paymentWebhook(
      new Request(`http://functions/${path}`, {
        method: 'POST',
        headers: hook.headers as Record<string, string>,
        body: hook.rawBody,
      }),
    );

  const orderRow = async (id: string) =>
    (
      await db.unsafe<{ status: string; payment_status: string; payment_provider: string }[]>(
        'select status, payment_status, payment_provider from public.orders where id = $1',
        [id],
      )
    )[0];

  it('Razorpay for India: create-order, verify-razorpay, then the webhook is a no-op', async () => {
    const { rzp, fetch } = providers();
    const h = handlers(REAL, fetch);
    const created = (await (await h.createOrder(post(cart(meeraHome), 'token-meera'))).json()) as {
      ok: true;
      orderId: string;
      payment: { provider: string; providerOrderId: string; keyId: string; amount: number };
    };
    expect(created.payment).toMatchObject({
      provider: 'razorpay',
      keyId: RAZORPAY_TEST_KEYS.keyId,
      providerOrderId: expect.stringMatching(/^order_/),
    });
    expect(rzp.orders.get(created.payment.providerOrderId)!.amount).toBe(created.payment.amount);
    // Fake payments are off in real mode.
    expect(
      (await h.fakePay(post({ orderId: created.orderId, outcome: 'success' }, 'token-meera')))
        .status,
    ).toBe(412);

    const { payment, checkout } = rzp.pay(created.payment.providerOrderId);
    const forged = await h.verifyRazorpay(
      post(
        { orderId: created.orderId, ...checkout, razorpay_signature: 'f'.repeat(64) },
        'token-meera',
      ),
    );
    expect(forged.status).toBe(403);
    const other = await h.verifyRazorpay(
      post({ orderId: created.orderId, ...checkout }, 'token-ravi'),
    );
    expect(other.status).toBe(404);
    expect(await orderRow(created.orderId)).toMatchObject({ status: 'pending_payment' });

    const verified = await h.verifyRazorpay(
      post({ orderId: created.orderId, ...checkout }, 'token-meera'),
    );
    expect(verified.status).toBe(200);
    expect(await verified.json()).toEqual({ outcome: 'placed' });
    expect(await orderRow(created.orderId)).toEqual({
      status: 'placed',
      payment_status: 'paid',
      payment_provider: 'razorpay',
    });

    const hook = rzp.webhook('payment.captured', payment);
    const late = await webhook(h, 'payment-webhook?provider=razorpay', hook);
    expect(await late.json()).toEqual({ received: true, outcome: 'duplicate_event' });
    // The provider can also be given as a path segment.
    const byPath = await webhook(h, 'payment-webhook/razorpay', hook);
    expect(await byPath.json()).toEqual({ received: true, outcome: 'duplicate_event' });
    const tampered = await webhook(h, 'payment-webhook?provider=razorpay', {
      ...hook,
      rawBody: hook.rawBody.replace('"captured"', '"failed"'),
    });
    expect(tampered.status).toBe(400);
    const [payments] = await db.unsafe<{ n: number }[]>(
      'select count(*)::int as n from public.payments where order_id = $1',
      [created.orderId],
    );
    expect(payments!.n).toBe(1);
  });

  it('Stripe for a Stripe region: create-order, start-payment, then payment_intent.succeeded', async () => {
    const { stripe, fetch } = providers();
    const h = handlers({ ...REAL, PAYMENTS_REGION_PROVIDERS: 'IN=stripe' }, fetch);
    const created = (await (await h.createOrder(post(cart(meeraHome), 'token-meera'))).json()) as {
      ok: true;
      orderId: string;
      payment: { provider: string; providerOrderId: string; clientSecret: string };
    };
    expect(created.payment).toMatchObject({
      provider: 'stripe',
      publishableKey: STRIPE_TEST_KEYS.publishableKey,
      clientSecret: expect.stringContaining('_secret_'),
    });
    const resumed = await h.startPayment(post({ orderId: created.orderId }, 'token-meera'));
    expect(await resumed.json()).toEqual(created.payment);
    expect((await h.startPayment(post({ orderId: created.orderId }, 'token-ravi'))).status).toBe(
      404,
    );

    const declined = await webhook(
      h,
      'payment-webhook?provider=stripe',
      stripe.decline(created.payment.providerOrderId),
    );
    expect(await declined.json()).toEqual({ received: true, outcome: 'payment_failed' });
    const hook = stripe.succeed(created.payment.providerOrderId);
    const first = await webhook(h, 'payment-webhook?provider=stripe', hook);
    expect(await first.json()).toEqual({ received: true, outcome: 'placed' });
    const replay = await webhook(h, 'payment-webhook?provider=stripe', hook);
    expect(await replay.json()).toEqual({ received: true, outcome: 'duplicate_event' });
    expect(await orderRow(created.orderId)).toMatchObject({
      status: 'placed',
      payment_provider: 'stripe',
    });
    const forged = stripe.webhook(
      'payment_intent.succeeded',
      stripe.intents.get(created.payment.providerOrderId)!,
      {
        secret: 'whsec_not_ours',
      },
    );
    expect((await webhook(h, 'payment-webhook?provider=stripe', forged)).status).toBe(400);
  });

  it('answers 503 when the provider is unreachable, and refuses live keys', async () => {
    const { rzp, fetch } = providers();
    rzp.down = true;
    const h = handlers(REAL, fetch);
    const res = await h.createOrder(post(cart(meeraHome), 'token-meera'));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: { code: 'unavailable' } });

    const live = handlers({ ...REAL, RAZORPAY_KEY_ID: 'rzp_live_abc' }, fetch);
    expect((await live.createOrder(post(cart(meeraHome), 'token-meera'))).status).toBe(500);
  });
});
