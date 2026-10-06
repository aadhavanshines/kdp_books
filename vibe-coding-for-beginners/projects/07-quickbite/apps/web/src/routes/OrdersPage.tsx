import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { buttonClass } from '../components/ui/buttonClass';
import { EmptyState } from '../components/ui/EmptyState';
import { Img } from '../components/ui/Img';
import { Skeleton } from '../components/ui/Skeleton';
import { RequireSignIn } from '../features/auth/RequireSignIn';
import { useOrders } from '../features/orders/queries';
import { STATUS_BADGE } from '../features/orders/statusText';
import { cn } from '../lib/cn';
import { formatPrice } from '../lib/format';

export function OrdersPage() {
  return (
    <RequireSignIn
      title="Sign in to see your orders"
      description="Track live orders and look back at past ones."
    >
      <OrdersList />
    </RequireSignIn>
  );
}

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const TONES = {
  muted: 'bg-sunken text-ink-soft',
  live: 'bg-brand-50 text-brand-700',
  done: 'bg-success/10 text-success-strong',
  bad: 'bg-danger/10 text-danger',
};

function OrdersList() {
  const { data: orders, isLoading, isError } = useOrders();

  return (
    <div className="bg-sunken pb-16">
      <div className="container-page max-w-3xl pt-6 md:pt-10">
        <h1 className="text-2xl font-extrabold md:text-3xl">Your orders</h1>
        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <p role="alert" className="mt-6 font-semibold text-danger">
            We couldn’t load your orders. Please try again.
          </p>
        ) : !orders?.length ? (
          <EmptyState
            title="No orders yet"
            description="Your orders will show up here, with live tracking while they’re on the way."
            action={
              <Link to="/" className={buttonClass()}>
                Find something to eat
              </Link>
            }
          />
        ) : (
          <ul className="mt-6 space-y-3">
            {orders.map((order) => {
              const badge = STATUS_BADGE[order.status];
              const count = order.items.reduce((n, l) => n + l.qty, 0);
              return (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm transition-shadow hover:shadow-card"
                  >
                    <Img
                      src={order.restaurant.imageUrl}
                      kind="cover"
                      alt=""
                      sizes="64px"
                      className="size-14 shrink-0 rounded-2xl"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-extrabold">{order.restaurant.name}</span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-bold',
                            TONES[badge.tone],
                          )}
                        >
                          {badge.label}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted">
                        {count} {count === 1 ? 'item' : 'items'} ·{' '}
                        {formatPrice(order.bill.grandTotal, order.currency)} ·{' '}
                        {dateFormat.format(new Date(order.createdAt))}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
