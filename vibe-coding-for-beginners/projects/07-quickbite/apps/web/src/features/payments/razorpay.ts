/**
 * Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js), opened for
 * a Razorpay order the server created. Only the key id (public by design) and
 * the order id come from our server; the amount is fixed on Razorpay's order.
 */
import type { PaymentStart, RazorpayCheckoutResponse } from '@quickbite/core';
import { providerGlobal } from './loadScript';

export const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
}

export interface RazorpayFailure {
  error: { code?: string; description?: string; reason?: string };
}

export interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', listener: (failure: RazorpayFailure) => void): void;
}

export type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

export type RazorpayOutcome =
  | { kind: 'paid'; response: RazorpayCheckoutResponse }
  /** Closed without paying; `error` is the last failed attempt's reason, if any. */
  | { kind: 'closed'; error?: string };

export interface Prefill {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Opens Checkout and settles once: paid (the success handler ran) or closed.
 * A failed attempt keeps Checkout open so the customer can try another way;
 * its reason is reported if they then close it.
 */
export async function openRazorpayCheckout(
  start: Extract<PaymentStart, { provider: 'razorpay' }>,
  prefill: Prefill,
  onOpen?: () => void,
): Promise<RazorpayOutcome> {
  const Razorpay = await providerGlobal<RazorpayConstructor>('Razorpay', RAZORPAY_CHECKOUT_URL);
  return new Promise((resolve) => {
    let lastError: string | undefined;
    const checkout = new Razorpay({
      key: start.keyId,
      order_id: start.providerOrderId,
      amount: start.amount,
      currency: start.currency,
      name: 'QuickBite',
      description: 'Food order',
      prefill: { name: prefill.name, email: prefill.email, contact: prefill.phone },
      theme: { color: '#F2542D' },
      handler: (response) => resolve({ kind: 'paid', response }),
      modal: { ondismiss: () => resolve({ kind: 'closed', error: lastError }) },
    });
    checkout.on('payment.failed', (failure) => {
      lastError = failure.error.description ?? failure.error.reason ?? 'The payment failed';
    });
    checkout.open();
    onOpen?.();
  });
}
