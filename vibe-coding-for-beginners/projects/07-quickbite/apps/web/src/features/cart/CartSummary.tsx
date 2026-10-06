import type { Restaurant } from '@quickbite/core';
import { Link } from 'react-router';
import { Button } from '../../components/ui/Button';
import { PlateArt } from '../../components/ui/EmptyState';
import { Img } from '../../components/ui/Img';
import { VegMark } from '../../components/ui/VegMark';
import { formatPrice } from '../../lib/format';
import { QtyStepper } from './AddButton';
import { displaySubtotal } from './cartLogic';
import { useCart } from './cartStore';

/** Desktop cart panel shown beside a restaurant menu. */
export function CartSummary({ restaurant }: { restaurant?: Restaurant }) {
  const cart = useCart();
  const sameRestaurant = !restaurant || cart.restaurant?.id === restaurant.id;

  return (
    <div className="sticky top-28 rounded-3xl border border-line bg-white p-5 shadow-card">
      <h2 className="text-xl font-extrabold">Cart</h2>
      {cart.lines.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <PlateArt className="h-20" />
          <p className="mt-4 font-bold">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">
            Good food is always cooking. Add a dish to get started.
          </p>
        </div>
      ) : (
        <>
          <Link
            to={`/restaurant/${cart.restaurant!.slug}`}
            className="mt-3 flex items-center gap-3"
          >
            <Img
              src={cart.restaurant!.imageUrl}
              kind="cover"
              alt=""
              sizes="64px"
              className="size-12 rounded-xl"
            />
            <span className="min-w-0">
              <span className="block truncate font-extrabold">{cart.restaurant!.name}</span>
              <span className="block text-sm text-muted">{cart.restaurant!.locality}</span>
            </span>
          </Link>
          {!sameRestaurant && (
            <p className="mt-3 rounded-xl bg-warning/10 px-3 py-2 text-xs font-semibold text-warning-strong">
              These items are from another restaurant.
            </p>
          )}
          <ul className="mt-4 max-h-[42vh] space-y-4 overflow-y-auto pr-1">
            {cart.lines.map((l) => (
              <li key={l.itemId} className="flex items-center gap-3">
                <VegMark veg={l.isVeg} className="size-3.5" />
                <span className="min-w-0 flex-1 text-sm font-semibold">{l.name}</span>
                <QtyStepper itemId={l.itemId} name={l.name} qty={l.qty} />
                <span className="tabular w-16 text-right text-sm font-semibold">
                  {formatPrice(l.price * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-line pt-4">
            <span className="font-bold">Subtotal</span>
            <span className="tabular text-lg font-extrabold">
              {formatPrice(displaySubtotal(cart))}
            </span>
          </div>
          <p className="text-xs text-muted">
            Delivery fee, taxes and coupons are applied at checkout.
          </p>
          <Link to="/checkout" className="mt-4 block">
            <Button block size="lg">
              Checkout
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
