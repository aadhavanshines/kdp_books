"use server";
import { switchWorkspace } from "@saas/core/tenancy";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireUser } from "@/lib/auth";

/** The id comes from the browser, so core checks membership before using it. */
export async function switchWorkspaceAction(workspaceId: string) {
  const session = await requireUser();
  await switchWorkspace(db, session, String(workspaceId));
  revalidatePath("/app", "layout");
  redirect("/app");
}
