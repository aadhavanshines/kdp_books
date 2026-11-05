import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db";
import { memberships, sessions, workspaces, type Role } from "../db/schema";
import { forbidden } from "../errors";
import { scoped, type ScopedDb } from "./scoped";

export type Workspace = typeof workspaces.$inferSelect;

/** The subset of a Better Auth session the tenancy layer needs. */
export interface SessionLike {
  session: { id: string; activeWorkspaceId?: string | null | undefined };
  user: { id: string; name: string; email: string; image?: string | null | undefined };
}

export interface WorkspaceContext {
  user: SessionLike["user"];
  sessionId: string;
  workspace: Workspace;
  role: Role;
  /** Product queries go through this; it is bound to `workspace.id`. */
  db: ScopedDb;
}

/** All workspaces the user belongs to, oldest membership first. */
export async function listUserWorkspaces(db: Db, userId: string) {
  return db
    .select({ workspace: workspaces, role: memberships.role })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(memberships.createdAt));
}

export async function getMembership(db: Db, workspaceId: string, userId: string) {
  const [row] = await db
    .select({ workspace: workspaces, role: memberships.role })
    .from(memberships)
    .innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
    .where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId)));
  return row;
}

/**
 * Resolve the current workspace from the server-side session. The session's
 * active workspace is used if the user is still a member of it; otherwise the
 * user's first workspace is chosen and remembered. Returns null when the user
 * has no workspace yet (send them to onboarding).
 */
export async function getWorkspaceContext(db: Db, session: SessionLike): Promise<WorkspaceContext | null> {
  const userId = session.user.id;
  const activeId = session.session.activeWorkspaceId;

  let found = activeId && z.uuid().safeParse(activeId).success
    ? await getMembership(db, activeId, userId)
    : undefined;

  if (!found) {
    const [first] = await listUserWorkspaces(db, userId);
    if (!first) return null;
    found = first;
    await db
      .update(sessions)
      .set({ activeWorkspaceId: first.workspace.id })
      .where(and(eq(sessions.id, session.session.id), eq(sessions.userId, userId)));
  }

  return {
    user: session.user,
    sessionId: session.session.id,
    workspace: found.workspace,
    role: found.role,
    db: scoped(db, found.workspace.id),
  };
}

/**
 * Make `workspaceId` the session's active workspace. The id may come from the
 * browser (the switcher), so membership is checked before it is stored.
 */
export async function switchWorkspace(db: Db, session: SessionLike, workspaceId: string) {
  if (!z.uuid().safeParse(workspaceId).success) throw forbidden("Workspace not found.");
  const membership = await getMembership(db, workspaceId, session.user.id);
  if (!membership) throw forbidden("You are not a member of that workspace.");
  await db
    .update(sessions)
    .set({ activeWorkspaceId: workspaceId })
    .where(and(eq(sessions.id, session.session.id), eq(sessions.userId, session.user.id)));
  return membership;
}
