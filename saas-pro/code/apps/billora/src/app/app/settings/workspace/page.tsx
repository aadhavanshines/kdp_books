import { stateName } from "@saas/core/india";
import { can } from "@saas/core/tenancy";
import { Card, CardBody, CardHeader, formatDate } from "@saas/ui";
import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/auth";
import { WorkspaceForm } from "./workspace-form";

export const metadata: Metadata = { title: "Workspace settings" };

const COMMON_ZONES = ["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Kathmandu", "Asia/Dhaka", "Asia/Colombo", "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Australia/Sydney", "UTC"];

export default async function WorkspaceSettingsPage() {
  const ctx = await requireWorkspace();
  const ws = ctx.workspace;
  const zones = COMMON_ZONES.includes(ws.timeZone) ? COMMON_ZONES : [ws.timeZone, ...COMMON_ZONES];
  return (
    <>
      <WorkspaceForm
        canEdit={can(ctx.role, "manageWorkspace")}
        timeZones={zones}
        defaults={{ name: ws.name, billingState: ws.billingState, gstin: ws.gstin, timeZone: ws.timeZone }}
      />
      <Card>
        <CardHeader title="About this workspace" />
        <CardBody>
          <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <div><dt className="text-muted-foreground">Workspace URL name</dt><dd className="mt-1 font-mono text-[13px] [overflow-wrap:anywhere]">{ws.slug}</dd></div>
            <div><dt className="text-muted-foreground">Place of business</dt><dd className="mt-1">{stateName(ws.billingState) ?? "Not set"}, India</dd></div>
            <div><dt className="text-muted-foreground">Created</dt><dd className="mt-1">{formatDate(ws.createdAt, ws.timeZone)}</dd></div>
          </dl>
        </CardBody>
      </Card>
    </>
  );
}
