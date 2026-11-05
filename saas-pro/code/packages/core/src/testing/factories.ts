import { randomUUID } from "node:crypto";
import type { Db } from "../db";
import { users, type Role, memberships } from "../db/schema";
import { getWorkspaceContext, type WorkspaceContext } from "../tenancy";
import { createWorkspace } from "../workspaces";
import { sessions } from "../db/schema";

/** A unique fictional email for a test. */
export const testEmail = (label = "user") => `${label}-${randomUUID().slice(0, 8)}@test.example`;

export async function createTestUser(db: Db, opts: { name?: string; email?: string; verified?: boolean } = {}) {
  const [user] = await db
    .insert(users)
    .values({ id: randomUUID(), name: opts.name ?? "Test User", email: opts.email ?? testEmail(), emailVerified: opts.verified ?? true })
    .returning();
  if (!user) throw new Error("Failed to create user");
  return user;
}

/** A session row for a user, as Better Auth would create on sign-in. */
export async function createTestSession(db: Db, userId: string) {
  const [s] = await db
    .insert(sessions)
    .values({ id: randomUUID(), token: randomUUID(), userId, expiresAt: new Date(Date.now() + 86_400_000) })
    .returning();
  if (!s) throw new Error("Failed to create session");
  return s;
}

export async function createTestWorkspace(db: Db, ownerId: string, name = "Test Workspace") {
  return createWorkspace(db, ownerId, { name, billingState: "29" });
}

export async function addMember(db: Db, workspaceId: string, userId: string, role: Role) {
  await db.insert(memberships).values({ workspaceId, userId, role });
}

/** The workspace context a request from this user would get. */
export async function contextFor(db: Db, user: { id: string; name: string; email: string }, workspaceId: string): Promise<WorkspaceContext> {
  const session = await createTestSession(db, user.id);
  const ctx = await getWorkspaceContext(db, { session: { id: session.id, activeWorkspaceId: workspaceId }, user });
  if (!ctx || ctx.workspace.id !== workspaceId) throw new Error("User is not a member of that workspace");
  return ctx;
}
