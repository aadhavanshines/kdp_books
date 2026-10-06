import { Star } from 'lucide-react';
import { cn } from '../../lib/cn';
import { formatCount } from '../../lib/format';

function ratingTone(rating: number) {
  if (rating >= 4) return 'bg-rating-high';
  if (rating >= 3) return 'bg-rating-mid';
  return 'bg-rating-low';
}

/** Green star badge used on cards: "★ 4.4". */
export function RatingStar({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 items-center justify-center rounded-full text-white',
        ratingTone(rating),
        className,
      )}
      aria-hidden
    >
      <Star className="size-3 fill-current" strokeWidth={0} />
    </span>
  );
}

/** Rating with count, e.g. "★ 4.4 (18K+ ratings)". */
export function RatingPill({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-bold', className)}>
      <RatingStar rating={rating} />
      <span>
        {rating.toFixed(1)}
        <span className="sr-only"> out of 5</span>
      </span>
      {count !== undefined && (
        <span className="font-medium text-muted">({formatCount(count)} ratings)</span>
      )}
    </span>
  );
}
