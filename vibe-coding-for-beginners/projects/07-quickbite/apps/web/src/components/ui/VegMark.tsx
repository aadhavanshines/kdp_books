import { cn } from '../../lib/cn';

/**
 * The standard Indian food mark: green square with a dot for vegetarian,
 * brown square with a triangle for non-vegetarian.
 */
export function VegMark({
  veg,
  className,
  decorative,
}: {
  veg: boolean;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : veg ? 'Vegetarian' : 'Non-vegetarian'}
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] bg-white',
        veg ? 'border-veg' : 'border-nonveg',
        className,
      )}
    >
      {veg ? (
        <span className="size-2 rounded-full bg-veg" />
      ) : (
        <svg viewBox="0 0 10 9" className="size-2.5 fill-nonveg" aria-hidden>
          <path d="M5 0l5 9H0z" />
        </svg>
      )}
    </span>
  );
}
