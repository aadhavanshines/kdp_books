import { ROLE_LABELS } from "@saas/core/tenancy";
import { getInvitationByToken } from "@saas/core/teams";
import { Alert, BrandLogo, Button } from "@saas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, getSession } from "@/lib/auth";
import { signOutAction } from "../../(auth)/actions";
import { AcceptForm } from "./accept-form";

export const metadata: Metadata = { title: "Join a workspace", robots: { index: false } };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-background px-4 py-10 sm:justify-center">
      <Link href="/" className="mb-8 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"><BrandLogo product="Billora" /></Link>
      <div className="w-full max-w-[420px] rounded-card border border-border bg-surface px-6 py-8 text-center shadow-card sm:px-8">{children}</div>
    </div>
  );
}

const messages = {
  accepted: { title: "This invitation was already used", body: "If it was you, just sign in to open the workspace." },
  revoked: { title: "This invitation was cancelled", body: "Ask the person who invited you to send a new one." },
  expired: { title: "This invitation has expired", body: "Invitations last 7 days. Ask for a new one." },
} as const;

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await getInvitationByToken(db, token);
  const session = await getSession();
  const here = `/invite/${token}`;

  if (!found) {
    return (
      <Shell>
        <h1 className="text-xl font-semibold">Invitation not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Check that you opened the whole link from the email. It may also have been replaced by a newer invitation.</p>
        <Button asChild variant="secondary" className="mt-6 w-full"><Link href={session ? "/app" : "/sign-in"}>{session ? "Go to Billora" : "Sign in"}</Link></Button>
      </Shell>
    );
  }

  const { invitation: inv, workspaceName, inviterName, status } = found;
  if (status !== "pending") {
    const m = messages[status];
    return (
      <Shell>
        <h1 className="text-xl font-semibold">{m.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
        <Button asChild variant="secondary" className="mt-6 w-full"><Link href={session ? "/app" : "/sign-in"}>{session ? "Go to Billora" : "Sign in"}</Link></Button>
      </Shell>
    );
  }

  if (session && !session.user.emailVerified) redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);

  const intro = (
    <>
      <span aria-hidden className="mx-auto flex size-14 items-center justify-center rounded-xl bg-accent-soft text-xl font-semibold text-accent-soft-foreground">{workspaceName.charAt(0).toUpperCase()}</span>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">Join {workspaceName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {inviterName ?? "Someone"} invited <strong className="font-medium text-foreground [overflow-wrap:anywhere]">{inv.email}</strong> to join as {inv.role === "admin" ? "an" : "a"} {ROLE_LABELS[inv.role].toLowerCase()}.
      </p>
    </>
  );

  if (!session) {
    const q = `next=${encodeURIComponent(here)}&email=${encodeURIComponent(inv.email)}`;
    return (
      <Shell>
        {intro}
        <div className="mt-7 grid gap-2.5">
          <Button asChild size="lg"><Link href={`/sign-up?${q}`}>Create an account to join</Link></Button>
          <Button asChild size="lg" variant="secondary"><Link href={`/sign-in?${q}`}>I already have an account</Link></Button>
        </div>
      </Shell>
    );
  }

  if (session.user.email.toLowerCase() !== inv.email) {
    return (
      <Shell>
        {intro}
        <Alert tone="warning" className="mt-6 text-left">
          You&apos;re signed in as <strong className="font-medium">{session.user.email}</strong>. Sign in as {inv.email} to accept.
        </Alert>
        <form action={signOutAction} className="mt-5">
          <Button type="submit" variant="secondary" className="w-full">Sign out and switch account</Button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      {intro}
      <div className="mt-7"><AcceptForm token={token} workspaceName={workspaceName} /></div>
      <p className="mt-4 text-xs text-muted-foreground">Signed in as {session.user.email}</p>
    </Shell>
  );
}
