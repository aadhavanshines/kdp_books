import { listMembers, listPendingInvitations } from "@saas/core/teams";
import { can, ROLE_LABELS } from "@saas/core/tenancy";
import { Avatar, Badge, Card, CardHeader, DataTable, EmptyState, formatDate } from "@saas/ui";
import { MailPlus } from "lucide-react";
import type { Metadata } from "next";
import { db, requireWorkspace } from "@/lib/auth";
import { InviteDialog, LeaveButton, MemberActions, RevokeInviteButton } from "./team-client";

export const metadata: Metadata = { title: "Team" };

const roleTone = { owner: "accent", admin: "primary", member: "neutral" } as const;

export default async function TeamPage() {
  const ctx = await requireWorkspace();
  const tz = ctx.workspace.timeZone;
  const [members, invites] = await Promise.all([listMembers(db, ctx.workspace.id), listPendingInvitations(db, ctx.workspace.id)]);
  const manage = can(ctx.role, "manageTeam");

  return (
    <>
      <Card>
        <CardHeader
          title="Members"
          description={`${members.length} ${members.length === 1 ? "person" : "people"} in ${ctx.workspace.name}. Owners and admins manage the team; only the owner manages billing.`}
          action={manage ? <InviteDialog canInviteAdmins={ctx.role === "owner"} /> : undefined}
        />
        <DataTable
          caption="Workspace members"
          rows={members}
          rowKey={(m) => m.userId}
          columns={[
            {
              key: "name",
              header: "Name",
              cell: (m) => (
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.name || m.email} src={m.image} size="sm" />
                  <div className="grid min-w-0">
                    <span className="font-medium [overflow-wrap:anywhere] sm:truncate">{m.name || m.email}{m.userId === ctx.user.id && <span className="font-normal text-muted-foreground"> (you)</span>}</span>
                    <span className="text-[13px] text-muted-foreground [overflow-wrap:anywhere] sm:truncate">{m.email}</span>
                  </div>
                </div>
              ),
              className: "max-w-0 w-full",
            },
            { key: "role", header: "Role", cell: (m) => <Badge tone={roleTone[m.role]}>{ROLE_LABELS[m.role]}</Badge> },
            { key: "joined", header: "Joined", cell: (m) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(m.joinedAt, tz)}</span>, hideOnMobile: true },
            { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (m) => (m.userId === ctx.user.id ? null : <MemberActions member={m} viewerRole={ctx.role} />) },
          ]}
        />
      </Card>

      {manage && (
        <Card>
          <CardHeader title="Pending invitations" description="Invitations expire after 7 days." />
          <DataTable
            caption="Pending invitations"
            rows={invites}
            rowKey={(i) => i.id}
            empty={<EmptyState className="py-8" icon={<span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"><MailPlus className="size-5" aria-hidden /></span>} title="No pending invitations" description="Invite your accountant or a colleague to work on invoices with you." />}
            columns={[
              { key: "email", header: "Email", cell: (i) => <span className="block font-medium [overflow-wrap:anywhere] sm:truncate">{i.email}</span>, className: "max-w-0 w-full" },
              { key: "role", header: "Role", cell: (i) => <Badge tone="outline">{ROLE_LABELS[i.role]}</Badge> },
              { key: "expires", header: "Expires", cell: (i) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(i.expiresAt, tz)}</span>, hideOnMobile: true },
              { key: "actions", header: <span className="sr-only">Actions</span>, align: "right", cell: (i) => <RevokeInviteButton id={i.id} email={i.email} /> },
            ]}
          />
        </Card>
      )}

      {ctx.role !== "owner" && (
        <Card>
          <CardHeader title="Leave workspace" description={`Stop working in ${ctx.workspace.name}. Your account and other workspaces stay as they are.`} action={<LeaveButton workspaceName={ctx.workspace.name} />} />
        </Card>
      )}
      {ctx.role === "owner" && members.length === 1 && !invites.length && (
        <p className="text-sm text-muted-foreground">You&apos;re the only one here. To leave this workspace, first invite someone and transfer ownership to them.</p>
      )}
    </>
  );
}
