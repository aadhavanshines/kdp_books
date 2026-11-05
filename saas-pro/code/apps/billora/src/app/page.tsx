import { BrandLogo, Button } from "@saas/ui";
import { ArrowRight, BadgeIndianRupee, FileText, Users } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const points = [
  { icon: FileText, title: "GST-ready invoices", body: "CGST and SGST, or IGST, worked out for every line." },
  { icon: BadgeIndianRupee, title: "Get paid online", body: "A pay button on every invoice, and polite reminders." },
  { icon: Users, title: "Bring your accountant", body: "Invite your team with the right access for each person." },
];

export default async function HomePage() {
  const session = await getSession();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <BrandLogo product="Billora" />
        <nav className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm"><Link href="/app">Open Billora</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/sign-in">Sign in</Link></Button>
              <Button asChild size="sm"><Link href="/sign-up">Start free</Link></Button>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-12 sm:px-8 sm:pt-20">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground"><span className="size-1.5 rounded-full bg-accent" aria-hidden /> For freelancers and small Indian businesses</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Send invoices. Get paid. Stay GST-ready.</h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">Billora turns invoicing into a two-minute job, so you can get back to the work you&apos;re paid for.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href={session ? "/app" : "/sign-up"}>{session ? "Go to your dashboard" : "Create a free account"} <ArrowRight /></Link></Button>
            {!session && <Button asChild size="lg" variant="secondary"><Link href="/sign-in">Sign in</Link></Button>}
          </div>
        </div>
        <ul className="mt-16 grid gap-4 sm:grid-cols-3">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-card border border-border bg-surface p-5 shadow-card">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon className="size-[18px]" aria-hidden /></span>
              <h2 className="mt-4 text-[15px] font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </main>
      <footer className="px-4 pb-8 text-center text-xs text-muted-foreground">Billora is a fictional product built for <em>Vibe Coding a SaaS</em>. The full site comes later.</footer>
    </div>
  );
}
