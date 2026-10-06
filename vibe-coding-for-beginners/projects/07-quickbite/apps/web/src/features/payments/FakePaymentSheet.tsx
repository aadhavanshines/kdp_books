import { CircleCheck, CircleX, FlaskConical, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Sheet } from '../../components/ui/Sheet';
import { formatPrice } from '../../lib/format';
import { usePayFake } from '../orders/queries';

interface FakePaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  /** The amount the server set on the payment (not the browser's own total). */
  amount: number;
  currency: string;
  onPaid: (outcome: 'success' | 'failure') => void;
}

/**
 * The QuickBite "Test payment" sheet: stands in for Razorpay / Stripe while
 * PAYMENTS_MODE=fake. Tapping a button asks the fake provider to send its
 * signed webhook; the order changes only when the server has verified it.
 */
export function FakePaymentSheet({
  open,
  onOpenChange,
  orderId,
  amount,
  currency,
  onPaid,
}: FakePaymentSheetProps) {
  const pay = usePayFake();
  const busy = pay.isPending;
  const submit = (outcome: 'success' | 'failure') =>
    pay.mutate({ orderId, outcome }, { onSuccess: () => onPaid(outcome) });

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !busy && onOpenChange(o)}
      title="Test payment"
      description="QuickBite demo checkout"
    >
      <div className="rounded-2xl bg-sunken p-4 text-center">
        <p className="text-sm font-semibold text-muted">Amount to pay</p>
        <p className="tabular mt-1 text-3xl font-extrabold" data-testid="fake-payment-amount">
          {formatPrice(amount, currency)}
        </p>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-offer/5 p-3 text-sm text-ink-soft">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-offer" aria-hidden />
        Demo mode: no real money moves. Choose what the payment provider should report.
      </p>
      {pay.isError && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          The payment couldn’t be completed. Please try again.
        </p>
      )}
      <div className="mt-5 grid gap-3">
        <Button size="lg" block disabled={busy} onClick={() => submit('success')}>
          {busy && pay.variables?.outcome === 'success' ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <CircleCheck className="size-5" aria-hidden />
          )}
          Pay {formatPrice(amount, currency)}
        </Button>
        <Button size="lg" variant="outline" block disabled={busy} onClick={() => submit('failure')}>
          <CircleX className="size-5" aria-hidden />
          Simulate a failed payment
        </Button>
      </div>
    </Sheet>
  );
}
