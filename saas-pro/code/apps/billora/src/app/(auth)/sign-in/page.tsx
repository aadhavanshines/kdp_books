import { Alert } from "@saas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, googleEnabled, safeNext } from "@/lib/auth";
import { AuthCard } from "../auth-card";
import { GoogleButton } from "../google-button";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

const errors: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Ask for a new one.",
  google: "Google sign-in didn't complete. Please try again.",
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = sp.next ? safeNext(sp.next) : undefined;
  if (await getSession()) redirect(next ?? "/app");
  return (
    <AuthCard
      title="Sign in to Billora"
      description="Welcome back. Pick up where you left off."
      footer={<>New to Billora? <Link className="font-medium text-primary hover:underline" href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}>Create an account</Link></>}
    >
      {sp.reset && <Alert tone="success" className="mb-5">Your password was changed. Sign in with the new one.</Alert>}
      {sp.error && <Alert tone="danger" className="mb-5">{errors[sp.error] ?? "Something went wrong. Please try again."}</Alert>}
      <GoogleButton enabled={googleEnabled} next={next} />
      <SignInForm next={next} defaultEmail={sp.email} />
    </AuthCard>
  );
}
