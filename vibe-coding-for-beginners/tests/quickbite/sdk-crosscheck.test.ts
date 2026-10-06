// Independent check written for the book (not by the session that built QuickBite):
// signatures made by the official Stripe and Razorpay SDKs must be accepted by QuickBite's
// gateways, and anything tampered with must be rejected.
import { describe, it, expect } from 'vitest';
import Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { validatePaymentVerification, validateWebhookSignature } =
  require('razorpay/dist/utils/razorpay-utils');
import { StripeGateway } from '../gateways/stripe';
import {
  RazorpayGateway, razorpayPaymentSignature, razorpayWebhookSignature,
} from '../gateways/razorpay';

const now = new Date();
const ts = Math.floor(now.getTime() / 1000);
const noNetwork = async () => { throw new Error('no network'); };

describe('Stripe webhook signatures match the official SDK', () => {
  const secret = 'whsec_book_test_secret';
  const gw = new StripeGateway({ secretKey: 'sk_test_x', publishableKey: 'pk_test_x',
    webhookSecret: secret, fetch: noNetwork });
  const stripe = new Stripe('sk_test_x');
  const body = JSON.stringify({ id: 'evt_1', object: 'event',
    type: 'payment_intent.succeeded', livemode: false, created: ts,
    data: { object: { id: 'pi_1', object: 'payment_intent', amount: 24900,
      amount_received: 24900, currency: 'inr', status: 'succeeded',
      metadata: { orderId: 'o1' } } } });
  const sign = (payload: string, key: string, t: number) =>
    stripe.webhooks.generateTestHeaderString({ payload, secret: key, timestamp: t });

  it('accepts a header made by the Stripe SDK', async () => {
    const header = sign(body, secret, ts);
    const event = await gw.verifyWebhook(body, { 'stripe-signature': header }, now);
    expect(event).not.toBeNull();
    // The official SDK accepts the same header (a check of the test itself).
    expect(() => stripe.webhooks.constructEvent(body, header, secret)).not.toThrow();
  });
  it('rejects a body changed by one character', async () => {
    const changed = body.replace('24900', '24901');
    await expect(gw.verifyWebhook(changed, { 'stripe-signature': sign(body, secret, ts) },
      now)).rejects.toThrow();
  });
  it('rejects the wrong secret and an old timestamp', async () => {
    await expect(gw.verifyWebhook(body, { 'stripe-signature': sign(body, 'whsec_x', ts) },
      now)).rejects.toThrow();
    await expect(gw.verifyWebhook(body, { 'stripe-signature': sign(body, secret, ts - 301) },
      now)).rejects.toThrow();
  });
});

describe('Razorpay signatures match the official SDK', () => {
  const keySecret = 'rzp_test_secret_book';
  const whSecret = 'rzp_webhook_secret_book';
  it('payment signature: our function and the SDK agree', async () => {
    const sig = await razorpayPaymentSignature(keySecret, 'order_ABC123', 'pay_XYZ789');
    expect(validatePaymentVerification(
      { order_id: 'order_ABC123', payment_id: 'pay_XYZ789' }, sig, keySecret)).toBe(true);
    const gw = new RazorpayGateway({ keyId: 'rzp_test_x', keySecret,
      webhookSecret: whSecret, fetch: noNetwork });
    expect(await gw.verifyPaymentSignature('order_ABC123', 'pay_XYZ789', sig)).toBe(true);
    expect(await gw.verifyPaymentSignature('order_ABC123', 'pay_OTHER', sig)).toBe(false);
  });
  it('webhook signature: our function and the SDK agree', async () => {
    const body = JSON.stringify({ entity: 'event', event: 'payment.captured', created_at: ts });
    const sig = await razorpayWebhookSignature(whSecret, body);
    expect(validateWebhookSignature(body, sig, whSecret)).toBe(true);
    expect(validateWebhookSignature(body + ' ', sig, whSecret)).toBe(false);
  });
});
