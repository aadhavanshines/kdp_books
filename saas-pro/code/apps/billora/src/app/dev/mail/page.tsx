import { listOutbox } from "@saas/core/email";
import { Badge, BrandLogo, Card, CardHeader, EmptyState, formatDateTime } from "@saas/ui";
import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/auth";

export const metadata: Metadata = { title: "Dev mailbox", robots: { index: false } };
export const dynamic = "force-dynamic";

const kindLabel: Record<string, string> = {
  "auth.verify": "Verify email",
  "auth.magic_link": "Magic link",
  "auth.reset_password": "Password reset",
  "team.invite": "Invitation",
};

export default async function DevMailPage() {
  const emails = await listOutbox(db, 100);
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"><BrandLogo product="Billora" /></Link>
          <Badge tone="warning">Development only</Badge>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Mailbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">Emails are stored in the outbox instead of being sent. Open one to click its link.</p>
        <Card className="mt-6">
          <CardHeader title="Outbox" description={`${emails.length} most recent`} />
          {emails.length === 0 ? (
            <EmptyState icon={<span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"><Inbox className="size-6" aria-hidden /></span>} title="No emails yet" description="Sign up, request a magic link or invite someone, and the email appears here." />
          ) : (
            <ul className="divide-y divide-border">
              {emails.map((m) => (
                <li key={m.id}>
                  <Link href={`/dev/mail/${m.id}`} className="flex flex-col gap-1 px-5 py-3.5 outline-none hover:bg-muted/50 focus-visible:bg-muted sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    <div className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate text-sm font-medium">{m.subject}</span>
                      <span className="truncate text-[13px] text-muted-foreground">To {m.to}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone="primary">{kindLabel[m.kind] ?? m.kind}</Badge>
                      <time className="text-xs tabular-nums text-muted-foreground" dateTime={m.createdAt.toISOString()}>{formatDateTime(m.createdAt)}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
