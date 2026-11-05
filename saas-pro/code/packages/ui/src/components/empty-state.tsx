import type { ReactNode } from "react";
import { cn } from "../cn";

/** A small original illustration drawn with theme roles. */
export function EmptyIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={cn("h-20 w-auto", className)} aria-hidden fill="none">
      <rect x="18" y="14" width="84" height="66" rx="10" className="fill-surface stroke-border" strokeWidth="2" />
      <rect x="18" y="14" width="84" height="16" rx="10" className="fill-muted" />
      <circle cx="30" cy="22" r="3" className="fill-border" />
      <circle cx="40" cy="22" r="3" className="fill-border" />
      <rect x="30" y="42" width="36" height="6" rx="3" className="fill-primary-soft" />
      <rect x="30" y="54" width="60" height="5" rx="2.5" className="fill-muted" />
      <rect x="30" y="64" width="46" height="5" rx="2.5" className="fill-muted" />
      <circle cx="92" cy="70" r="14" className="fill-primary" />
      <path d="M92 64v12M86 70h12" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ title, description, action, icon, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon ?? <EmptyIllustration />}
      <h3 className="mt-4 text-[15px] font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
