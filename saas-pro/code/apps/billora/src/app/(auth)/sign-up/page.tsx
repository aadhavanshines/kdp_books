import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, googleEnabled, safeNext } from "@/lib/auth";
import { AuthCard } from "../auth-card";
import { GoogleButton } from "../google-button";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = sp.next ? safeNext(sp.next) : undefined;
  if (await getSession()) redirect(next ?? "/app");
  return (
    <AuthCard
      title="Create your Billora account"
      description="Send GST-ready invoices and get paid faster. Free to start."
      footer={<>Already have an account? <Link className="font-medium text-primary hover:underline" href={next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"}>Sign in</Link></>}
    >
      <GoogleButton enabled={googleEnabled} next={next} />
      <SignUpForm next={next} defaultEmail={sp.email} />
    </AuthCard>
  );
}
