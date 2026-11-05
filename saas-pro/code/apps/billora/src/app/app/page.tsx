import { listMembers } from "@saas/core/teams";
import { can } from "@saas/core/tenancy";
import { Alert, Button, Card, CardBody, CardHeader, EmptyState, PageHeader, formatINR } from "@saas/ui";
import { CircleCheck, Circle, FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { db, requireWorkspace } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="px-5 py-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Card>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const ctx = await requireWorkspace();
  const members = await listMembers(db, ctx.workspace.id);
  const firstName = ctx.user.name.split(" ")[0];

  const checklist = [
    { done: true, label: "Create your workspace", href: undefined },
    { done: Boolean(ctx.workspace.gstin), label: "Add your GSTIN", detail: "Optional; needed for GST invoices.", href: "/app/settings/workspace" },
    { done: members.length > 1, label: "Invite your accountant or team", href: "/app/settings/team" },
    { done: false, label: "Send your first invoice", detail: "Invoicing arrives in the next update.", href: undefined },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <>
      <PageHeader title={firstName ? `Good to see you, ${firstName}` : "Dashboard"} description={`Here's how ${ctx.workspace.name} is doing.`} />
      {sp.welcome && <Alert tone="success" className="mb-6" title="Your workspace is ready">Finish the checklist below to get the most out of Billora.</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Outstanding" value={formatINR(0)} hint="Across 0 unpaid invoices" />
        <Stat label="Overdue" value={formatINR(0)} hint="Nothing overdue" />
        <Stat label="Collected this month" value={formatINR(0)} hint="No payments yet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader title="Recent invoices" />
          <EmptyState
            title="No invoices yet"
            description="When you send invoices, the latest ones show up here with their status."
            action={<Button disabled aria-disabled title="Coming in the next update"><FilePlus2 /> New invoice</Button>}
          />
        </Card>
        <Card>
          <CardHeader title="Get started" description={`${doneCount} of ${checklist.length} done`} />
          <CardBody className="py-3">
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={doneCount}>
              <div className="h-full rounded-full bg-primary" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
            </div>
            <ul className="grid">
              {checklist.map((item) => {
                const body = (
                  <>
                    {item.done ? <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-primary" aria-label="Done" /> : <Circle className="mt-0.5 size-[18px] shrink-0 text-input" aria-label="To do" />}
                    <span className="grid gap-0.5">
                      <span className={item.done ? "text-sm text-muted-foreground line-through decoration-muted-foreground/40" : "text-sm font-medium"}>{item.label}</span>
                      {item.detail && !item.done && <span className="text-xs text-muted-foreground">{item.detail}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={item.label}>
                    {item.href && !item.done ? (
                      <Link href={item.href} className="-mx-2 flex gap-3 rounded-control px-2 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">{body}</Link>
                    ) : (
                      <div className="flex gap-3 py-2.5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
      {!can(ctx.role, "manageWorkspace") && <p className="mt-6 text-xs text-muted-foreground">You&apos;re a member of {ctx.workspace.name}. Owners and admins manage settings and the team.</p>}
    </>
  );
}
