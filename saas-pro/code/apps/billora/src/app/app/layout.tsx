import { listUserWorkspaces } from "@saas/core/tenancy";
import { BilloraShell } from "@/components/billora-shell";
import { db, requireWorkspace } from "@/lib/auth";
import { signOutAction } from "../(auth)/actions";
import { switchWorkspaceAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireWorkspace();
  const all = await listUserWorkspaces(db, ctx.user.id);
  return (
    <BilloraShell
      user={{ name: ctx.user.name || ctx.user.email, email: ctx.user.email, image: ctx.user.image }}
      workspaces={all.map((w) => ({ id: w.workspace.id, name: w.workspace.name, role: w.role }))}
      currentWorkspaceId={ctx.workspace.id}
      switchWorkspace={switchWorkspaceAction}
      signOut={signOutAction}
    >
      {children}
    </BilloraShell>
  );
}
