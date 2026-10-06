import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  art?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, art, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center px-6 py-14 text-center',
        className,
      )}
    >
      {art ?? <PlateArt />}
      <h2 className="mt-6 text-lg font-extrabold text-ink">{title}</h2>
      {description && <p className="mt-1.5 text-[15px] text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Friendly empty plate with cutlery: the default empty-state illustration. */
export function PlateArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={cn('h-28 w-auto', className)} aria-hidden>
      <ellipse cx="80" cy="104" rx="52" ry="7" fill="#efe9e4" />
      <circle cx="80" cy="60" r="42" fill="#fff" stroke="#ebe3dc" strokeWidth="3" />
      <circle cx="80" cy="60" r="29" fill="#fff6f2" stroke="#f6dfd4" strokeWidth="2" />
      <path
        d="M25 30v22a6 6 0 0 0 12 0V30M31 30v70"
        stroke="#d9cfc7"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M135 30c-8 6-8 26 0 30v40"
        stroke="#d9cfc7"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="70" cy="56" r="3" fill="#f8704a" />
      <circle cx="90" cy="56" r="3" fill="#f8704a" />
      <path
        d="M70 70q10 7 20 0"
        stroke="#f8704a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
