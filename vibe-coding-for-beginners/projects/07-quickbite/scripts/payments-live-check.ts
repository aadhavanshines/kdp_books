#!/usr/bin/env -S pnpm exec tsx
/**
 * Checks QuickBite's payment gateways against the REAL Razorpay and Stripe
 * APIs in TEST mode, with your own test keys. Run it on your own computer:
 *
 *   pnpm payments:check                 API checks (creates test orders / payments)
 *   pnpm payments:check --browser       + pay a ₹1 Razorpay test order in your browser,
 *                                         then verify Checkout's real signature
 *   pnpm payments:check --webhooks      + receive real webhooks and verify their signatures
 *
 * Keys come from the environment, or from .env.payments.local (git-ignored):
 *
 *   RAZORPAY_KEY_ID=rzp_test_…   RAZORPAY_KEY_SECRET=…   RAZORPAY_WEBHOOK_SECRET=…
 *   STRIPE_SECRET_KEY=sk_test_…  STRIPE_PUBLISHABLE_KEY=pk_test_…  STRIPE_WEBHOOK_SECRET=whsec_…
 *   LIVE_CHECK_STRIPE_CURRENCY=USD   (optional; a currency your Stripe account can charge)
 *   LIVE_CHECK_PORT=8787             (optional; for --browser and --webhooks)
 *
 * Either provider may be left out. The script refuses to run if any live key
 * is present: it only ever moves test money.
 *
 * It uses the same gateway classes as the Cloud Functions and Edge Functions
 * (packages/server), so a pass here means the deployed code talks to the
 * providers correctly.
 */
import { createServer, type IncomingMessage } from 'node:http';
import { existsSync } from 'node:fs';
import {
  basicAuth,
  PaymentVerificationError,
  ProviderApiError,
  RAZORPAY_API_BASE,
  RazorpayGateway,
  STRIPE_API_BASE,
  STRIPE_API_VERSION,
  StripeGateway,
  type PaymentGateway,
} from '@quickbite/server';

const args = new Set(process.argv.slice(2));
const BROWSER = args.has('--browser');
const WEBHOOKS = args.has('--webhooks');
const ENV_FILE = '.env.payments.local';
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
const env = process.env;
const PORT = Number(env.LIVE_CHECK_PORT ?? 8787);

// ---- Output ------------------------------------------------------------------
let failures = 0;
const pass = (what: string, detail = '') =>
  console.log(`  ✔ ${what}${detail ? `  (${detail})` : ''}`);
const fail = (what: string, detail: unknown) => {
  failures++;
  console.log(`  ✘ ${what}\n      ${detail instanceof Error ? detail.message : String(detail)}`);
};
async function check(what: string, work: () => Promise<string | void>) {
  try {
    const detail = await work();
    pass(what, detail ?? '');
  } catch (error) {
    fail(what, error);
  }
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// ---- Safety: test keys only --------------------------------------------------
const LIVE = /^(rzp_live_|sk_live_|rk_live_|pk_live_)/;
const live = Object.entries(env).filter(
  ([name, value]) => /^(RAZORPAY|STRIPE)_/.test(name) && LIVE.test(value ?? ''),
);
if (live.length > 0) {
  console.error(
    `Refusing to run: live keys found in ${live.map(([n]) => n).join(', ')}. Use TEST keys only.`,
  );
  process.exit(2);
}

const runId = `lc${Date.now().toString(36)}`;
const razorpay = setUpRazorpay();
const stripe = setUpStripe();
if (!razorpay && !stripe) {
  console.error(
    `No keys found. Set the Razorpay and/or Stripe TEST keys in the environment or ${ENV_FILE}.`,
  );
  process.exit(2);
}

function setUpRazorpay() {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = env;
  if (!keyId && !keySecret) return null;
  if (!keyId?.startsWith('rzp_test_') || !keySecret) {
    console.error('RAZORPAY_KEY_ID must be an rzp_test_ key, with RAZORPAY_KEY_SECRET.');
    process.exit(2);
  }
  // The webhook secret is only needed for --webhooks; a placeholder keeps the gateway happy.
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || 'not-configured';
  return { gateway: new RazorpayGateway({ keyId, keySecret, webhookSecret }), keyId, keySecret };
}

function setUpStripe() {
  const { STRIPE_SECRET_KEY: secretKey, STRIPE_PUBLISHABLE_KEY: publishableKey } = env;
  if (!secretKey && !publishableKey) return null;
  if (!/^(sk|rk)_test_/.test(secretKey ?? '') || !publishableKey?.startsWith('pk_test_')) {
    console.error(
      'STRIPE_SECRET_KEY must be sk_test_/rk_test_ and STRIPE_PUBLISHABLE_KEY pk_test_.',
    );
    process.exit(2);
  }
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || 'whsec_not_configured';
  return {
    gateway: new StripeGateway({ secretKey: secretKey!, publishableKey, webhookSecret }),
    secretKey: secretKey!,
    currency: (env.LIVE_CHECK_STRIPE_CURRENCY ?? 'USD').toUpperCase(),
  };
}

// ---- Razorpay ----------------------------------------------------------------
async function razorpayChecks(rzp: NonNullable<typeof razorpay>) {
  console.log('\nRazorpay (test mode)');
  const orderId = `${runId}_rzp`;
  let razorpayOrderId = '';

  await check('creates a ₹1.00 order through RazorpayGateway.createPayment', async () => {
    const start = await rzp.gateway.createPayment({ orderId, amount: 100, currency: 'INR' });
    assert(start.provider === 'razorpay', 'wrong provider');
    assert(/^order_/.test(start.providerOrderId), `unexpected id ${start.providerOrderId}`);
    assert(start.keyId === rzp.keyId, 'key id not returned for Checkout');
    razorpayOrderId = start.providerOrderId;
    return razorpayOrderId;
  });

  await check('Razorpay stored the order exactly as sent', async () => {
    assert(razorpayOrderId, 'no order was created');
    const res = await fetch(`${RAZORPAY_API_BASE}/orders/${razorpayOrderId}`, {
      headers: { authorization: basicAuth(rzp.keyId, rzp.keySecret) },
    });
    const order = (await res.json()) as Record<string, unknown> & {
      notes?: Record<string, string>;
    };
    assert(res.ok, `GET /orders failed: ${JSON.stringify(order)}`);
    assert(
      order.amount === 100 && order.currency === 'INR',
      `amount ${order.amount} ${order.currency}`,
    );
    assert(order.status === 'created', `status ${order.status}`);
    assert(order.receipt === orderId, `receipt ${order.receipt}`);
    assert(order.notes?.quickbite_order_id === orderId, 'notes.quickbite_order_id missing');
    return `status ${order.status}`;
  });

  await check('a wrong key secret is refused with a readable error', async () => {
    const wrong = new RazorpayGateway({ keyId: rzp.keyId, keySecret: 'wrong', webhookSecret: 'x' });
    try {
      await wrong.createPayment({ orderId: `${orderId}_x`, amount: 100, currency: 'INR' });
    } catch (error) {
      assert(error instanceof ProviderApiError && error.status === 401, String(error));
      return error.message;
    }
    throw new Error('Razorpay accepted a wrong secret');
  });

  await check('amounts below ₹1 are refused (Razorpay’s minimum)', async () => {
    try {
      await rzp.gateway.createPayment({ orderId: `${orderId}_min`, amount: 99, currency: 'INR' });
    } catch (error) {
      assert(error instanceof ProviderApiError && error.status === 400, String(error));
      return error.message;
    }
    throw new Error('Razorpay accepted 99 paise');
  });

  await check('an unknown payment id is reported as a provider error', async () => {
    try {
      await rzp.gateway.fetchPayment('pay_DoesNotExist00');
    } catch (error) {
      // Razorpay's own error, not a proxy or network failure.
      assert(
        error instanceof ProviderApiError &&
          (error.status === 400 || error.status === 404) &&
          error.code === 'BAD_REQUEST_ERROR',
        String(error),
      );
      return error.message;
    }
    throw new Error('Razorpay returned a payment for a made-up id');
  });

  await check('a forged Checkout signature is refused before Razorpay is asked', async () => {
    try {
      await rzp.gateway.settleCheckoutPayment({
        providerOrderId: razorpayOrderId,
        paymentId: 'pay_DoesNotExist00',
        signature: '0'.repeat(64),
        amount: 100,
        currency: 'INR',
      });
    } catch (error) {
      assert(error instanceof PaymentVerificationError, String(error));
      return 'refused';
    }
    throw new Error('a forged signature was accepted');
  });

  return razorpayOrderId;
}

// ---- Stripe ------------------------------------------------------------------
/** The PaymentIntent fields (or error) this script looks at. */
interface StripeBody {
  livemode?: boolean;
  status?: string;
  amount_received?: number;
  metadata?: Record<string, string>;
  error?: { code?: string; message?: string };
}

async function stripeApi(secretKey: string, path: string, form: Record<string, string>) {
  const res = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
      'stripe-version': STRIPE_API_VERSION,
    },
    body: new URLSearchParams(form).toString(),
  });
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) as StripeBody };
  } catch {
    throw new Error(`Stripe answered ${res.status} with non-JSON: ${text.slice(0, 120)}`);
  }
}

async function stripeChecks(st: NonNullable<typeof stripe>) {
  console.log(`\nStripe (test mode, ${st.currency})`);
  const orderId = `${runId}_stripe`;
  let intentId = '';
  let clientSecret = '';

  await check('creates a PaymentIntent through StripeGateway.createPayment', async () => {
    const start = await st.gateway.createPayment({ orderId, amount: 100, currency: st.currency });
    assert(start.provider === 'stripe', 'wrong provider');
    assert(/^pi_/.test(start.providerOrderId), `unexpected id ${start.providerOrderId}`);
    assert(start.clientSecret.startsWith(`${start.providerOrderId}_secret_`), 'odd client secret');
    intentId = start.providerOrderId;
    clientSecret = start.clientSecret;
    return intentId;
  });

  await check(
    'a repeated create for the same order returns the same intent (Idempotency-Key)',
    async () => {
      const again = await st.gateway.createPayment({ orderId, amount: 100, currency: st.currency });
      assert(again.providerOrderId === intentId, `${again.providerOrderId} ≠ ${intentId}`);
    },
  );

  await check('resumePayment fetches the same client secret for a retry', async () => {
    const resumed = await st.gateway.resumePayment({
      providerOrderId: intentId,
      amount: 100,
      currency: st.currency,
    });
    assert(resumed.provider === 'stripe' && resumed.clientSecret === clientSecret, 'mismatch');
  });

  await check('a test card payment succeeds and collects the full amount', async () => {
    const { status, body } = await stripeApi(st.secretKey, `/payment_intents/${intentId}/confirm`, {
      payment_method: 'pm_card_visa',
      return_url: 'https://example.com/quickbite-live-check',
    });
    assert(status === 200, `confirm failed: ${JSON.stringify(body.error ?? body)}`);
    assert(body.livemode === false, 'not a test-mode intent');
    assert(body.status === 'succeeded', `status ${body.status}`);
    assert(body.amount_received === 100, `amount_received ${body.amount_received}`);
    assert(body.metadata?.quickbite_order_id === orderId, 'metadata.quickbite_order_id missing');
    return `${body.status}, amount_received ${body.amount_received}`;
  });

  await check('a declined test card leaves the intent ready for another attempt', async () => {
    const start = await st.gateway.createPayment({
      orderId: `${orderId}_declined`,
      amount: 100,
      currency: st.currency,
    });
    const { status, body } = await stripeApi(
      st.secretKey,
      `/payment_intents/${start.providerOrderId}/confirm`,
      { payment_method: 'pm_card_chargeDeclined', return_url: 'https://example.com/x' },
    );
    assert(status === 402, `expected 402, got ${status}`);
    assert(body.error?.code === 'card_declined', `code ${body.error?.code}`);
    const retry = await st.gateway.resumePayment({
      providerOrderId: start.providerOrderId,
      amount: 100,
      currency: st.currency,
    });
    assert(retry.provider === 'stripe', 'retry failed');
    return body.error.message;
  });

  await check('a wrong secret key is refused with a readable error', async () => {
    const wrong = new StripeGateway({
      secretKey: 'sk_test_wrong',
      publishableKey: 'pk_test_x',
      webhookSecret: 'whsec_x',
    });
    try {
      await wrong.createPayment({ orderId: `${orderId}_x`, amount: 100, currency: st.currency });
    } catch (error) {
      assert(error instanceof ProviderApiError && error.status === 401, String(error));
      return error.message;
    }
    throw new Error('Stripe accepted a wrong key');
  });
}

// ---- Local server for --browser and --webhooks --------------------------------
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const json = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

function checkoutPage(keyId: string, razorpayOrderId: string) {
  return `<!doctype html><meta charset="utf-8"><title>QuickBite Razorpay live check</title>
<body style="font-family:system-ui;max-width:36rem;margin:3rem auto;padding:0 1rem">
<h1>Razorpay test payment</h1>
<p>Pays the ₹1.00 test order <code>${razorpayOrderId}</code>. Use a Razorpay <b>test</b>
card or UPI id (see Razorpay's test-mode documentation); no real money moves.</p>
<button id="pay" style="font-size:1.1rem;padding:.6rem 1.2rem">Pay ₹1.00 (test)</button>
<pre id="out" style="white-space:pre-wrap"></pre>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
const out = document.getElementById('out');
const rzp = new Razorpay({
  key: ${json(keyId)}, order_id: ${json(razorpayOrderId)}, amount: 100, currency: 'INR',
  name: 'QuickBite live check',
  handler: async (response) => {
    out.textContent = 'Verifying on the server…';
    const res = await fetch('/verify', { method: 'POST', body: JSON.stringify(response) });
    out.textContent = await res.text();
  },
});
rzp.on('payment.failed', (f) => { out.textContent = 'Attempt failed: ' + f.error.description; });
document.getElementById('pay').onclick = () => rzp.open();
</script>`;
}

function startServer(razorpayOrderId: string) {
  const gateways: Record<string, PaymentGateway | undefined> = {
    razorpay: razorpay?.gateway,
    stripe: stripe?.gateway,
  };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    try {
      if (req.method === 'GET' && url.pathname === '/' && razorpay && razorpayOrderId) {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(checkoutPage(razorpay.keyId, razorpayOrderId));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/verify' && razorpay) {
        const response = JSON.parse(await readBody(req)) as Record<string, string>;
        let message: string;
        try {
          const event = await razorpay.gateway.settleCheckoutPayment({
            providerOrderId: razorpayOrderId,
            paymentId: response.razorpay_payment_id ?? '',
            signature: response.razorpay_signature ?? '',
            amount: 100,
            currency: 'INR',
          });
          if (event) {
            pass(
              'Checkout’s real signature verified and the payment is captured',
              event.providerPaymentId,
            );
            message = `PASS: signature verified, payment ${event.providerPaymentId} captured (${event.amount} ${event.currency}).`;
          } else {
            pass('Checkout’s real signature verified (payment not captured yet)');
            message = 'PASS: signature verified; Razorpay has not captured the payment yet.';
          }
        } catch (error) {
          fail('verifying the real Checkout response', error);
          message = `FAIL: ${(error as Error).message}`;
        }
        res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
        res.end(message);
        return;
      }
      const hook = /^\/webhooks\/(razorpay|stripe)$/.exec(url.pathname);
      if (req.method === 'POST' && hook) {
        const gateway = gateways[hook[1]!];
        const raw = await readBody(req);
        if (!gateway) {
          res.writeHead(404).end();
          return;
        }
        try {
          const event = await gateway.verifyWebhook(raw, req.headers, new Date());
          const type = JSON.parse(raw) as { event?: string; type?: string };
          pass(
            `${hook[1]} webhook signature verified: ${type.event ?? type.type}`,
            event
              ? `${event.type} ${event.providerOrderId} ${event.amount} ${event.currency}`
              : 'not used by QuickBite',
          );
          res.writeHead(200, { 'content-type': 'application/json' }).end('{"received":true}');
        } catch (error) {
          fail(`${hook[1]} webhook rejected`, error);
          res.writeHead(400).end();
        }
        return;
      }
      res.writeHead(404).end();
    } catch (error) {
      fail('local server', error);
      res.writeHead(500).end();
    }
  });
  server.listen(PORT, '127.0.0.1');
  return server;
}

// ---- Run ---------------------------------------------------------------------
console.log(`QuickBite payments live check (${runId}) — TEST keys only`);
const razorpayOrderId = razorpay ? await razorpayChecks(razorpay) : '';
if (stripe) await stripeChecks(stripe);

if (BROWSER || WEBHOOKS) {
  startServer(razorpayOrderId);
  console.log(`\nListening on http://localhost:${PORT} (Ctrl+C to finish)`);
  if (BROWSER && razorpay && razorpayOrderId) {
    console.log(`  Open http://localhost:${PORT} and pay the ₹1.00 test order.`);
  }
  if (WEBHOOKS) {
    if (stripe) {
      console.log(
        `  Stripe: stripe listen --forward-to localhost:${PORT}/webhooks/stripe\n` +
          '          (put the whsec_… it prints in STRIPE_WEBHOOK_SECRET, restart this script,\n' +
          '          then the test payments above produce payment_intent.* events)',
      );
    }
    if (razorpay) {
      console.log(
        `  Razorpay: expose localhost:${PORT} with a tunnel (e.g. cloudflared or ngrok), add\n` +
          '          <tunnel URL>/webhooks/razorpay as a TEST-mode webhook in the Dashboard with\n' +
          '          RAZORPAY_WEBHOOK_SECRET, subscribe to payment.captured, payment.failed and\n' +
          '          order.paid, then pay with --browser.',
      );
    }
  }
  process.on('SIGINT', () => {
    console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
    process.exit(failures ? 1 : 0);
  });
} else {
  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}
