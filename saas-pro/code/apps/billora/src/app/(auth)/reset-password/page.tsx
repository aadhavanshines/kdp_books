import { Alert, Button } from "@saas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "../auth-card";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { token, error } = await searchParams;
  if (!token || error) {
    return (
      <AuthCard title="This link has expired" description="Password reset links work once and expire after an hour.">
        <Alert tone="danger" className="mb-5">The reset link is invalid or has expired.</Alert>
        <Button asChild className="w-full"><Link href="/forgot-password">Get a new link</Link></Button>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Choose a new password">
      <ResetForm token={token} />
    </AuthCard>
  );
}
