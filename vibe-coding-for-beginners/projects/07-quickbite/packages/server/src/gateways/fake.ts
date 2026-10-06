/**
 * The fake payment provider (PAYMENTS_MODE=fake). It plays the provider's
 * part honestly: it signs a webhook with a shared secret and sends it to the
 * same webhook handler a real provider would call, so signature checks,
 * amount checks and idempotency run on every test payment.
 *
 * Signature header (modelled on Stripe's):
 *   x-quickbite-signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<raw body>")>
 */
import type { PaymentStart } from '@quickbite/core';
import { z } from 'zod';
import { hmacSha256Hex, randomId, timingSafeEqual } from '../crypto';
import { WebhookVerificationError } from '../errors';
import {
  header,
  type CreatePaymentInput,
  type HeaderBag,
  type PaymentEvent,
  type PaymentGateway,
  type ResumePaymentInput,
} from './types';

export const FAKE_SIGNATURE_HEADER = 'x-quickbite-signature';
/** Webhooks older (or newer) than this are rejected, so a captured request can't be replayed later. */
export const FAKE_SIGNATURE_TOLERANCE_SECONDS = 300;

const fakeEventSchema = z.object({
  id: z.string().regex(/^evt_[A-Za-z0-9_]{6,64}$/),
  type: z.enum(['payment.captured', 'payment.failed']),
  created: z.number().int(),
  data: z.object({
    order_id: z.string().min(1).max(128),
    payment_id: z.string().min(1).max(128),
    amount: z.number().int().nonnegative(),
    currency: z.string().regex(/^[A-Z]{3}$/),
  }),
});

export type FakeWebhookEvent = z.infer<typeof fakeEventSchema>;

export class FakeGateway implements PaymentGateway {
  readonly provider = 'fake' as const;

  constructor(private readonly secret: string) {
    if (secret.length < 16) throw new Error('FAKE_WEBHOOK_SECRET must be at least 16 characters.');
  }

  async createPayment({ orderId, amount, currency }: CreatePaymentInput): Promise<PaymentStart> {
    return { provider: 'fake', providerOrderId: `fake_order_${orderId}`, amount, currency };
  }

  async resumePayment(input: ResumePaymentInput): Promise<PaymentStart> {
    return { provider: 'fake', ...input };
  }

  /** Builds the provider's webhook for a payment attempt, as the fake provider would send it. */
  buildEvent(input: {
    providerOrderId: string;
    outcome: 'success' | 'failure';
    amount: number;
    currency: string;
    now: Date;
  }): FakeWebhookEvent {
    return {
      id: `evt_fake_${randomId()}`,
      type: input.outcome === 'success' ? 'payment.captured' : 'payment.failed',
      created: Math.floor(input.now.getTime() / 1000),
      data: {
        order_id: input.providerOrderId,
        payment_id: `pay_fake_${randomId()}`,
        amount: input.amount,
        currency: input.currency,
      },
    };
  }

  /** Signs a raw body the way the fake provider does. */
  async sign(rawBody: string, now: Date): Promise<Record<string, string>> {
    const t = Math.floor(now.getTime() / 1000);
    const v1 = await hmacSha256Hex(this.secret, `${t}.${rawBody}`);
    return { [FAKE_SIGNATURE_HEADER]: `t=${t},v1=${v1}`, 'content-type': 'application/json' };
  }

  async verifyWebhook(rawBody: string, headers: HeaderBag, now: Date): Promise<PaymentEvent> {
    const value = header(headers, FAKE_SIGNATURE_HEADER);
    if (!value) throw new WebhookVerificationError('Missing signature header');
    const parts = Object.fromEntries(
      value.split(',').map((part) => {
        const i = part.indexOf('=');
        return [part.slice(0, i).trim(), part.slice(i + 1).trim()];
      }),
    );
    const t = Number(parts.t);
    if (!Number.isInteger(t) || !parts.v1)
      throw new WebhookVerificationError('Malformed signature');
    if (Math.abs(now.getTime() / 1000 - t) > FAKE_SIGNATURE_TOLERANCE_SECONDS) {
      throw new WebhookVerificationError('Signature timestamp outside the allowed window');
    }
    const expected = await hmacSha256Hex(this.secret, `${t}.${rawBody}`);
    if (!timingSafeEqual(expected, parts.v1)) throw new WebhookVerificationError('Bad signature');

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new WebhookVerificationError('Body is not JSON');
    }
    const parsed = fakeEventSchema.safeParse(json);
    if (!parsed.success) throw new WebhookVerificationError('Unexpected event shape');
    const event = parsed.data;
    return {
      provider: 'fake',
      eventId: event.id,
      type: event.type,
      providerOrderId: event.data.order_id,
      providerPaymentId: event.data.payment_id,
      amount: event.data.amount,
      currency: event.data.currency,
    };
  }
}
