import { listUserWorkspaces } from "@saas/core/tenancy";
import { BrandLogo, Button } from "@saas/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, getSession, requireUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up your workspace" };

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  // A failed email-verification link lands here with ?error=...
  if (sp.error && !(await getSession())) redirect("/verify-email?error=1");
  const session = await requireUser("/onboarding");
  const existing = await listUserWorkspaces(db, session.user.id);
  if (existing.length > 0 && !sp.new) redirect("/app");
  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 pt-6 sm:px-8 sm:pt-8">
        <BrandLogo product="Billora" />
        {existing.length > 0 && <Button asChild variant="ghost" size="sm"><Link href="/app">Cancel</Link></Button>}
      </header>
      <main className="flex flex-1 justify-center px-4 pb-12 pt-8 sm:pt-12">
        <div className="w-full max-w-[480px]">
          <p className="text-sm font-medium text-primary">{existing.length > 0 ? "New workspace" : "Step 1 of 1 · Your business"}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {existing.length > 0 ? "Create another workspace" : firstName ? `Welcome, ${firstName}. Let's set up your business.` : "Welcome. Let's set up your business."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">A workspace holds your clients, invoices and team. Each business gets its own.</p>
          <div className="mt-8 rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
            <OnboardingForm askName={!session.user.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
