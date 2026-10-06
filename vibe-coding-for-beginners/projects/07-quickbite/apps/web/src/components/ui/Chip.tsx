import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Toggle chips announce their state to screen readers via aria-pressed. */
  selected?: boolean;
  icon?: ReactNode;
  /** Show a × when selected (for removable filters). */
  removable?: boolean;
}

export function Chip({ selected, icon, removable, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold whitespace-nowrap shadow-[0_1px_2px_rgb(28_25_23/0.06)] transition-colors',
        selected
          ? 'border-ink bg-ink/[0.04] text-ink'
          : 'border-line bg-white text-ink-soft hover:border-ink/25',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {selected && removable && <X className="-mr-1 size-3.5" aria-hidden />}
    </button>
  );
}
