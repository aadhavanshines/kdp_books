import { TRACKING_STEPS, type Order, type PaymentStart } from '@quickbite/core';
import { ArrowLeft, CircleAlert, Clock, Loader2, MapPin, PartyPopper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { EmptyState } from '../components/ui/EmptyState';
import { Img } from '../components/ui/Img';
import { PageSpinner } from '../components/ui/PageSpinner';
import { VegMark } from '../components/ui/VegMark';
import { RequireSignIn } from '../features/auth/RequireSignIn';
import { BillDetails } from '../features/checkout/BillDetails';
import { useSession } from '../features/auth/sessionStore';
import { useLiveOrder, useStartPayment } from '../features/orders/queries';
import { StatusTimeline } from '../features/orders/StatusTimeline';
import { STATUS_TEXT } from '../features/orders/statusText';
import { useCart } from '../features/cart/cartStore';
import { useCheckoutStore } from '../features/checkout/checkoutStore';
import { PaymentFlow, type PaymentResult } from '../features/payments/PaymentFlow';
import { cn } from '../lib/cn';
import { formatPrice } from '../lib/format';

export function OrderTrackingPage() {
  return (
    <RequireSignIn
      title="Sign in to track your order"
      description="Your orders are only visible to you."
    >
      <OrderTracking />
    </RequireSignIn>
  );
}

const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function OrderTracking() {
  const { orderId = '' } = useParams();
  const live = useLiveOrder(orderId);

  if (live.status === 'loading') return <PageSpinner />;
  if (live.status === 'error' || !live.order) {
    return (
      <div className="container-page">
        <EmptyState
          title={live.status === 'error' ? 'We couldn’t load this order' : 'Order not found'}
          description="Check your orders list for everything you’ve ordered."
          action={
            <Link to="/orders" className={buttonClass()}>
              Your orders
            </Link>
          }
        />
      </div>
    );
  }
  return <OrderDetails order={live.order} />;
}

/** Stripe sends customers back here after a redirect-based payment method. */
const STRIPE_SUBMITTED = new Set(['succeeded', 'processing']);

/** After this long, "Confirming payment…" explains itself. */
const SLOW_CONFIRMATION_MS = 60_000;

function OrderDetails({ order }: { order: Order }) {
  const [payment, setPayment] = useState<PaymentStart | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const startPayment = useStartPayment();
  const session = useSession();
  const location = useLocation();
  const [search] = useSearchParams();
  const redirectStatus = search.get('redirect_status');
  // Set after "Pay" on this page or at checkout: the webhook may take a moment to land.
  const [justPaid, setJustPaid] = useState(
    () =>
      (location.state as { justPaid?: boolean } | null)?.justPaid === true ||
      STRIPE_SUBMITTED.has(redirectStatus ?? ''),
  );
  const [slow, setSlow] = useState(false);
  const confirming = justPaid && order.status === 'pending_payment';
  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setSlow(true), SLOW_CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [confirming]);
  const redirectFailed = redirectStatus === 'failed' && !payError && !justPaid;
  const text = confirming
    ? { title: 'Confirming payment…', detail: 'This takes a few seconds.' }
    : STATUS_TEXT[order.status];
  const placedAt = order.statusHistory.find((s) => s.status === 'placed')?.at;
  const inProgress = TRACKING_STEPS.includes(order.status) && order.status !== 'delivered';
  const awaitingPayment = order.status === 'pending_payment' || order.status === 'payment_failed';

  const pay = () => {
    setPayError(null);
    startPayment.mutate(order.id, {
      onSuccess: setPayment,
      onError: () => setPayError('We couldn’t start the payment. Please try again.'),
    });
  };

  const onFinished = (result: PaymentResult) => {
    setPayment(null);
    setJustPaid(result.status === 'paid');
    if (result.status !== 'paid') {
      // The fake sheet's failure shows up as the order's own "Payment failed" status.
      if (result.message || (result.status === 'failed' && payment?.provider !== 'fake')) {
        setPayError(
          `Payment failed${result.message ? `: ${result.message}` : ''}. You can try again.`,
        );
      }
      return;
    }
    // The cart that became this order is done with.
    const cart = useCart.getState();
    if (cart.restaurant?.id === order.restaurantId) {
      cart.clear();
      useCheckoutStore.getState().finishAttempt();
    }
  };

  return (
    <div className="bg-sunken pb-16">
      <div className="container-page max-w-3xl pt-4 md:pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Link
            to="/orders"
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white"
            aria-label="Back to your orders"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <p className="text-sm font-semibold text-muted">
            Order #{order.id.slice(-8).toUpperCase()} ·{' '}
            {dateFormat.format(new Date(order.createdAt))}
          </p>
        </div>

        <section
          aria-labelledby="order-status"
          aria-live="polite"
          className={cn(
            'rounded-3xl p-6 text-white shadow-card',
            order.status === 'delivered'
              ? 'bg-success'
              : awaitingPayment || order.status === 'expired' || order.status === 'cancelled'
                ? 'bg-ink'
                : 'bg-brand-700',
          )}
        >
          <div className="flex items-start gap-3">
            {order.status === 'delivered' ? (
              <PartyPopper className="mt-1 size-7 shrink-0" aria-hidden />
            ) : awaitingPayment ? (
              <CircleAlert className="mt-1 size-7 shrink-0" aria-hidden />
            ) : (
              <Clock className="mt-1 size-7 shrink-0" aria-hidden />
            )}
            <div>
              <h1 id="order-status" className="text-2xl font-extrabold" data-testid="order-status">
                {text.title}
              </h1>
              <p className="mt-1">{text.detail}</p>
              {inProgress && placedAt && (
                <p className="mt-3 inline-block rounded-full bg-black/25 px-3 py-1 text-sm font-bold">
                  Arriving in {order.etaMinutes.min}–{order.etaMinutes.max} mins (ordered at{' '}
                  {timeFormat.format(new Date(placedAt))})
                </p>
              )}
            </div>
          </div>
          {confirming ? (
            <>
              <p className="mt-5 inline-flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Waiting for the payment
                provider to confirm…
              </p>
              {slow && (
                <p className="mt-2 text-sm">
                  This is taking longer than usual. You can leave this page: the order updates as
                  soon as the payment provider confirms, and an unconfirmed payment is never kept.
                </p>
              )}
            </>
          ) : (
            awaitingPayment && (
              <>
                {(payError || redirectFailed) && (
                  <p role="alert" className="mt-4 text-sm font-semibold">
                    {payError ?? 'The payment didn’t go through. You can try again.'}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-5"
                  disabled={startPayment.isPending || payment !== null}
                  onClick={pay}
                >
                  {startPayment.isPending && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  {order.status === 'payment_failed' ? 'Try paying again' : 'Complete payment'}
                </Button>
              </>
            )
          )}
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {TRACKING_STEPS.includes(order.status) && (
            <section
              aria-labelledby="timeline-heading"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <h2 id="timeline-heading" className="mb-4 font-extrabold">
                Order status
              </h2>
              <StatusTimeline order={order} />
            </section>
          )}

          <section aria-labelledby="items-heading" className="rounded-3xl bg-white p-5 shadow-sm">
            <Link to={`/restaurant/${order.restaurant.slug}`} className="flex items-center gap-3">
              <Img
                src={order.restaurant.imageUrl}
                kind="cover"
                alt=""
                sizes="64px"
                className="size-12 rounded-xl"
              />
              <span className="min-w-0">
                <span id="items-heading" className="block truncate font-extrabold">
                  {order.restaurant.name}
                </span>
                <span className="block text-sm text-muted">{order.restaurant.locality}</span>
              </span>
            </Link>
            <ul className="mt-4 space-y-3">
              {order.items.map((line) => (
                <li key={line.itemId} className="flex items-center gap-3 text-[15px]">
                  <VegMark veg={line.isVeg} className="size-3.5" />
                  <span className="min-w-0 flex-1 font-semibold">
                    {line.name} <span className="text-muted">× {line.qty}</span>
                  </span>
                  <span className="tabular font-semibold">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            {order.note && (
              <p className="mt-4 rounded-xl bg-sunken px-3 py-2 text-sm text-ink-soft">
                Note: {order.note}
              </p>
            )}
            <p className="mt-5 flex gap-2 border-t border-line pt-4 text-sm text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Delivering to <strong className="text-ink">{order.address.label}</strong>:{' '}
                {[
                  order.address.line1,
                  order.address.line2,
                  order.address.areaName,
                  order.address.city,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </p>
          </section>
        </div>

        <div className="mt-4">
          <BillDetails bill={order.bill} distanceKm={order.distanceKm} />
          <p className="mt-2 text-center text-sm text-muted">
            {order.paymentStatus === 'paid'
              ? `Paid ${formatPrice(order.bill.grandTotal, order.currency)}${
                  order.paymentProvider === 'fake' ? ' (test payment)' : ''
                }`
              : 'Not paid yet'}
          </p>
        </div>
      </div>

      {awaitingPayment && payment && (
        <PaymentFlow
          orderId={order.id}
          start={payment}
          prefill={{
            name: order.address.name,
            phone: order.address.phone,
            email: session.user?.email ?? undefined,
          }}
          onFinished={onFinished}
        />
      )}
    </div>
  );
}
