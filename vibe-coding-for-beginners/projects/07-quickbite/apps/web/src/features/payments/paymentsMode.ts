/**
 * What the UI says about payments (VITE_PAYMENTS_MODE). The server decides the
 * real mode and provider; this only picks the banner.
 *   fake (default)  "Demo mode": the QuickBite test payment sheet
 *   test            Razorpay / Stripe in test mode: test cards and UPI ids only
 *   live            no banner
 */
export type PaymentsBanner = 'fake' | 'test' | 'live';

export function paymentsBanner(raw: string | undefined): PaymentsBanner {
  return raw === 'test' || raw === 'live' ? raw : 'fake';
}

export const PAYMENTS_BANNER = paymentsBanner(import.meta.env.VITE_PAYMENTS_MODE);
