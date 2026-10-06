import type { Restaurant } from '@quickbite/core';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router';
import { Img } from '../../components/ui/Img';
import { RatingStar } from '../../components/ui/RatingPill';
import { Skeleton } from '../../components/ui/Skeleton';
import { cn } from '../../lib/cn';
import { formatEta, formatPrice } from '../../lib/format';

interface RestaurantCardProps {
  restaurant: Restaurant;
  priority?: boolean;
  className?: string;
}

export function RestaurantCard({ restaurant: r, priority, className }: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurant/${r.slug}`}
      className={cn(
        'group block rounded-3xl outline-offset-4 transition-transform duration-200 active:scale-[0.98] md:hover:scale-[0.97]',
        className,
      )}
      aria-label={`${r.name}, rated ${r.rating}, ${formatEta(r.deliveryTimeMin, r.deliveryTimeMax)}${r.isOpen ? '' : ', currently closed'}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-card">
        <Img
          src={r.imageUrl}
          kind="cover"
          alt=""
          priority={priority}
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn('size-full', !r.isOpen && 'grayscale')}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        {r.offer && (
          <p className="absolute right-3 bottom-2.5 left-3 truncate text-[19px] leading-tight font-extrabold tracking-[-0.01em] text-white uppercase drop-shadow-sm">
            {r.offer.headline} <span className="text-[17px]">{r.offer.subline}</span>
          </p>
        )}
        {r.isPromoted && (
          <span className="absolute top-3 left-3 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur">
            Ad
          </span>
        )}
        {!r.isOpen && (
          <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-ink">
            Currently closed
          </span>
        )}
      </div>
      <div className="px-1 pt-3">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[17px] font-extrabold text-ink">{r.name}</h3>
          {r.isPureVeg && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-veg/10 px-1.5 py-0.5 text-[10px] font-bold text-veg-strong uppercase">
              <Leaf className="size-3" aria-hidden /> Pure veg
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-[15px] font-bold text-ink">
          <RatingStar rating={r.rating} />
          {r.rating.toFixed(1)}
          <span aria-hidden className="text-muted">
            •
          </span>
          {formatEta(r.deliveryTimeMin, r.deliveryTimeMax)}
        </p>
        <p className="mt-0.5 truncate text-[15px] text-muted">{r.cuisines.join(', ')}</p>
        <p className="truncate text-[15px] text-muted">
          {r.locality} · {formatPrice(r.costForTwo)} for two
        </p>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}
