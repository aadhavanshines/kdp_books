import type { PaymentStart } from '@quickbite/core';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getBackend } from '../../backend';
import type { PaymentResult } from './PaymentFlow';
import { openRazorpayCheckout, type Prefill } from './razorpay';

interface RazorpayCheckoutProps {
  orderId: string;
  start: Extract<PaymentStart, { provider: 'razorpay' }>;
  prefill: Prefill;
  onFinished: (result: PaymentResult) => void;
}

/**
 * Opens Razorpay Checkout (its own modal) and, after a successful payment,
 * sends the signed response to the server to verify. If that request fails
 * the order page still follows the order: Razorpay's webhook places it.
 */
export function RazorpayCheckout({ orderId, start, prefill, onFinished }: RazorpayCheckoutProps) {
  const [step, setStep] = useState<'opening' | 'open' | 'verifying'>('opening');
  const opened = useRef(false);
  const finished = useRef(onFinished);
  useEffect(() => {
    finished.current = onFinished;
  });

  useEffect(() => {
    // Once per payment, even when effects run twice in development.
    if (opened.current) return;
    opened.current = true;
    void (async () => {
      let outcome;
      try {
        outcome = await openRazorpayCheckout(start, prefill, () => setStep('open'));
      } catch {
        finished.current({
          status: 'failed',
          message: 'Razorpay could not be loaded. Check your connection and try again.',
        });
        return;
      }
      if (outcome.kind === 'closed') {
        finished.current({ status: 'cancelled', message: outcome.error });
        return;
      }
      setStep('verifying');
      try {
        await (await getBackend()).orders.confirmRazorpay(orderId, outcome.response);
      } catch {
        // Not fatal: the webhook confirms the payment; the order page waits for it.
      }
      finished.current({ status: 'paid' });
    })();
  }, [orderId, start, prefill]);

  if (step === 'open') return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-50 mx-auto flex w-fit items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-raised"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {step === 'opening' ? 'Opening secure Razorpay checkout…' : 'Verifying your payment…'}
    </div>
  );
}
