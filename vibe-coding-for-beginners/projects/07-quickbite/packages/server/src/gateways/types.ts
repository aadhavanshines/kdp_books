import type { PaymentProvider, PaymentStart } from '@quickbite/core';

/** Header lookup that works with Fetch `Headers`, Node's `IncomingHttpHeaders` and plain objects. */
export type HeaderBag = Record<string, string | string[] | undefined>;

export function header(headers: HeaderBag, name: string): string | undefined {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted) return Array.isArray(value) ? value[0] : value;
  }
  return undefined;
}

/** A provider's webhook, verified and translated into one shape for every provider. */
export interface PaymentEvent {
  provider: PaymentProvider;
  eventId: string;
  type: 'payment.captured' | 'payment.failed';
  providerOrderId: string;
  providerPaymentId: string;
  /** Minor units, as reported by the provider. */
  amount: number;
  currency: string;
}

export interface CreatePaymentInput {
  orderId: string;
  /** Minor units, taken from the server-priced order. */
  amount: number;
  currency: string;
}

export interface ResumePaymentInput {
  providerOrderId: string;
  amount: number;
  currency: string;
}

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  /**
   * Creates the provider-side order/intent for exactly this amount and returns
   * what the browser needs to pay it.
   */
  createPayment(input: CreatePaymentInput): Promise<PaymentStart>;
  /** The browser's payment details for a provider order/intent created earlier (a retry). */
  resumePayment(input: ResumePaymentInput): Promise<PaymentStart>;
  /**
   * Checks the webhook signature over the raw body and parses it. Throws
   * WebhookVerificationError when the signature is missing, wrong or stale.
   * Returns null for a genuine event this app doesn't act on.
   */
  verifyWebhook(rawBody: string, headers: HeaderBag, now: Date): Promise<PaymentEvent | null>;
}
