"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { APIError } from "better-auth/api";
import { auth, requireUser } from "@/lib/auth";
import { errorState, fieldErrors, formValues, type FormState } from "@/lib/forms";

export async function updateProfileAction(_: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const values = formValues(form);
  const parsed = z.object({ name: z.string().trim().min(1, "Enter your name.").max(80, "Use at most 80 characters.") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await auth.api.updateUser({ body: { name: parsed.data.name }, headers: await headers() });
  } catch (e) {
    return errorState(e, values);
  }
  revalidatePath("/app", "layout");
  return { ok: true, message: "Profile saved.", values };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(10, "Use at least 10 characters.").max(128),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "The passwords don't match." });

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  try {
    await auth.api.changePassword({ body: { currentPassword: parsed.data.currentPassword, newPassword: parsed.data.newPassword, revokeOtherSessions: true }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError && e.status === "BAD_REQUEST") return { errors: { currentPassword: ["That isn't your current password."] } };
    return errorState(e);
  }
  return { ok: true, message: "Password changed. Other devices were signed out." };
}

export async function signOutEverywhereAction() {
  await requireUser();
  const h = await headers();
  await auth.api.revokeSessions({ headers: h });
  redirect("/sign-in");
}
