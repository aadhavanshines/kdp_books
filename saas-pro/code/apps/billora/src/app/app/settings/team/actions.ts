"use server";
import { changeRole, inviteMember, inviteSchema, leaveWorkspace, removeMember, revokeInvitation, transferOwnership } from "@saas/core/teams";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireWorkspace } from "@/lib/auth";
import { env, PRODUCT } from "@/lib/env";
import { errorState, fieldErrors, formValues, type FormState } from "@/lib/forms";

const done = (message: string): FormState => {
  revalidatePath("/app/settings/team");
  return { ok: true, message };
};

/** Wraps a team operation: known errors become a message for a toast. */
async function run(fn: () => Promise<FormState>): Promise<FormState> {
  try {
    return await fn();
  } catch (e) {
    return errorState(e);
  }
}

export async function inviteAction(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await requireWorkspace();
  const values = formValues(form);
  const parsed = inviteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await inviteMember(db, ctx, parsed.data, { product: PRODUCT, inviteUrl: (t) => `${env.BETTER_AUTH_URL}/invite/${t}` });
  } catch (e) {
    return errorState(e, values);
  }
  return done(`Invitation sent to ${parsed.data.email}.`);
}

export async function revokeInviteAction(invitationId: string) {
  const ctx = await requireWorkspace();
  return run(async () => {
    await revokeInvitation(db, ctx, invitationId);
    return done("Invitation cancelled.");
  });
}

export async function changeRoleAction(userId: string, role: "admin" | "member") {
  const ctx = await requireWorkspace();
  return run(async () => {
    await changeRole(db, ctx, { userId, role });
    return done(role === "admin" ? "They're now an admin." : "They're now a member.");
  });
}

export async function removeMemberAction(userId: string) {
  const ctx = await requireWorkspace();
  return run(async () => {
    await removeMember(db, ctx, { userId });
    return done("Removed from the workspace.");
  });
}

export async function transferOwnershipAction(userId: string) {
  const ctx = await requireWorkspace();
  return run(async () => {
    await transferOwnership(db, ctx, { userId });
    return done("Ownership transferred. You're now an admin.");
  });
}

export async function leaveWorkspaceAction(): Promise<FormState> {
  const ctx = await requireWorkspace();
  const result = await run(async () => {
    await leaveWorkspace(db, ctx);
    return { ok: true };
  });
  if (!result.ok) return result;
  revalidatePath("/app", "layout");
  redirect("/app");
}
