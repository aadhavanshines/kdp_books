"use server";
import { updateWorkspace, workspaceDetailsSchema } from "@saas/core/workspaces";
import { revalidatePath } from "next/cache";
import { db, requireWorkspace } from "@/lib/auth";
import { errorState, fieldErrors, formValues, type FormState } from "@/lib/forms";

export async function updateWorkspaceAction(_: FormState, form: FormData): Promise<FormState> {
  const ctx = await requireWorkspace();
  const values = formValues(form);
  const parsed = workspaceDetailsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await updateWorkspace(db, ctx, parsed.data);
  } catch (e) {
    return errorState(e, values);
  }
  revalidatePath("/app", "layout");
  return { ok: true, message: "Workspace details saved.", values };
}
