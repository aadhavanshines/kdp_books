import { firstLink, getOutboxEmail } from "@saas/core/email";
import { Badge, Button, Card, formatDateTime } from "@saas/ui";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DevMailMessage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mail = await getOutboxEmail(db, id);
  if (!mail) notFound();
  const link = firstLink(mail.text);
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2"><Link href="/dev/mail"><ArrowLeft /> Mailbox</Link></Button>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="grid min-w-0 gap-1">
            <h1 className="text-xl font-semibold tracking-tight">{mail.subject}</h1>
            <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">To {mail.to} · {formatDateTime(mail.createdAt)}</p>
          </div>
          <Badge tone="warning">Not sent: development outbox</Badge>
        </div>
        {link && (
          <Button asChild className="mt-5"><a href={link}><ExternalLink /> Open the link</a></Button>
        )}
        <Card className="mt-6 overflow-hidden">
          <iframe title="Email preview" srcDoc={mail.html} sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" className="h-[560px] w-full bg-white" />
        </Card>
      </main>
    </div>
  );
}
