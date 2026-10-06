import type { PaymentStart } from '@quickbite/core';
import { FakePaymentSheet } from './FakePaymentSheet';
import { RazorpayCheckout } from './RazorpayCheckout';
import type { Prefill } from './razorpay';
import { StripePaymentSheet } from './StripePaymentSheet';

export type PaymentResult =
  /** Paid (or submitted): the order page shows "Confirming payment…" until the server agrees. */
  | { status: 'paid' }
  /** The provider declined it; the customer can try again. */
  | { status: 'failed'; message?: string }
  /** Closed without paying; `message` is the last failed attempt's reason, if any. */
  | { status: 'cancelled'; message?: string };

interface PaymentFlowProps {
  orderId: string;
  /** From the server: provider, amount and the provider's public details. */
  start: PaymentStart;
  prefill: Prefill;
  onFinished: (result: PaymentResult) => void;
}

/** Opens the checkout of whichever provider the server chose for this order's region. */
export function PaymentFlow({ orderId, start, prefill, onFinished }: PaymentFlowProps) {
  switch (start.provider) {
    case 'fake':
      return (
        <FakePaymentSheet
          open
          onOpenChange={(open) => !open && onFinished({ status: 'cancelled' })}
          orderId={orderId}
          amount={start.amount}
          currency={start.currency}
          onPaid={(outcome) =>
            onFinished(outcome === 'success' ? { status: 'paid' } : { status: 'failed' })
          }
        />
      );
    case 'razorpay':
      return (
        <RazorpayCheckout
          orderId={orderId}
          start={start}
          prefill={prefill}
          onFinished={onFinished}
        />
      );
    case 'stripe':
      return <StripePaymentSheet orderId={orderId} start={start} onFinished={onFinished} />;
  }
}
