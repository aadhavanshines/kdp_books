import type { DishSearchHit, Restaurant } from '@quickbite/core';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Img } from '../../components/ui/Img';
import { RatingStar } from '../../components/ui/RatingPill';
import { VegMark } from '../../components/ui/VegMark';
import { formatEta, formatPrice } from '../../lib/format';

export function RestaurantResult({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <Link
      to={`/restaurant/${r.slug}`}
      className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-card transition hover:shadow-raised"
    >
      <Img
        src={r.imageUrl}
        kind="cover"
        alt=""
        sizes="96px"
        className="size-[88px] shrink-0 rounded-xl"
      />
      <div className="min-w-0">
        <p className="truncate font-extrabold">{r.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold">
          <RatingStar rating={r.rating} className="size-4" />
          {r.rating.toFixed(1)} <span className="text-muted">•</span>{' '}
          {formatEta(r.deliveryTimeMin, r.deliveryTimeMax)}
          <span className="text-muted">•</span> {formatPrice(r.costForTwo)} for two
        </p>
        <p className="truncate text-sm text-muted">{r.cuisines.join(', ')}</p>
        {!r.isOpen && <p className="text-xs font-bold text-danger">Currently closed</p>}
      </div>
    </Link>
  );
}

export function DishResult({ hit, action }: { hit: DishSearchHit; action?: ReactNode }) {
  const { item, restaurant: r } = hit;
  return (
    <article
      className="rounded-2xl bg-white p-4 shadow-card"
      aria-label={`${item.name} from ${r.name}`}
    >
      <Link
        to={`/restaurant/${r.slug}`}
        className="flex items-center justify-between gap-3 border-b border-dashed border-line pb-3"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-extrabold text-ink-soft">By {r.name}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted">
            <RatingStar rating={r.rating} className="size-3.5" /> {r.rating.toFixed(1)} ·{' '}
            {formatEta(r.deliveryTimeMin, r.deliveryTimeMax)}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0 text-muted" aria-hidden />
      </Link>
      <div className="flex gap-4 pt-3">
        <div className="min-w-0 flex-1">
          <VegMark veg={item.isVeg} />
          <h3 className="mt-1 font-bold">{item.name}</h3>
          <p className="tabular mt-0.5 font-semibold">{formatPrice(item.price)}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
        </div>
        <div className="flex w-[118px] shrink-0 flex-col items-center">
          {item.imageUrl && (
            <Img
              src={item.imageUrl}
              kind="dish"
              alt={item.name}
              sizes="118px"
              className="aspect-square w-full rounded-xl"
            />
          )}
          {action && <div className={item.imageUrl ? '-mt-5' : 'mt-6'}>{action}</div>}
        </div>
      </div>
    </article>
  );
}
