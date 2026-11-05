import { Alert } from "@saas/ui";
import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { AuthCard, DevMailHint } from "../auth-card";
import { ResendForm } from "./resend-form";

export const metadata: Metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const session = await getSession();
  if (session?.user.emailVerified) redirect("/app");
  const parsed = z.email().safeParse(sp.email ?? session?.user.email);
  const email = parsed.success ? parsed.data : undefined;

  if (sp.error) {
    return (
      <AuthCard title="That link didn't work" description="Verification links expire after an hour and work once.">
        <Alert tone="danger" className="mb-5">The verification link is invalid or has expired.</Alert>
        {email ? <ResendForm email={email} /> : <Link className="text-sm font-medium text-primary hover:underline" href="/sign-in">Sign in to get a new link</Link>}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Check your email"
      footer={<>Wrong address? <Link className="font-medium text-primary hover:underline" href="/sign-up">Sign up again</Link></>}
    >
      <div className="-mt-2 mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><MailCheck className="size-5" aria-hidden /></span>
        <p className="text-sm text-muted-foreground">
          {sp.resent ? "Your email isn't verified yet, so we sent a new link" : "We sent a verification link"} to{" "}
          <strong className="font-medium text-foreground [overflow-wrap:anywhere]">{email ?? "your inbox"}</strong>. Click it to finish setting up your account.
        </p>
      </div>
      {email && <ResendForm email={email} />}
      <DevMailHint />
    </AuthCard>
  );
}
