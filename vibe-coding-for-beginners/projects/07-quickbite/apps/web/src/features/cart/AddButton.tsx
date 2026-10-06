import type { MenuItem, Restaurant } from '@quickbite/core';
import { MAX_QTY_PER_ITEM } from '@quickbite/core';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useCart } from './cartStore';

interface AddButtonProps {
  restaurant: Restaurant;
  item: MenuItem;
  className?: string;
}

/** "ADD" that turns into a − qty + stepper, like the big food apps. */
export function AddButton({ restaurant, item, className }: AddButtonProps) {
  const qty = useCart((s) =>
    s.restaurant?.id === restaurant.id ? (s.lines.find((l) => l.itemId === item.id)?.qty ?? 0) : 0,
  );
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const base =
    'relative h-10 w-[112px] rounded-xl border border-line bg-white text-[17px] font-extrabold text-success shadow-[0_3px_12px_rgb(28_25_23/0.12)]';

  if (!item.isAvailable) {
    return (
      <span
        className={cn(
          base,
          'inline-flex items-center justify-center text-sm font-bold text-muted shadow-none',
          className,
        )}
      >
        Sold out
      </span>
    );
  }
  if (!restaurant.isOpen) {
    return (
      <span
        className={cn(
          base,
          'inline-flex items-center justify-center text-sm font-bold text-muted shadow-none',
          className,
        )}
      >
        Closed
      </span>
    );
  }
  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(restaurant, item)}
        aria-label={`Add ${item.name}`}
        className={cn(base, 'transition-colors hover:bg-success/5 active:scale-95', className)}
      >
        ADD
      </button>
    );
  }
  return (
    <div
      className={cn(
        base,
        'flex animate-pop items-center justify-between overflow-hidden',
        className,
      )}
      role="group"
      aria-label={`${item.name} quantity`}
    >
      <button
        type="button"
        onClick={() => setQty(item.id, qty - 1)}
        aria-label={`Remove one ${item.name}`}
        className="flex h-full w-9 items-center justify-center hover:bg-success/5"
      >
        <Minus className="size-4" strokeWidth={3} />
      </button>
      <span className="tabular text-base" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => add(restaurant, item)}
        disabled={qty >= MAX_QTY_PER_ITEM}
        aria-label={`Add one more ${item.name}`}
        className="flex h-full w-9 items-center justify-center hover:bg-success/5 disabled:opacity-40"
      >
        <Plus className="size-4" strokeWidth={3} />
      </button>
    </div>
  );
}

/** Compact stepper for cart lines (no ADD state). */
export function QtyStepper({ itemId, name, qty }: { itemId: string; name: string; qty: number }) {
  const setQty = useCart((s) => s.setQty);
  return (
    <div
      className="flex h-8 w-[84px] items-center justify-between rounded-lg border border-line bg-white font-extrabold text-success"
      role="group"
      aria-label={`${name} quantity`}
    >
      <button
        type="button"
        onClick={() => setQty(itemId, qty - 1)}
        aria-label={`Remove one ${name}`}
        className="flex h-full w-7 items-center justify-center"
      >
        <Minus className="size-3.5" strokeWidth={3} />
      </button>
      <span className="tabular text-sm">{qty}</span>
      <button
        type="button"
        onClick={() => setQty(itemId, qty + 1)}
        disabled={qty >= MAX_QTY_PER_ITEM}
        aria-label={`Add one more ${name}`}
        className="flex h-full w-7 items-center justify-center disabled:opacity-40"
      >
        <Plus className="size-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
