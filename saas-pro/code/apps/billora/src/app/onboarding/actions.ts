"use server";
import { users } from "@saas/core/schema";
import { switchWorkspace } from "@saas/core/tenancy";
import { createWorkspace, workspaceDetailsSchema } from "@saas/core/workspaces";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, requireUser } from "@/lib/auth";
import { fieldErrors, formValues, type FormState } from "@/lib/forms";

export async function createWorkspaceAction(_: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser();
  const values = formValues(form);
  const parsed = workspaceDetailsSchema.safeParse(Object.fromEntries(form));
  const name = z.string().trim().min(1, "Enter your name.").max(80).safeParse(form.get("yourName"));
  const needsName = !session.user.name;
  if (!parsed.success || (needsName && !name.success)) {
    return {
      errors: { ...(parsed.success ? {} : fieldErrors(parsed.error)), ...(needsName && !name.success ? { yourName: name.error.issues.map((i) => i.message) } : {}) },
      values,
    };
  }
  if (needsName && name.success) await db.update(users).set({ name: name.data }).where(eq(users.id, session.user.id));
  const ws = await createWorkspace(db, session.user.id, parsed.data);
  await switchWorkspace(db, session, ws.id);
  redirect("/app?welcome=1");
}
