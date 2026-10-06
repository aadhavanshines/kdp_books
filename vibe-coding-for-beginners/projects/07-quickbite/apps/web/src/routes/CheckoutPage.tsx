import {
  ArrowLeft,
  BadgePercent,
  ChevronRight,
  CircleAlert,
  Lock,
  PartyPopper,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/Button';
import { buttonClass } from '../components/ui/buttonClass';
import { EmptyState } from '../components/ui/EmptyState';
import { Img } from '../components/ui/Img';
import { Skeleton } from '../components/ui/Skeleton';
import { VegMark } from '../components/ui/VegMark';
import { AddressIcon, AddressSheet } from '../features/addresses/AddressPicker';
import { formatAddress } from '../features/addresses/formatAddress';
import { useAddresses } from '../features/addresses/queries';
import { useSignInHref } from '../features/auth/useSignInHref';
import { useSession } from '../features/auth/sessionStore';
import { useArea } from '../features/catalog/queries';
import { QtyStepper } from '../features/cart/AddButton';
import { displaySubtotal, itemCount } from '../features/cart/cartLogic';
import { useCart } from '../features/cart/cartStore';
import { BillDetails } from '../features/checkout/BillDetails';
import { useCheckoutStore } from '../features/checkout/checkoutStore';
import { couponRejectionMessage } from '../features/checkout/couponMessages';
import { CouponSheet } from '../features/checkout/CouponSheet';
import { useQuote } from '../features/checkout/useQuote';
import { useLocationStore } from '../features/location/locationStore';
import { usePlaceOrder } from '../features/orders/queries';
import { PaymentFlow, type PaymentResult } from '../features/payments/PaymentFlow';
import type { PaymentStart, PlaceOrderError, QuoteError } from '../backend';
import { cn } from '../lib/cn';
import { formatPrice } from '../lib/format';

const QUOTE_ERRORS: Record<QuoteError, string> = {
  EMPTY_CART: 'Your cart is empty.',
  INVALID_QUANTITY: 'One of the quantities is not allowed.',
  NOT_DELIVERABLE:
    'This restaurant doesn’t deliver to the selected address. Choose an address closer to the restaurant.',
  RESTAURANT_NOT_FOUND: 'This restaurant is no longer available.',
  RESTAURANT_CLOSED: 'This restaurant has just closed. You can order again when it reopens.',
  ADDRESS_NOT_FOUND: 'Please choose your delivery address again.',
};

const PLACE_ERRORS: Record<PlaceOrderError, string> = {
  ...QUOTE_ERRORS,
  COUPON_NOT_APPLICABLE: 'Your coupon no longer applies to this order. Remove it and try again.',
  RATE_LIMITED: 'Too many orders in a short time. Please wait a minute and try again.',
  UNAVAILABLE_ITEMS: 'Some items just became unavailable. Review your cart and try again.',
  PAYMENTS_UNAVAILABLE: 'Online payment isn’t available in this area yet.',
  ALREADY_PAID: 'You’ve already paid for this order. You can follow it in Your orders.',
  CHECKOUT_EXPIRED: 'That checkout timed out before it was paid. Tap pay again to start a new one.',
};

interface PendingPayment {
  orderId: string;
  start: PaymentStart;
}

export function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const areaId = useLocationStore((s) => s.areaId);
  const { data: area } = useArea(areaId);
  const session = useSession();
  const signedIn = Boolean(session.user);
  const signInHref = useSignInHref();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const storedAddressId = useCheckoutStore((s) => s.addressId);
  const setAddressId = useCheckoutStore((s) => s.setAddressId);
  const address = addresses?.find((a) => a.id === storedAddressId) ?? addresses?.[0] ?? null;
  const quote = useQuote(address?.id ?? null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const keyFor = useCheckoutStore((s) => s.keyFor);
  const finishAttempt = useCheckoutStore((s) => s.finishAttempt);
  const place = usePlaceOrder();
  const [payment, setPayment] = useState<PendingPayment | null>(null);
  const [placeError, setPlaceError] = useState<string | null>(null);

  if (cart.lines.length === 0 || !cart.restaurant) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="You can go to the home page to view more restaurants."
        action={
          <Link to="/">
            <Button>See restaurants near you</Button>
          </Link>
        }
      />
    );
  }

  const q = quote.data;
  const bill = q?.ok ? q.bill : null;
  const couponIssue = q?.ok
    ? q.couponNotFound
      ? couponRejectionMessage({ reason: 'NOT_FOUND' })
      : q.bill.couponRejection
        ? couponRejectionMessage(q.bill.couponRejection)
        : null
    : null;
  const canPay = Boolean(signedIn && address && bill && !quote.isFetching && !place.isPending);

  /** Creates the order on the server (which prices it again), then opens the payment. */
  const startPayment = () => {
    if (!address || !bill || !cart.restaurant) return;
    setPlaceError(null);
    const request = {
      restaurantId: cart.restaurant.id,
      items: cart.lines.map((l) => ({ itemId: l.itemId, qty: l.qty })),
      addressId: address.id,
      couponCode: bill.appliedCouponCode ?? undefined,
      note: cart.note.trim() || undefined,
    };
    const idempotencyKey = keyFor(JSON.stringify(request));
    place.mutate(
      { ...request, idempotencyKey },
      {
        onSuccess: (result) => {
          if (!result.ok) {
            setPlaceError(PLACE_ERRORS[result.error]);
            // That checkout is over: the next tap starts a new one.
            if (result.error === 'ALREADY_PAID' || result.error === 'CHECKOUT_EXPIRED') {
              finishAttempt();
            }
            void quote.refetch();
            return;
          }
          setPayment({ orderId: result.orderId, start: result.payment });
        },
        onError: () => setPlaceError('We couldn’t place your order. Please try again.'),
      },
    );
  };

  const onPaymentFinished = (result: PaymentResult) => {
    const { orderId, start } = payment!;
    setPayment(null);
    if (result.status === 'paid') {
      navigate(`/orders/${orderId}`, { state: { justPaid: true } });
      cart.clear();
      finishAttempt();
    } else if (result.status === 'failed' && start.provider === 'fake') {
      // The test sheet's "failed payment" shows the order page with its retry button.
      navigate(`/orders/${orderId}`, { state: { justPaid: false } });
    } else if (result.message || result.status === 'failed') {
      // Same cart, same checkout: paying again reuses this order and its provider payment.
      setPlaceError(
        `Payment failed${result.message ? `: ${result.message}` : ''}. You can try again.`,
      );
    }
  };
  const payLabel = place.isPending
    ? 'Placing your order…'
    : bill
      ? `Proceed to pay ${formatPrice(bill.grandTotal)}`
      : !signedIn
        ? 'Sign in to continue'
        : address
          ? 'Calculating total…'
          : 'Add an address to continue';

  return (
    <div className="bg-sunken pb-32 lg:pb-16">
      <div className="container-page max-w-5xl pt-4 md:pt-8">
        <div className="mb-4 flex items-center gap-2 md:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-extrabold md:text-3xl">Checkout</h1>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          {/* Left column on desktop: delivery and payment steps. */}
          <div className="order-2 space-y-4 lg:order-1">
            {!signedIn && (
              <section
                aria-labelledby="account-heading"
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <h2 id="account-heading" className="font-extrabold">
                  Account
                </h2>
                <p className="mt-2 text-sm text-muted">
                  To place your order, sign in to your account or create one. It only takes your
                  email.
                </p>
                <Link to={signInHref} className={buttonClass({ className: 'mt-3' })}>
                  Sign in to continue
                </Link>
              </section>
            )}
            {signedIn && (
              <section
                aria-labelledby="address-heading"
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 id="address-heading" className="font-extrabold">
                    Delivery address
                  </h2>
                  {address && (
                    <button
                      type="button"
                      onClick={() => setAddressOpen(true)}
                      className="text-sm font-extrabold text-brand-600"
                    >
                      CHANGE
                    </button>
                  )}
                </div>
                {addressesLoading ? (
                  <Skeleton className="mt-4 h-16 w-full" />
                ) : address ? (
                  <div className="mt-3 flex gap-3">
                    <AddressIcon
                      label={address.label}
                      className="mt-0.5 size-5 shrink-0 text-ink"
                    />
                    <div>
                      <p className="font-bold">{address.label}</p>
                      <p className="text-sm text-muted">{formatAddress(address)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {address.name} · {address.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <p className="text-sm text-muted">Add where you’d like your food delivered.</p>
                    <Button className="mt-3" onClick={() => setAddressOpen(true)}>
                      Add delivery address
                    </Button>
                  </div>
                )}
              </section>
            )}

            <section
              aria-labelledby="payment-heading"
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <h2 id="payment-heading" className="font-extrabold">
                Payment
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                Pay securely with UPI or cards. The amount is calculated on our servers and the
                payment is verified before your order is placed.
              </p>
              <Button
                size="lg"
                block
                className="mt-4 hidden lg:flex"
                disabled={!canPay}
                onClick={startPayment}
              >
                <Lock className="size-4" aria-hidden />
                {payLabel}
              </Button>
              {placeError && (
                <p role="alert" className="mt-3 text-sm font-semibold text-danger">
                  {placeError}
                </p>
              )}
            </section>
          </div>

          {/* Right column on desktop (top on phones): cart, coupon and bill. */}
          <div className="order-1 space-y-4 lg:sticky lg:top-28 lg:order-2 lg:self-start">
            <section aria-label="Your order" className="rounded-3xl bg-white p-5 shadow-sm">
              <Link to={`/restaurant/${cart.restaurant.slug}`} className="flex items-center gap-3">
                <Img
                  src={cart.restaurant.imageUrl}
                  kind="cover"
                  alt=""
                  sizes="64px"
                  className="size-12 rounded-xl"
                />
                <span className="min-w-0">
                  <span className="block truncate font-extrabold">{cart.restaurant.name}</span>
                  <span className="block text-sm text-muted">{cart.restaurant.locality}</span>
                </span>
              </Link>
              {quote.pricesChanged && (
                <Notice tone="warning" onDismiss={quote.dismissPricesChanged}>
                  Some prices or items changed since you added them. Your cart now shows the latest
                  menu.
                </Notice>
              )}
              <ul className="mt-4 space-y-4">
                {cart.lines.map((l) => (
                  <li key={l.itemId} className="flex items-center gap-3">
                    <VegMark veg={l.isVeg} className="size-3.5" />
                    <span className="min-w-0 flex-1 text-[15px] font-semibold">{l.name}</span>
                    <QtyStepper itemId={l.itemId} name={l.name} qty={l.qty} />
                    <span className="tabular w-16 text-right text-[15px] font-semibold">
                      {formatPrice(l.price * l.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <label className="mt-5 block">
                <span className="sr-only">Cooking instructions</span>
                <textarea
                  value={cart.note}
                  onChange={(e) => cart.setNote(e.target.value)}
                  placeholder="Any suggestions? We’ll pass them on to the restaurant (optional)"
                  rows={2}
                  className="w-full resize-none rounded-xl bg-sunken px-4 py-3 text-sm placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-brand-200 focus:outline-none"
                />
              </label>
              <Link
                to={`/restaurant/${cart.restaurant.slug}`}
                className="mt-2 inline-block text-sm font-bold text-brand-600"
              >
                + Add more items
              </Link>
            </section>

            <section aria-label="Coupons" className="rounded-3xl bg-white shadow-sm">
              {cart.couponCode && bill?.appliedCouponCode ? (
                <div className="flex items-center gap-3 p-5">
                  <PartyPopper className="size-6 shrink-0 text-success" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">‘{bill.appliedCouponCode}’ applied</p>
                    <p className="text-sm font-semibold text-success">
                      You save {formatPrice(bill.savings)} on this order
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cart.setCoupon(null)}
                    className="text-sm font-extrabold text-brand-600"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCouponOpen(true)}
                  className="flex w-full items-center gap-3 p-5 text-left"
                >
                  <BadgePercent className="size-6 shrink-0 text-brand-600" aria-hidden />
                  <span className="flex-1">
                    <span className="block font-extrabold">Apply coupon</span>
                    {couponIssue && cart.couponCode && (
                      <span className="block text-sm font-semibold text-warning-strong">
                        {cart.couponCode}: {couponIssue}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="size-5 text-muted" aria-hidden />
                </button>
              )}
            </section>

            {!signedIn || !address ? (
              <section className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="tabular flex items-baseline justify-between text-[15px]">
                  <span className="text-ink-soft">Item total ({itemCount(cart)} items)</span>
                  <span className="font-semibold">{formatPrice(displaySubtotal(cart))}</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {signedIn
                    ? 'Add a delivery address to see the delivery fee, taxes and your total.'
                    : 'Sign in and add a delivery address to see the delivery fee, taxes and your total.'}
                </p>
              </section>
            ) : q && !q.ok ? (
              <Notice tone="danger">{QUOTE_ERRORS[q.error]}</Notice>
            ) : bill && q?.ok ? (
              <div className={cn('transition-opacity', quote.isFetching && 'opacity-60')}>
                <BillDetails bill={bill} distanceKm={q.distanceKm} />
                {bill.savings > 0 && (
                  <p className="mt-3 rounded-2xl bg-success/10 px-4 py-3 text-center text-sm font-bold text-success-strong">
                    🎉 You’re saving {formatPrice(bill.savings)} on this order
                  </p>
                )}
              </div>
            ) : quote.isError ? (
              <Notice tone="danger">
                We couldn’t calculate your bill. Check your connection and try again.
              </Notice>
            ) : (
              <Skeleton className="h-64 w-full rounded-3xl" />
            )}
          </div>
        </div>
      </div>

      {/* Sticky pay bar on phones and tablets. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-4 pt-3 pb-3 pb-safe shadow-bar lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          {bill && (
            <div className="shrink-0">
              <p className="tabular text-lg leading-tight font-extrabold">
                {formatPrice(bill.grandTotal)}
              </p>
              <p className="text-xs font-bold text-brand-600">TO PAY</p>
            </div>
          )}
          {!signedIn ? (
            <Link to={signInHref} className={buttonClass({ size: 'lg', block: true })}>
              Sign in to proceed
            </Link>
          ) : address ? (
            <Button size="lg" block disabled={!canPay} onClick={startPayment}>
              {place.isPending ? 'Placing order…' : 'Proceed to pay'}
            </Button>
          ) : (
            <Button size="lg" block onClick={() => setAddressOpen(true)}>
              Add address to proceed
            </Button>
          )}
        </div>
      </div>

      <AddressSheet
        open={addressOpen}
        onOpenChange={setAddressOpen}
        selectedId={address?.id ?? null}
        onSelect={(a) => setAddressId(a.id)}
        defaultAreaId={area?.id ?? areaId}
      />
      <CouponSheet
        open={couponOpen}
        onOpenChange={setCouponOpen}
        brandId={cart.restaurant.brandId}
        itemTotal={displaySubtotal(cart)}
        regionId={area?.regionId ?? 'IN'}
        onApply={(code) => cart.setCoupon(code)}
      />
      {payment && (
        <PaymentFlow
          orderId={payment.orderId}
          start={payment.start}
          prefill={{
            name: address?.name,
            phone: address?.phone,
            email: session.user?.email ?? undefined,
          }}
          onFinished={onPaymentFinished}
        />
      )}
    </div>
  );
}

function Notice({
  tone,
  children,
  onDismiss,
}: {
  tone: 'warning' | 'danger';
  children: React.ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        'mt-3 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold',
        tone === 'warning' ? 'bg-warning/10 text-warning-strong' : 'bg-danger/10 text-danger',
      )}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
