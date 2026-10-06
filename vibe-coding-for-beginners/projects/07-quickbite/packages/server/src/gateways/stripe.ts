/**
 * Stripe (international cards and wallets), with a PaymentIntent and the
 * Payment Element.
 *
 * API (https://api.stripe.com/v1, form-encoded, "Authorization: Bearer <secret key>"):
 *   POST /payment_intents      amount, currency (lower case), automatic_payment_methods[enabled],
 *                              metadata[quickbite_order_id]; sent with an Idempotency-Key so
 *                              a retried create returns the same intent
 *   GET  /payment_intents/:id  → client_secret again, for a retry
 *
 * Webhooks (Stripe's documented scheme):
 *   Stripe-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(endpoint secret, "<t>.<raw body>")>
 * The endpoint secret ("whsec_…") is the HMAC key exactly as given. While a
 * secret is being rolled there are several v1 entries; any one matching is
 * enough, and other schemes (v0) are ignored. Events more than 300 seconds old
 * (the official libraries' default tolerance) or 300 seconds in the future are
 * refused; a replay inside that window is skipped by its event id (evt_…).
 *
 * An order is marked paid only by a verified payment_intent.succeeded event,
 * and only for its amount_received in the order's currency.
 */
import type { PaymentStart } from '@quickbite/core';
import { z } from 'zod';
import { hmacSha256Hex, timingSafeEqual } from '../crypto';
import { ProviderApiError, WebhookVerificationError } from '../errors';
import { requestJson, type FetchLike } from './http';
import {
  header,
  type CreatePaymentInput,
  type HeaderBag,
  type PaymentEvent,
  type PaymentGateway,
  type ResumePaymentInput,
} from './types';

export const STRIPE_API_BASE = 'https://api.stripe.com/v1';
/** The API version stripe-node 23.0.0 pins; set the webhook endpoint to the same version. */
export const STRIPE_API_VERSION = '2026-09-30.endive';
export const STRIPE_SIGNATURE_HEADER = 'stripe-signature';
export const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300;

const intentSchema = z.object({
  id: z.string().regex(/^pi_[A-Za-z0-9_]{1,128}$/),
  object: z.literal('payment_intent'),
  amount: z.number().int().nonnegative(),
  amount_received: z.number().int().nonnegative().optional(),
  currency: z.string().regex(/^[a-zA-Z]{3}$/),
  status: z.string(),
  client_secret: z.string().nullish(),
});

const eventSchema = z.object({
  id: z.string().regex(/^evt_[A-Za-z0-9_]{1,128}$/),
  object: z.literal('event'),
  type: z.string(),
  livemode: z.boolean(),
  data: z.object({ object: z.unknown() }),
});

/** Builds a Stripe-Signature header value for a body, as Stripe does (tests and the simulator). */
export async function stripeSignatureHeader(
  webhookSecret: string,
  rawBody: string,
  timestamp: number,
): Promise<string> {
  return `t=${timestamp},v1=${await hmacSha256Hex(webhookSecret, `${timestamp}.${rawBody}`)}`;
}

const readError = (body: unknown) => {
  const error = (body as { error?: { code?: string; type?: string; message?: string } } | null)
    ?.error;
  return error ? { code: error.code ?? error.type, message: error.message } : undefined;
};

export interface StripeGatewayOptions {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  /** Replaces the network (tests and the offline simulator). */
  fetch?: FetchLike;
}

export class StripeGateway implements PaymentGateway {
  readonly provider = 'stripe' as const;
  readonly publishableKey: string;
  /** Live keys produce live events; a test event is never accepted by a live gateway (and back). */
  readonly livemode: boolean;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly fetch: FetchLike;

  constructor(options: StripeGatewayOptions) {
    if (!options.secretKey || !options.publishableKey || !options.webhookSecret) {
      throw new Error('Stripe needs a secret key, a publishable key and a webhook secret.');
    }
    this.secretKey = options.secretKey;
    this.publishableKey = options.publishableKey;
    this.webhookSecret = options.webhookSecret;
    this.livemode = /^(sk|rk)_live_/.test(options.secretKey);
    this.fetch = options.fetch ?? ((input, init) => fetch(input, init));
  }

  private api<T>(
    method: 'GET' | 'POST',
    path: string,
    form?: Record<string, string>,
    idempotencyKey?: string,
  ): Promise<T> {
    return requestJson<T>(
      'stripe',
      this.fetch,
      `${STRIPE_API_BASE}${path}`,
      {
        method,
        headers: {
          authorization: `Bearer ${this.secretKey}`,
          'stripe-version': STRIPE_API_VERSION,
          ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
          ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
        },
        body: form ? new URLSearchParams(form).toString() : undefined,
      },
      readError,
    );
  }

  async createPayment({ orderId, amount, currency }: CreatePaymentInput): Promise<PaymentStart> {
    const raw = await this.api<unknown>(
      'POST',
      '/payment_intents',
      {
        amount: String(amount),
        currency: currency.toLowerCase(),
        'automatic_payment_methods[enabled]': 'true',
        description: `QuickBite order ${orderId}`,
        'metadata[quickbite_order_id]': orderId,
      },
      // One intent per order, even if this request is retried.
      `quickbite-order-${orderId}`,
    );
    return this.startFrom(raw, amount, currency);
  }

  /** The intent takes another attempt after a decline, so a retry reuses it. */
  async resumePayment({ providerOrderId, amount, currency }: ResumePaymentInput) {
    const raw = await this.api<unknown>(
      'GET',
      `/payment_intents/${encodeURIComponent(providerOrderId)}`,
    );
    return this.startFrom(raw, amount, currency);
  }

  private startFrom(raw: unknown, amount: number, currency: string): PaymentStart {
    const intent = intentSchema.safeParse(raw);
    if (
      !intent.success ||
      !intent.data.client_secret ||
      intent.data.amount !== amount ||
      intent.data.currency.toUpperCase() !== currency
    ) {
      throw new ProviderApiError('stripe', 200, 'unexpected_response', 'Intent does not match');
    }
    if (intent.data.status === 'canceled') {
      throw new ProviderApiError('stripe', 200, 'intent_canceled', 'The payment was canceled');
    }
    return {
      provider: 'stripe',
      providerOrderId: intent.data.id,
      amount,
      currency,
      publishableKey: this.publishableKey,
      clientSecret: intent.data.client_secret,
    };
  }

  async verifyWebhook(
    rawBody: string,
    headers: HeaderBag,
    now: Date,
  ): Promise<PaymentEvent | null> {
    const value = header(headers, STRIPE_SIGNATURE_HEADER);
    if (!value) throw new WebhookVerificationError('Missing signature header');
    let timestamp = NaN;
    const signatures: string[] = [];
    for (const item of value.split(',')) {
      const i = item.indexOf('=');
      if (i < 0) continue;
      const key = item.slice(0, i).trim();
      const val = item.slice(i + 1).trim();
      if (key === 't') timestamp = /^\d+$/.test(val) ? Number(val) : NaN;
      else if (key === 'v1' && val) signatures.push(val);
    }
    if (!Number.isSafeInteger(timestamp) || signatures.length === 0) {
      throw new WebhookVerificationError('Malformed signature');
    }
    const expected = await hmacSha256Hex(this.webhookSecret, `${timestamp}.${rawBody}`);
    // Compare with every entry (no early exit), so timing says nothing about which one matched.
    const matched = signatures
      .map((s) => timingSafeEqual(expected, s))
      .reduce((a, b) => a || b, false);
    if (!matched) throw new WebhookVerificationError('Bad signature');
    if (Math.abs(now.getTime() / 1000 - timestamp) > STRIPE_SIGNATURE_TOLERANCE_SECONDS) {
      throw new WebhookVerificationError('Signature timestamp outside the allowed window');
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new WebhookVerificationError('Body is not JSON');
    }
    const parsed = eventSchema.safeParse(json);
    if (!parsed.success) throw new WebhookVerificationError('Unexpected event shape');
    const event = parsed.data;
    if (event.livemode !== this.livemode) {
      throw new WebhookVerificationError(
        event.livemode ? 'Live event sent to a test-mode server' : 'Test event sent to live server',
      );
    }

    const isSuccess = event.type === 'payment_intent.succeeded';
    if (!isSuccess && event.type !== 'payment_intent.payment_failed') return null;
    const intent = intentSchema.safeParse(event.data.object);
    if (!intent.success) throw new WebhookVerificationError('Unexpected event shape');
    return {
      provider: 'stripe',
      eventId: event.id,
      type: isSuccess ? 'payment.captured' : 'payment.failed',
      providerOrderId: intent.data.id,
      providerPaymentId: intent.data.id,
      // What was actually collected; a succeeded intent without it counts as nothing received.
      amount: isSuccess ? (intent.data.amount_received ?? 0) : intent.data.amount,
      currency: intent.data.currency.toUpperCase(),
    };
  }
}
