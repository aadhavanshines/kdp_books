"use server";
import { acceptInvitation } from "@saas/core/teams";
import { switchWorkspace } from "@saas/core/tenancy";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, requireUser } from "@/lib/auth";
import { errorState, type FormState } from "@/lib/forms";

export async function acceptInviteAction(_: FormState, form: FormData): Promise<FormState> {
  const token = z.string().min(1).max(200).parse(form.get("token"));
  const session = await requireUser(`/invite/${token}`);
  let workspaceId: string;
  try {
    ({ workspaceId } = await acceptInvitation(db, session.user, token));
  } catch (e) {
    return errorState(e);
  }
  await switchWorkspace(db, session, workspaceId);
  revalidatePath("/app", "layout");
  redirect("/app");
}
