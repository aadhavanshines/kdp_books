import { cn } from '../lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-9', className)} aria-hidden>
      <rect width="64" height="64" rx="18" fill="#E8461E" />
      <path
        d="M32 14c-9.94 0-18 8.06-18 18s8.06 18 18 18c3.6 0 6.95-1.06 9.76-2.88l4.07 4.07a3 3 0 0 0 4.24-4.24l-4.07-4.07A17.9 17.9 0 0 0 50 32c0-9.94-8.06-18-18-18Zm0 8a10 10 0 0 1 9.95 9H22.05A10 10 0 0 1 32 22Z"
        fill="#fff"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      {!compact && (
        <span className="text-[22px] leading-none font-extrabold tracking-[-0.01em] text-ink">
          Quick<span className="text-brand-500">Bite</span>
        </span>
      )}
    </span>
  );
}
