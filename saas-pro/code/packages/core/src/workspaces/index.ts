import { eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { recordAudit } from "../audit";
import type { Db } from "../db";
import { memberships, workspaces } from "../db/schema";
import { isStateCode, validateGstin } from "../india";
import { requireRole, type WorkspaceContext } from "../tenancy";

export const workspaceDetailsSchema = z
  .object({
    name: z.string({ error: "Enter a name." }).trim().min(2, "Use at least 2 characters.").max(80, "Use at most 80 characters."),
    billingState: z
      .string({ error: "Choose your state." })
      .trim()
      .refine((s) => isStateCode(s), "Choose your state."),
    gstin: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .transform((v) => (v ? v : undefined)),
    timeZone: z
      .string()
      .trim()
      .refine((tz) => {
        try {
          new Intl.DateTimeFormat("en-IN", { timeZone: tz });
          return true;
        } catch {
          return false;
        }
      }, "Choose a valid time zone.")
      .default("Asia/Kolkata"),
  })
  .superRefine((v, ctx) => {
    if (!v.gstin) return;
    const check = validateGstin(v.gstin, v.billingState);
    if (!check.ok) ctx.addIssue({ code: "custom", path: ["gstin"], message: check.reason });
  });

export type WorkspaceDetails = z.input<typeof workspaceDetailsSchema>;

export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "workspace";
}

async function uniqueSlug(db: Db, name: string): Promise<string> {
  const base = slugify(name);
  const taken = new Set(
    (
      await db
        .select({ slug: workspaces.slug })
        .from(workspaces)
        .where(or(eq(workspaces.slug, base), like(workspaces.slug, `${base}-%`)))
    ).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Create a workspace with `userId` as its owner. */
export async function createWorkspace(db: Db, userId: string, input: WorkspaceDetails) {
  const data = workspaceDetailsSchema.parse(input);
  return db.transaction(async (tx) => {
    const [ws] = await tx
      .insert(workspaces)
      .values({
        name: data.name,
        slug: await uniqueSlug(tx, data.name),
        billingCountry: "IN",
        billingState: data.billingState,
        gstin: data.gstin ?? null,
        timeZone: data.timeZone,
      })
      .returning();
    if (!ws) throw new Error("Failed to create workspace");
    await tx.insert(memberships).values({ workspaceId: ws.id, userId, role: "owner" });
    await recordAudit(tx, { workspaceId: ws.id, actorUserId: userId, action: "workspace.create", targetType: "workspace", targetId: ws.id });
    return ws;
  });
}

/** Update the current workspace's details (owner or admin). */
export async function updateWorkspace(db: Db, ctx: WorkspaceContext, input: WorkspaceDetails) {
  requireRole(ctx, "admin");
  const data = workspaceDetailsSchema.parse(input);
  const [ws] = await db
    .update(workspaces)
    .set({ name: data.name, billingState: data.billingState, gstin: data.gstin ?? null, timeZone: data.timeZone })
    .where(eq(workspaces.id, ctx.workspace.id))
    .returning();
  await recordAudit(db, { workspaceId: ctx.workspace.id, actorUserId: ctx.user.id, action: "workspace.update", targetType: "workspace", targetId: ctx.workspace.id });
  return ws;
}
