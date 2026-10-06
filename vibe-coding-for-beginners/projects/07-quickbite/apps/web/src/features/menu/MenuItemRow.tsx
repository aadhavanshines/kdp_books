import type { MenuItem } from '@quickbite/core';
import { Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Img } from '../../components/ui/Img';
import { VegMark } from '../../components/ui/VegMark';
import { cn } from '../../lib/cn';
import { formatPrice } from '../../lib/format';

interface MenuItemRowProps {
  item: MenuItem;
  /** The ADD / stepper control (or a "not available" note). */
  action?: ReactNode;
}

export function MenuItemRow({ item, action }: MenuItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const long = item.description.length > 90;

  return (
    <article
      className={cn('flex gap-4 py-6', !item.isAvailable && 'opacity-60')}
      aria-label={item.name}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <VegMark veg={item.isVeg} />
          {item.isBestseller && (
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#c2410c]">
              <Star className="size-3.5 fill-current" strokeWidth={0} aria-hidden /> Bestseller
            </span>
          )}
        </div>
        <h3 className="mt-1.5 text-[17px] leading-snug font-bold text-ink">{item.name}</h3>
        <p className="tabular mt-1 text-[15px] font-semibold text-ink">{formatPrice(item.price)}</p>
        <p
          className={cn('mt-2 text-[15px] leading-relaxed text-muted', !expanded && 'line-clamp-2')}
        >
          {item.description}
        </p>
        {long && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-sm font-bold text-ink-soft hover:text-ink"
          >
            more
          </button>
        )}
      </div>
      <div
        className={cn(
          'relative flex shrink-0 flex-col items-center',
          item.imageUrl ? 'w-[132px] md:w-[156px]' : 'w-[120px] justify-center',
        )}
      >
        {item.imageUrl && (
          <Img
            src={item.imageUrl}
            kind="dish"
            alt={item.name}
            sizes="156px"
            className="aspect-[156/144] w-full rounded-2xl"
          />
        )}
        {action && <div className={cn(item.imageUrl && '-mt-5')}>{action}</div>}
      </div>
    </article>
  );
}
