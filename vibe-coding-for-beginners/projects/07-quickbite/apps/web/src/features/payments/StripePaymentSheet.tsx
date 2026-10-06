import type { PaymentStart } from '@quickbite/core';
import { Loader2, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { formatPrice } from '../../lib/format';
import type { PaymentResult } from './PaymentFlow';
import { loadStripe, STRIPE_APPEARANCE, type StripeElements, type StripeJs } from './stripe';

interface StripePaymentSheetProps {
  orderId: string;
  start: Extract<PaymentStart, { provider: 'stripe' }>;
  onFinished: (result: PaymentResult) => void;
}

/** Statuses after which the order page takes over (the webhook places the order). */
const SUBMITTED = new Set(['succeeded', 'processing', 'requires_capture']);

/**
 * The Stripe Payment Element in a QuickBite sheet. A declined card is shown
 * here and the customer can try again on the same PaymentIntent. Payment
 * methods that need a redirect come back to the order page.
 */
export function StripePaymentSheet({ orderId, start, onFinished }: StripePaymentSheetProps) {
  // A callback ref: the sheet's content mounts in a portal after the first render.
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'paying' | 'broken'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const stripe = useRef<{ stripe: StripeJs; elements: StripeElements } | null>(null);

  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    let element: { destroy(): void } | null = null;
    loadStripe(start.publishableKey).then(
      (instance) => {
        if (cancelled) return;
        const elements = instance.elements({
          clientSecret: start.clientSecret,
          appearance: STRIPE_APPEARANCE,
        });
        const payment = elements.create('payment', { layout: 'tabs' });
        payment.on('ready', () => !cancelled && setState('ready'));
        payment.mount(node);
        element = payment;
        stripe.current = { stripe: instance, elements };
      },
      () => {
        if (cancelled) return;
        setState('broken');
        setMessage('Stripe could not be loaded. Check your connection and try again.');
      },
    );
    return () => {
      cancelled = true;
      element?.destroy();
      stripe.current = null;
    };
  }, [node, start.publishableKey, start.clientSecret]);

  const pay = async () => {
    if (!stripe.current) return;
    setState('paying');
    setMessage(null);
    const { error, paymentIntent } = await stripe.current.stripe.confirmPayment({
      elements: stripe.current.elements,
      confirmParams: { return_url: `${window.location.origin}/orders/${orderId}` },
      redirect: 'if_required',
    });
    if (!error && paymentIntent && SUBMITTED.has(paymentIntent.status)) {
      onFinished({ status: 'paid' });
      return;
    }
    setState('ready');
    setMessage(error?.message ?? 'The payment was not completed. Please try again.');
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && state !== 'paying' && onFinished({ status: 'cancelled' })}
      title="Pay with card"
      description="Secured by Stripe"
    >
      <div className="rounded-2xl bg-sunken p-4 text-center">
        <p className="text-sm font-semibold text-muted">Amount to pay</p>
        <p className="tabular mt-1 text-3xl font-extrabold" data-testid="stripe-payment-amount">
          {formatPrice(start.amount, start.currency)}
        </p>
      </div>
      <div ref={setNode} className="mt-4 min-h-24" data-testid="stripe-payment-element" />
      {state === 'loading' && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Loading secure payment form…
        </p>
      )}
      {message && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          {message}
        </p>
      )}
      <Button
        size="lg"
        block
        className="mt-5"
        disabled={state !== 'ready'}
        onClick={() => void pay()}
      >
        {state === 'paying' ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Lock className="size-4" aria-hidden />
        )}
        Pay {formatPrice(start.amount, start.currency)}
      </Button>
    </Sheet>
  );
}
