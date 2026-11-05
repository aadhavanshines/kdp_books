import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ title, description, children, footer }: { title: string; description?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <div className="rounded-card border border-border bg-surface px-6 py-7 shadow-card sm:px-8 sm:py-8">
        <div className="mb-6 grid gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
      {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
    </>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function DevMailHint() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="mt-4 rounded-control border border-dashed border-border bg-muted/60 px-3 py-2 text-[13px] text-muted-foreground">
      Development: emails aren&apos;t sent. Open <Link className="font-medium text-primary underline underline-offset-2" href="/dev/mail">/dev/mail</Link> to click the link.
    </p>
  );
}
