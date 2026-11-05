import { createHash, randomBytes } from "node:crypto";
import { and, asc, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { recordAudit } from "../audit";
import type { Db } from "../db";
import { invitations, memberships, users, workspaces, type Role } from "../db/schema";
import { enqueueEmail, inviteTemplate } from "../email";
import { conflict, forbidden, invalid, notFound } from "../errors";
import { requireRole, type WorkspaceContext } from "../tenancy";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/*
 * Team rules (PRD §0.3):
 * - Exactly one owner per workspace (also enforced by a partial unique index).
 * - Owners and admins manage the team. Only the owner can invite or promote
 *   admins, change an admin's role, or remove an admin.
 * - Nobody changes their own role or removes themselves (they leave instead).
 * - The owner can't leave or be removed; they transfer ownership first, and
 *   become an admin when they do.
 */

export const inviteSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  role: z.enum(["admin", "member"]),
});
export const changeRoleSchema = z.object({ userId: z.string().min(1), role: z.enum(["admin", "member"]) });
export const memberTargetSchema = z.object({ userId: z.string().min(1) });

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface InviteOptions {
  /** Builds the absolute acceptance URL for a token, e.g. https://app.example/invite/<token>. */
  inviteUrl: (token: string) => string;
  product: string;
  now?: Date;
}

export async function listMembers(db: Db, workspaceId: string) {
  return db
    .select({ userId: users.id, name: users.name, email: users.email, image: users.image, role: memberships.role, joinedAt: memberships.createdAt })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.workspaceId, workspaceId))
    .orderBy(sql`case ${memberships.role} when 'owner' then 0 when 'admin' then 1 else 2 end`, asc(users.name));
}

export async function listPendingInvitations(db: Db, workspaceId: string, now = new Date()) {
  return db
    .select({ id: invitations.id, email: invitations.email, role: invitations.role, expiresAt: invitations.expiresAt, createdAt: invitations.createdAt })
    .from(invitations)
    .where(and(eq(invitations.workspaceId, workspaceId), isNull(invitations.acceptedAt), isNull(invitations.revokedAt), gt(invitations.expiresAt, now)))
    .orderBy(asc(invitations.createdAt));
}

/** Invite someone by email. Re-inviting the same email replaces the old link. */
export async function inviteMember(db: Db, ctx: WorkspaceContext, input: z.input<typeof inviteSchema>, opts: InviteOptions) {
  requireRole(ctx, "admin");
  const { email, role } = inviteSchema.parse(input);
  if (role === "admin" && ctx.role !== "owner") throw forbidden("Only the owner can invite admins.");

  const existing = await db
    .select({ id: memberships.id })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.workspaceId, ctx.workspace.id), eq(sql`lower(${users.email})`, email)));
  if (existing.length > 0) throw conflict(`${email} is already a member of this workspace.`);

  const now = opts.now ?? new Date();
  const token = randomBytes(32).toString("base64url");

  const invitation = await db.transaction(async (tx) => {
    await tx
      .update(invitations)
      .set({ revokedAt: now })
      .where(and(eq(invitations.workspaceId, ctx.workspace.id), eq(invitations.email, email), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)));
    const [row] = await tx
      .insert(invitations)
      .values({ workspaceId: ctx.workspace.id, email, role, tokenHash: hashToken(token), invitedByUserId: ctx.user.id, expiresAt: new Date(now.getTime() + INVITE_TTL_MS) })
      .returning();
    if (!row) throw new Error("Failed to create invitation");
    await enqueueEmail(tx, {
      to: email,
      kind: "team.invite",
      workspaceId: ctx.workspace.id,
      ...inviteTemplate({ product: opts.product, inviterName: ctx.user.name, workspaceName: ctx.workspace.name, role, url: opts.inviteUrl(token) }),
    });
    await recordAudit(tx, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.invite", targetType: "invitation", targetId: row.id, metadata: { email, role } });
    return row;
  });

  return { invitation, token };
}

export async function revokeInvitation(db: Db, ctx: WorkspaceContext, invitationId: string) {
  requireRole(ctx, "admin");
  if (!z.uuid().safeParse(invitationId).success) throw notFound("Invitation not found.");
  const [row] = await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(invitations.id, invitationId), eq(invitations.workspaceId, ctx.workspace.id), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)))
    .returning();
  if (!row) throw notFound("Invitation not found.");
  await recordAudit(db, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.invite_revoke", targetType: "invitation", targetId: row.id, metadata: { email: row.email } });
}

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

/** Look up an invitation from the token in a link (for the acceptance page). */
export async function getInvitationByToken(db: Db, token: string, now = new Date()) {
  if (!token || token.length > 200) return undefined;
  const [row] = await db
    .select({ invitation: invitations, workspaceName: workspaces.name, inviterName: users.name })
    .from(invitations)
    .innerJoin(workspaces, eq(workspaces.id, invitations.workspaceId))
    .leftJoin(users, eq(users.id, invitations.invitedByUserId))
    .where(eq(invitations.tokenHash, hashToken(token)));
  if (!row) return undefined;
  const inv = row.invitation;
  const status: InvitationStatus = inv.acceptedAt ? "accepted" : inv.revokedAt ? "revoked" : inv.expiresAt <= now ? "expired" : "pending";
  return { ...row, status };
}

/**
 * Accept an invitation as the signed-in user. The user's verified email must
 * match the invited email, so a forwarded link can't be used by someone else.
 */
export async function acceptInvitation(
  db: Db,
  user: { id: string; email: string; emailVerified: boolean },
  token: string,
  now = new Date(),
) {
  return db.transaction(async (tx) => {
    const [inv] = await tx.select().from(invitations).where(eq(invitations.tokenHash, hashToken(token))).for("update");
    if (!inv) throw notFound("This invitation link is not valid.");
    if (inv.acceptedAt) throw conflict("This invitation has already been used.");
    if (inv.revokedAt) throw invalid("This invitation was cancelled. Ask for a new one.");
    if (inv.expiresAt <= now) throw invalid("This invitation has expired. Ask for a new one.");
    if (user.email.toLowerCase() !== inv.email) throw forbidden(`This invitation is for ${inv.email}. Sign in with that email to accept it.`);
    if (!user.emailVerified) throw forbidden("Verify your email address before accepting.");

    await tx.insert(memberships).values({ workspaceId: inv.workspaceId, userId: user.id, role: inv.role === "owner" ? "admin" : inv.role }).onConflictDoNothing();
    await tx.update(invitations).set({ acceptedAt: now, acceptedByUserId: user.id }).where(eq(invitations.id, inv.id));
    await recordAudit(tx, { workspaceId: inv.workspaceId, actorUserId: user.id, action: "team.invite_accept", targetType: "invitation", targetId: inv.id, metadata: { role: inv.role } });
    return { workspaceId: inv.workspaceId };
  });
}

async function getTarget(db: Db, ctx: WorkspaceContext, userId: string) {
  const [m] = await db.select().from(memberships).where(and(eq(memberships.workspaceId, ctx.workspace.id), eq(memberships.userId, userId)));
  if (!m) throw notFound("That person is not a member of this workspace.");
  return m;
}

/** Owners and admins only; admins may manage members but not other admins. */
function assertCanManage(ctx: WorkspaceContext, target: { userId: string; role: Role }) {
  requireRole(ctx, "admin");
  if (target.userId === ctx.user.id) throw forbidden("You can't change your own membership here.");
  if (target.role === "owner") throw forbidden("The owner's role changes only by transferring ownership.");
  if (target.role === "admin" && ctx.role !== "owner") throw forbidden("Only the owner can manage admins.");
}

export async function changeRole(db: Db, ctx: WorkspaceContext, input: z.input<typeof changeRoleSchema>) {
  const { userId, role } = changeRoleSchema.parse(input);
  const target = await getTarget(db, ctx, userId);
  assertCanManage(ctx, target);
  if (role === "admin" && ctx.role !== "owner") throw forbidden("Only the owner can make someone an admin.");
  if (target.role === role) return;
  await db.update(memberships).set({ role }).where(eq(memberships.id, target.id));
  await recordAudit(db, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.role_change", targetType: "user", targetId: userId, metadata: { from: target.role, to: role } });
}

export async function removeMember(db: Db, ctx: WorkspaceContext, input: z.input<typeof memberTargetSchema>) {
  const { userId } = memberTargetSchema.parse(input);
  const target = await getTarget(db, ctx, userId);
  assertCanManage(ctx, target);
  await db.delete(memberships).where(eq(memberships.id, target.id));
  await recordAudit(db, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.remove", targetType: "user", targetId: userId, metadata: { role: target.role } });
}

export async function leaveWorkspace(db: Db, ctx: WorkspaceContext) {
  if (ctx.role === "owner") throw forbidden("Transfer ownership to someone else before leaving.");
  await db.delete(memberships).where(and(eq(memberships.workspaceId, ctx.workspace.id), eq(memberships.userId, ctx.user.id)));
  await recordAudit(db, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.leave", targetType: "user", targetId: ctx.user.id });
}

/** Owner only. The new owner must already be a member; the old owner becomes an admin. */
export async function transferOwnership(db: Db, ctx: WorkspaceContext, input: z.input<typeof memberTargetSchema>) {
  requireRole(ctx, "owner");
  const { userId } = memberTargetSchema.parse(input);
  if (userId === ctx.user.id) throw invalid("You already own this workspace.");
  const target = await getTarget(db, ctx, userId);
  await db.transaction(async (tx) => {
    // Demote first: the one-owner unique index forbids two owners at once.
    await tx.update(memberships).set({ role: "admin" }).where(and(eq(memberships.workspaceId, ctx.workspace.id), eq(memberships.userId, ctx.user.id)));
    await tx.update(memberships).set({ role: "owner" }).where(eq(memberships.id, target.id));
    await recordAudit(tx, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "team.transfer_ownership", targetType: "user", targetId: userId });
  });
}
