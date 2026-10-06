import { cn } from '../../lib/cn';

/** Shimmering placeholder shown while content loads (prevents layout jumps). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-lg bg-[linear-gradient(90deg,#f1eeeb_0%,#f8f6f4_50%,#f1eeeb_100%)] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}
