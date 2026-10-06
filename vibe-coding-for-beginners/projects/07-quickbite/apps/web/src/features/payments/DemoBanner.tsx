import { FlaskConical } from 'lucide-react';
import { PAYMENTS_BANNER } from './paymentsMode';

const TEXT = {
  fake: 'Demo mode — no real money is charged',
  test: 'Test mode — pay with Razorpay or Stripe test details; no real money is charged',
} as const;

/** Shown on every page while payments are not live. */
export function DemoBanner() {
  if (PAYMENTS_BANNER === 'live') return null;
  return (
    <p className="bg-ink px-4 py-1.5 text-center text-xs font-semibold text-white">
      <FlaskConical className="mr-1.5 inline size-3.5 align-[-2px]" aria-hidden />
      {TEXT[PAYMENTS_BANNER]}
    </p>
  );
}
