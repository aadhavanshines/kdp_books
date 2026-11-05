import { and, desc, eq } from "drizzle-orm";
import type { Db } from "./db";
import { auditLog } from "./db/schema";

export type AuditAction =
  | "auth.sign_in"
  | "auth.sign_up"
  | "workspace.create"
  | "workspace.update"
  | "team.invite"
  | "team.invite_revoke"
  | "team.invite_accept"
  | "team.role_change"
  | "team.remove"
  | "team.leave"
  | "team.transfer_ownership"
  | (string & {});

export interface AuditEntry {
  workspaceId?: string | null;
  actorUserId?: string | null;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function recordAudit(db: Db, entry: AuditEntry) {
  await db.insert(auditLog).values({
    workspaceId: entry.workspaceId ?? null,
    actorUserId: entry.actorUserId ?? null,
    action: entry.action,
    targetType: entry.targetType ?? null,
    targetId: entry.targetId ?? null,
    metadata: entry.metadata ?? {},
    ipAddress: entry.ipAddress ?? null,
  });
}

export async function listAudit(db: Db, workspaceId: string, limit = 50) {
  return db
    .select()
    .from(auditLog)
    .where(and(eq(auditLog.workspaceId, workspaceId)))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}
