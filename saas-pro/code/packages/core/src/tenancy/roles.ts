import type { Role } from "../db/schema";
import { forbidden } from "../errors";

export const ROLES = ["owner", "admin", "member"] as const satisfies readonly Role[];
const RANK: Record<Role, number> = { owner: 3, admin: 2, member: 1 };

/** True when `role` is at least `min` (owner > admin > member). */
export function hasRole(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

/** Throws a "forbidden" AppError unless the context's role is at least `min`. */
export function requireRole<C extends { role: Role }>(ctx: C, min: Role): C {
  if (!hasRole(ctx.role, min)) {
    throw forbidden(
      min === "owner"
        ? "Only the workspace owner can do that."
        : "Only owners and admins can do that.",
    );
  }
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

/** What each role may do; used by the UI to hide controls and by tests. */
export const PERMISSIONS = {
  manageTeam: "admin",
  manageWorkspace: "admin",
  manageBilling: "owner",
  deleteWorkspace: "owner",
  transferOwnership: "owner",
} as const satisfies Record<string, Role>;

export function can(role: Role, permission: keyof typeof PERMISSIONS): boolean {
  return hasRole(role, PERMISSIONS[permission]);
}
