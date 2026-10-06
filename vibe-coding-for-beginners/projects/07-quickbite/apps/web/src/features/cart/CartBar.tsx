import { ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { formatPrice } from '../../lib/format';
import { displaySubtotal, itemCount } from './cartLogic';
import { useCart } from './cartStore';

/** Sticky "View cart" bar on phones and tablets: the cart that follows you around. */
export function CartBar() {
  const cart = useCart();
  const { pathname } = useLocation();
  const count = itemCount(cart);
  if (count === 0 || pathname.startsWith('/checkout')) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pb-safe lg:hidden">
      <Link
        to="/checkout"
        className="pointer-events-auto mx-auto flex h-14 max-w-xl animate-sheet-up items-center justify-between rounded-2xl bg-success px-4 text-white shadow-raised"
      >
        <span className="flex min-w-0 flex-col">
          <span className="tabular text-[15px] font-extrabold">
            {count} item{count > 1 ? 's' : ''} | {formatPrice(displaySubtotal(cart))}
          </span>
          <span className="truncate text-xs font-medium opacity-90">
            From {cart.restaurant?.name}
          </span>
        </span>
        <span className="flex items-center gap-2 font-extrabold">
          View Cart <ShoppingBag className="size-5" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
