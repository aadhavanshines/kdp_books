import { ShoppingBag } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '../../lib/cn';
import { itemCount } from '../../features/cart/cartLogic';
import { useCart } from '../../features/cart/cartStore';

export function CartNavLink() {
  const count = useCart(itemCount);
  return (
    <NavLink
      to="/checkout"
      aria-label={count ? `Cart, ${count} item${count > 1 ? 's' : ''}` : 'Cart'}
      className={({ isActive }) =>
        cn(
          'relative inline-flex h-10 items-center gap-3.5 rounded-full px-2.5 font-semibold text-ink-soft transition-colors hover:text-brand-600 lg:px-3',
          isActive && 'text-brand-600',
        )
      }
    >
      <span className="relative">
        <ShoppingBag className="size-5" />
        {count > 0 && (
          <span className="tabular absolute -top-2 -right-3 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-success px-1 text-[11px] font-extrabold text-white">
            {count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Cart</span>
    </NavLink>
  );
}
