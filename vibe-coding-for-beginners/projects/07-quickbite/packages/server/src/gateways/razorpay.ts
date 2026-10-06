/**
 * Razorpay (India: UPI, cards, netbanking, wallets), with Razorpay Checkout.
 *
 * API (https://api.razorpay.com/v1, HTTP Basic auth "key id : key secret"):
 *   POST /orders               { amount, currency, receipt, notes } → { id: "order_…", status: "created" }
 *   GET  /payments/:id         → { id, order_id, amount, currency, status }
 *   POST /payments/:id/capture { amount, currency } (only needed when automatic capture is off)
 *
 * Signatures, both lower-case hex HMAC-SHA256 (Razorpay's documented algorithms):
 *   Checkout success handler   razorpay_signature   = HMAC(key secret,     "<order id>|<payment id>")
 *   Webhooks                   X-Razorpay-Signature = HMAC(webhook secret, <raw request body>)
 * The order id in the first one is the Razorpay order id this server created
 * and stored, never one sent by the browser.
 *
 * Replays: a Razorpay webhook signature has no timestamp, and the
 * x-razorpay-event-id header is not covered by it. So the event key used to
 * skip repeats comes from the signed body ("payment.captured:pay_…"), and an
 * event whose signed created_at is older than RAZORPAY_WEBHOOK_MAX_AGE_SECONDS
 * is refused. The browser confirmation and the webhook for the same capture
 * share that key, so whichever arrives second is a no-op.
 */
import type { PaymentStart } from '@quickbite/core';
import { z } from 'zod';
import { hmacSha256Hex, timingSafeEqual } from '../crypto';
import { PaymentVerificationError, ProviderApiError, WebhookVerificationError } from '../errors';
import { basicAuth, requestJson, type FetchLike } from './http';
import {
  header,
  type CreatePaymentInput,
  type HeaderBag,
  type PaymentEvent,
  type PaymentGateway,
  type ResumePaymentInput,
} from './types';

export const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';
export const RAZORPAY_SIGNATURE_HEADER = 'x-razorpay-signature';
/**
 * Razorpay retries a failed webhook delivery for about 24 hours, so anything
 * older than three days is a replay, not a retry.
 */
export const RAZORPAY_WEBHOOK_MAX_AGE_SECONDS = 3 * 24 * 60 * 60;
/** Allowed clock difference for an event that claims to come from the future. */
export const RAZORPAY_WEBHOOK_FUTURE_SKEW_SECONDS = 300;

const paymentIdSchema = z.string().regex(/^pay_[A-Za-z0-9]{1,40}$/);
const orderIdSchema = z.string().regex(/^order_[A-Za-z0-9]{1,40}$/);

const paymentSchema = z.object({
  id: paymentIdSchema,
  // Payments made without a Razorpay order (payment links etc.) have none.
  order_id: orderIdSchema.nullish(),
  amount: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  status: z.string(),
});

export type RazorpayPayment = z.infer<typeof paymentSchema>;

const orderSchema = z.object({
  id: orderIdSchema,
  amount: z.number().int(),
  currency: z.string(),
  status: z.string(),
});

const webhookSchema = z.object({
  entity: z.literal('event'),
  event: z.string(),
  created_at: z.number().int(),
  payload: z.object({ payment: z.object({ entity: paymentSchema }).optional() }),
});

/** The checkout signature Razorpay computes for a successful payment. */
export function razorpayPaymentSignature(
  keySecret: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<string> {
  return hmacSha256Hex(keySecret, `${razorpayOrderId}|${razorpayPaymentId}`);
}

/** The X-Razorpay-Signature Razorpay sends with a webhook. */
export function razorpayWebhookSignature(webhookSecret: string, rawBody: string): Promise<string> {
  return hmacSha256Hex(webhookSecret, rawBody);
}

const readError = (body: unknown) => {
  const error = (body as { error?: { code?: string; description?: string } } | null)?.error;
  return error ? { code: error.code, message: error.description } : undefined;
};

export interface RazorpayGatewayOptions {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  /** Replaces the network (tests and the offline simulator). */
  fetch?: FetchLike;
}

export class RazorpayGateway implements PaymentGateway {
  readonly provider = 'razorpay' as const;
  readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;
  private readonly fetch: FetchLike;

  constructor(options: RazorpayGatewayOptions) {
    if (!options.keyId || !options.keySecret || !options.webhookSecret) {
      throw new Error('Razorpay needs a key id, a key secret and a webhook secret.');
    }
    this.keyId = options.keyId;
    this.keySecret = options.keySecret;
    this.webhookSecret = options.webhookSecret;
    this.fetch = options.fetch ?? ((input, init) => fetch(input, init));
  }

  private api<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    return requestJson<T>(
      'razorpay',
      this.fetch,
      `${RAZORPAY_API_BASE}${path}`,
      {
        method,
        headers: {
          authorization: basicAuth(this.keyId, this.keySecret),
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      readError,
    );
  }

  async createPayment({ orderId, amount, currency }: CreatePaymentInput): Promise<PaymentStart> {
    const raw = await this.api<unknown>('POST', '/orders', {
      amount,
      currency,
      // Razorpay allows 40 characters; our order ids are shorter.
      receipt: orderId.slice(0, 40),
      notes: { quickbite_order_id: orderId },
    });
    const order = orderSchema.safeParse(raw);
    if (!order.success || order.data.amount !== amount || order.data.currency !== currency) {
      throw new ProviderApiError('razorpay', 200, 'unexpected_response', 'Order does not match');
    }
    return this.start({ providerOrderId: order.data.id, amount, currency });
  }

  /** A Razorpay order takes new payment attempts until one succeeds, so a retry reuses it. */
  async resumePayment(input: ResumePaymentInput): Promise<PaymentStart> {
    return this.start(input);
  }

  private start(input: ResumePaymentInput): PaymentStart {
    return { provider: 'razorpay', keyId: this.keyId, ...input };
  }

  async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    const id = paymentIdSchema.parse(paymentId);
    return this.parsePayment(await this.api<unknown>('GET', `/payments/${id}`));
  }

  async capturePayment(paymentId: string, amount: number, currency: string) {
    const id = paymentIdSchema.parse(paymentId);
    return this.parsePayment(
      await this.api<unknown>('POST', `/payments/${id}/capture`, { amount, currency }),
    );
  }

  private parsePayment(raw: unknown): RazorpayPayment {
    const payment = paymentSchema.safeParse(raw);
    if (!payment.success) {
      throw new ProviderApiError('razorpay', 200, 'unexpected_response', 'Not a payment');
    }
    return payment.data;
  }

  /** Checks the signature Checkout gave the success handler, against our stored order id. */
  async verifyPaymentSignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): Promise<boolean> {
    const expected = await razorpayPaymentSignature(
      this.keySecret,
      razorpayOrderId,
      razorpayPaymentId,
    );
    return timingSafeEqual(expected, signature);
  }

  /**
   * What the browser reports after Checkout succeeds. The signature must
   * match, and Razorpay's own record of the payment must belong to this order.
   * Returns the captured payment as an event, or null while it isn't captured
   * yet (the webhook finishes the job then).
   *
   * With automatic capture off in the Razorpay Dashboard a payment stops at
   * "authorized"; it is captured here, but only for exactly the order's amount.
   */
  async settleCheckoutPayment(input: {
    providerOrderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    currency: string;
  }): Promise<PaymentEvent | null> {
    if (
      !(await this.verifyPaymentSignature(input.providerOrderId, input.paymentId, input.signature))
    ) {
      throw new PaymentVerificationError('Bad payment signature');
    }
    let payment = await this.fetchPayment(input.paymentId);
    if (payment.order_id !== input.providerOrderId) {
      throw new PaymentVerificationError('The payment belongs to another order');
    }
    if (
      payment.status === 'authorized' &&
      payment.amount === input.amount &&
      payment.currency === input.currency
    ) {
      try {
        payment = await this.capturePayment(payment.id, input.amount, input.currency);
      } catch (error) {
        // Automatic capture may have got there first; Razorpay's record decides.
        if (!(error instanceof ProviderApiError)) throw error;
        payment = await this.fetchPayment(payment.id);
      }
    }
    if (payment.status !== 'captured') return null;
    return this.event('payment.captured', payment, input.providerOrderId);
  }

  async verifyWebhook(
    rawBody: string,
    headers: HeaderBag,
    now: Date,
  ): Promise<PaymentEvent | null> {
    const signature = header(headers, RAZORPAY_SIGNATURE_HEADER);
    if (!signature) throw new WebhookVerificationError('Missing signature header');
    const expected = await razorpayWebhookSignature(this.webhookSecret, rawBody);
    if (!timingSafeEqual(expected, signature)) throw new WebhookVerificationError('Bad signature');

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new WebhookVerificationError('Body is not JSON');
    }
    const parsed = webhookSchema.safeParse(json);
    if (!parsed.success) throw new WebhookVerificationError('Unexpected event shape');
    const event = parsed.data;

    const age = now.getTime() / 1000 - event.created_at;
    if (age > RAZORPAY_WEBHOOK_MAX_AGE_SECONDS || age < -RAZORPAY_WEBHOOK_FUTURE_SKEW_SECONDS) {
      throw new WebhookVerificationError('Event timestamp outside the allowed window');
    }

    const payment = event.payload.payment?.entity;
    if (!payment?.order_id) return null;
    switch (event.event) {
      // order.paid comes with the same payment as payment.captured; both map to one key.
      case 'payment.captured':
      case 'order.paid':
        return this.event('payment.captured', payment, payment.order_id);
      case 'payment.failed':
        return this.event('payment.failed', payment, payment.order_id);
      default:
        // payment.authorized, refunds, disputes…: genuine, but nothing for this app to do.
        return null;
    }
  }

  private event(
    type: PaymentEvent['type'],
    payment: RazorpayPayment,
    providerOrderId: string,
  ): PaymentEvent {
    return {
      provider: 'razorpay',
      eventId: `${type}:${payment.id}`,
      type,
      providerOrderId,
      providerPaymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    };
  }
}
