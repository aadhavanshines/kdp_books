/**
 * The signature checks, cross-checked against the providers' own code.
 *
 * The official SDKs (stripe-node 23.0.0 and razorpay 2.9.8, test-only dev
 * dependencies) implement each provider's documented algorithm. For every
 * known-good and tampered message here, our Web Crypto implementation must
 * reach the same verdict as the SDK, and signatures made by one must verify
 * with the other.
 */
import { createHmac } from 'node:crypto';
import razorpayUtils from 'razorpay/dist/utils/razorpay-utils.js';
import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { hmacSha256Hex, timingSafeEqual } from '../src/crypto';
import { WebhookVerificationError } from '../src/errors';
import {
  RazorpayGateway,
  razorpayPaymentSignature,
  razorpayWebhookSignature,
} from '../src/gateways/razorpay';
import {
  STRIPE_API_VERSION,
  STRIPE_SIGNATURE_TOLERANCE_SECONDS,
  StripeGateway,
  stripeSignatureHeader,
} from '../src/gateways/stripe';
import {
  RAZORPAY_TEST_KEYS,
  RazorpaySimulator,
  STRIPE_TEST_KEYS,
  StripeSimulator,
} from './providerSimulators';

const { validatePaymentVerification, validateWebhookSignature } = razorpayUtils as {
  validatePaymentVerification: (
    params: { order_id: string; payment_id: string },
    signature: string,
    secret: string,
  ) => boolean;
  validateWebhookSignature: (body: string, signature: string, secret: string) => boolean;
};
const stripeSdk = new Stripe('sk_test_not_used_for_network');

describe('HMAC-SHA256 helper', () => {
  it('matches RFC 4231 test vectors', async () => {
    // Test case 2: key "Jefe".
    expect(await hmacSha256Hex('Jefe', 'what do ya want for nothing?')).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
  });

  it('matches node:crypto on UTF-8 text (₹, emoji, newlines)', async () => {
    for (const message of ['', 'a|b', '₹249.00 Biryani 😋', '{\n  "a": 1\r\n}']) {
      expect(await hmacSha256Hex('whsec_₹secret', message)).toBe(
        createHmac('sha256', 'whsec_₹secret').update(message, 'utf8').digest('hex'),
      );
    }
  });

  it('timingSafeEqual compares exactly', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    for (const other of ['abd', 'ab', 'abcd', 'ABC', '']) {
      expect(timingSafeEqual('abc', other)).toBe(false);
    }
  });
});

describe('Razorpay payment signature (Checkout success handler)', () => {
  const secret = RAZORPAY_TEST_KEYS.keySecret;
  const gateway = new RazorpayGateway({ ...RAZORPAY_TEST_KEYS, fetch: async () => new Response() });
  const orderId = 'order_IluGWxBm9U8zJ8';
  const paymentId = 'pay_IluGWxBm9U8zJ9';

  it('produces the signature the official SDK accepts', async () => {
    const signature = await razorpayPaymentSignature(secret, orderId, paymentId);
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
    expect(signature).toBe(
      createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex'),
    );
    expect(
      validatePaymentVerification({ order_id: orderId, payment_id: paymentId }, signature, secret),
    ).toBe(true);
  });

  it('agrees with the SDK on known-good and tampered values', async () => {
    const good = await razorpayPaymentSignature(secret, orderId, paymentId);
    const flipped = good.slice(0, -1) + (good.endsWith('0') ? '1' : '0');
    const cases: [label: string, order: string, payment: string, sig: string, key: string][] = [
      ['genuine', orderId, paymentId, good, secret],
      ['another order', 'order_IluGWxBm9U8zJX', paymentId, good, secret],
      ['another payment', orderId, 'pay_IluGWxBm9U8zJX', good, secret],
      ['order and payment swapped', paymentId, orderId, good, secret],
      ['one hex digit changed', orderId, paymentId, flipped, secret],
      ['upper-case hex', orderId, paymentId, good.toUpperCase(), secret],
      ['truncated', orderId, paymentId, good.slice(0, 63), secret],
      ['empty', orderId, paymentId, '', secret],
      ['signed with another secret', orderId, paymentId, good, 'another-key-secret'],
    ];
    for (const [label, order, payment, sig, key] of cases) {
      const other = new RazorpayGateway({ ...RAZORPAY_TEST_KEYS, keySecret: key });
      const ours = await other.verifyPaymentSignature(order, payment, sig);
      const sdk = sig
        ? validatePaymentVerification({ order_id: order, payment_id: payment }, sig, key)
        : false;
      expect({ label, ours }).toEqual({ label, ours: sdk });
      expect({ label, ours }).toEqual({ label, ours: label === 'genuine' });
    }
    expect(await gateway.verifyPaymentSignature(orderId, paymentId, good)).toBe(true);
  });
});

describe('Razorpay webhook signature (X-Razorpay-Signature)', () => {
  const sim = new RazorpaySimulator();
  const gateway = new RazorpayGateway({ ...RAZORPAY_TEST_KEYS, fetch: sim.fetch });
  const now = new Date();

  async function capturedWebhook() {
    const start = await gateway.createPayment({
      orderId: 'ord_sig',
      amount: 24900,
      currency: 'INR',
    });
    const { payment } = sim.pay(start.providerOrderId);
    return sim.webhook('payment.captured', payment);
  }

  it('accepts what the provider signs, and agrees with the SDK', async () => {
    const { rawBody, headers } = await capturedWebhook();
    const signature = headers['x-razorpay-signature']!;
    expect(await razorpayWebhookSignature(RAZORPAY_TEST_KEYS.webhookSecret, rawBody)).toBe(
      signature,
    );
    expect(validateWebhookSignature(rawBody, signature, RAZORPAY_TEST_KEYS.webhookSecret)).toBe(
      true,
    );
    expect(await gateway.verifyWebhook(rawBody, headers, now)).toMatchObject({
      provider: 'razorpay',
      type: 'payment.captured',
      amount: 24900,
      currency: 'INR',
    });
  });

  it('rejects tampered bodies and signatures, as the SDK does', async () => {
    const { rawBody, headers } = await capturedWebhook();
    const signature = headers['x-razorpay-signature']!;
    const cases: [label: string, body: string, sig: string][] = [
      ['amount lowered', rawBody.replace('"amount":24900', '"amount":100'), signature],
      ['status changed', rawBody.replace('"status":"captured"', '"status":"failed"'), signature],
      ['re-serialized (spaces)', JSON.stringify(JSON.parse(rawBody), null, 1), signature],
      ['trailing newline', `${rawBody}\n`, signature],
      ['unicode changed', rawBody.replace('₹', 'Rs'), signature],
      [
        'signature of another body',
        rawBody,
        createHmac('sha256', RAZORPAY_TEST_KEYS.webhookSecret).update('{}').digest('hex'),
      ],
      [
        'signed with the key secret',
        rawBody,
        createHmac('sha256', RAZORPAY_TEST_KEYS.keySecret).update(rawBody).digest('hex'),
      ],
      ['upper-case hex', rawBody, signature.toUpperCase()],
    ];
    for (const [label, body, sig] of cases) {
      expect({ label, body: body !== rawBody || sig !== signature }).toEqual({ label, body: true });
      expect({
        label,
        sdk: validateWebhookSignature(body, sig, RAZORPAY_TEST_KEYS.webhookSecret),
      }).toEqual({ label, sdk: false });
      await expect(
        gateway.verifyWebhook(body, { ...headers, 'x-razorpay-signature': sig }, now),
      ).rejects.toBeInstanceOf(WebhookVerificationError);
    }
    const { 'x-razorpay-signature': _, ...unsigned } = headers;
    await expect(gateway.verifyWebhook(rawBody, unsigned, now)).rejects.toThrow(/Missing/);
  });

  it('refuses a genuine but stale event (a replay days later)', async () => {
    const start = await gateway.createPayment({
      orderId: 'ord_old',
      amount: 24900,
      currency: 'INR',
    });
    const { payment } = sim.pay(start.providerOrderId);
    const at = Math.floor(now.getTime() / 1000);
    const old = sim.webhook('payment.captured', payment, { createdAt: at - 4 * 24 * 3600 });
    await expect(gateway.verifyWebhook(old.rawBody, old.headers, now)).rejects.toThrow(/window/);
    const retry = sim.webhook('payment.captured', payment, { createdAt: at - 23 * 3600 });
    await expect(gateway.verifyWebhook(retry.rawBody, retry.headers, now)).resolves.toBeTruthy();
    const future = sim.webhook('payment.captured', payment, { createdAt: at + 3600 });
    await expect(gateway.verifyWebhook(future.rawBody, future.headers, now)).rejects.toThrow(
      /window/,
    );
  });
});

describe('Stripe webhook signature (Stripe-Signature)', () => {
  const secret = STRIPE_TEST_KEYS.webhookSecret;
  const gateway = new StripeGateway({ ...STRIPE_TEST_KEYS, fetch: async () => new Response() });
  const sim = new StripeSimulator();
  const nowSeconds = 1_791_300_000;
  const now = new Date(nowSeconds * 1000);

  async function intentEvent() {
    const stripe = new StripeGateway({ ...STRIPE_TEST_KEYS, fetch: sim.fetch });
    const start = await stripe.createPayment({ orderId: 'ord_sig', amount: 1250, currency: 'GBP' });
    return sim.succeed(start.providerOrderId).rawBody;
  }

  const sdkAccepts = (body: string, header: string, receivedAt = nowSeconds) => {
    try {
      stripeSdk.webhooks.constructEvent(body, header, secret, 300, undefined, receivedAt * 1000);
      return true;
    } catch {
      return false;
    }
  };
  const oursAccepts = async (body: string, header: string, at = now) => {
    try {
      await gateway.verifyWebhook(body, { 'stripe-signature': header }, at);
      return true;
    } catch (error) {
      if (!(error instanceof WebhookVerificationError)) throw error;
      return false;
    }
  };

  it('pins the API version the official library uses', () => {
    expect(STRIPE_API_VERSION).toBe(Stripe.API_VERSION);
  });

  it('accepts headers made by the official library, and the library accepts ours', async () => {
    const body = await intentEvent();
    const sdkHeader = stripeSdk.webhooks.generateTestHeaderString({
      payload: body,
      secret,
      timestamp: nowSeconds,
    });
    const ourHeader = await stripeSignatureHeader(secret, body, nowSeconds);
    expect(ourHeader).toBe(sdkHeader);
    expect(await oursAccepts(body, sdkHeader)).toBe(true);
    expect(sdkAccepts(body, ourHeader)).toBe(true);
  });

  it('agrees with the official library on tampered and malformed headers', async () => {
    const body = await intentEvent();
    const good = await stripeSignatureHeader(secret, body, nowSeconds);
    const v1 = good.split('v1=')[1]!;
    const wrong = await stripeSignatureHeader('whsec_another', body, nowSeconds);
    const cases: [label: string, body: string, header: string, accept: boolean][] = [
      ['genuine', body, good, true],
      [
        'amount changed',
        body.replace('"amount_received": 1250', '"amount_received": 1'),
        good,
        false,
      ],
      ['re-serialized compactly', JSON.stringify(JSON.parse(body)), good, false],
      ['another secret', body, wrong, false],
      ['timestamp changed, same signature', body, `t=${nowSeconds - 1},v1=${v1}`, false],
      [
        'one of several v1 matches (secret rolling)',
        body,
        `t=${nowSeconds},v1=${wrong.split('v1=')[1]},v1=${v1}`,
        true,
      ],
      ['only a v0 signature', body, `t=${nowSeconds},v0=${v1}`, false],
      ['no timestamp', body, `v1=${v1}`, false],
      ['garbage', body, 'garbage', false],
      [
        'secret without the whsec_ prefix',
        body,
        await stripeSignatureHeader(secret.replace('whsec_', ''), body, nowSeconds),
        false,
      ],
    ];
    for (const [label, b, header, accept] of cases) {
      expect({ label, ours: await oursAccepts(b, header) }).toEqual({ label, ours: accept });
      expect({ label, sdk: sdkAccepts(b, header) }).toEqual({ label, sdk: accept });
    }
  });

  it('refuses events outside the 300-second window (replays later on)', async () => {
    const body = await intentEvent();
    const header = await stripeSignatureHeader(secret, body, nowSeconds);
    const after = (s: number) => new Date((nowSeconds + s) * 1000);
    expect(await oursAccepts(body, header, after(STRIPE_SIGNATURE_TOLERANCE_SECONDS))).toBe(true);
    expect(await oursAccepts(body, header, after(STRIPE_SIGNATURE_TOLERANCE_SECONDS + 1))).toBe(
      false,
    );
    expect(sdkAccepts(body, header, nowSeconds + 301)).toBe(false);
    // Deliberately stricter than the library: a timestamp far in the future is refused too.
    expect(await oursAccepts(body, header, after(-301))).toBe(false);
    expect(sdkAccepts(body, header, nowSeconds - 301)).toBe(true);
  });
});
