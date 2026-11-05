"use client";
import {
  Button, Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger, DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Field, Input, Select, toast,
} from "@saas/ui";
import { Crown, Ellipsis, ShieldCheck, UserMinus, UserPlus, UserRound } from "lucide-react";
import { useActionState, useState, useTransition } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState, type FormState } from "@/lib/forms";
import { changeRoleAction, inviteAction, leaveWorkspaceAction, removeMemberAction, revokeInviteAction, transferOwnershipAction } from "./actions";

function report(result: FormState) {
  if (result.ok) toast.success(result.message);
  else toast.error(result.message ?? "Something went wrong.");
}

export function InviteDialog({ canInviteAdmins }: { canInviteAdmins: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(async (prev: FormState, form: FormData) => {
    const result = await inviteAction(prev, form);
    if (result.ok) {
      setOpen(false);
      toast.success(result.message);
    }
    return result;
  }, initialFormState);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus /> Invite people</Button>
      </DialogTrigger>
      <DialogContent title="Invite to your workspace" description="We'll email them a link. It expires in 7 days.">
        <form action={action} className="grid gap-4" noValidate>
          {!state.ok && <FormMessage state={state} />}
          <Field label="Email" error={state.ok ? undefined : state.errors?.email}>
            {(p) => <Input {...p} name="email" type="email" autoComplete="off" placeholder="name@company.example" defaultValue={state.ok ? "" : state.values?.email} required autoFocus />}
          </Field>
          <Field label="Role" help={canInviteAdmins ? "Admins can manage the team and settings. Members work with clients and invoices." : "Only the owner can invite admins."}>
            {(p) => (
              <Select {...p} name="role" defaultValue="member">
                <option value="member">Member</option>
                {canInviteAdmins && <option value="admin">Admin</option>}
              </Select>
            )}
          </Field>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <SubmitButton pendingLabel="Sending…">Send invitation</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Confirm = { title: string; description: string; label: string; destructive?: boolean; run: () => Promise<FormState> } | null;

function ConfirmDialog({ confirm, onClose }: { confirm: Confirm; onClose: () => void }) {
  const [pending, start] = useTransition();
  return (
    <Dialog open={confirm !== null} onOpenChange={(o) => !o && onClose()}>
      {confirm && (
        <DialogContent title={confirm.title} description={confirm.description}>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <Button
              variant={confirm.destructive ? "destructive" : "primary"}
              loading={pending}
              onClick={() => start(async () => { report(await confirm.run()); onClose(); })}
            >
              {confirm.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

export function MemberActions({ member, viewerRole }: { member: { userId: string; name: string; role: "owner" | "admin" | "member" }; viewerRole: "owner" | "admin" | "member" }) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [pending, start] = useTransition();
  const isOwner = viewerRole === "owner";
  const canManage = member.role !== "owner" && (isOwner || (viewerRole === "admin" && member.role === "member"));
  if (!canManage) return null;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`} loading={pending} className="size-8">
            {!pending && <Ellipsis />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isOwner && (
            <>
              <DropdownMenuLabel>Role</DropdownMenuLabel>
              <DropdownMenuItem disabled={member.role === "admin"} onSelect={() => start(async () => report(await changeRoleAction(member.userId, "admin")))}>
                <ShieldCheck /> Make admin
              </DropdownMenuItem>
              <DropdownMenuItem disabled={member.role === "member"} onSelect={() => start(async () => report(await changeRoleAction(member.userId, "member")))}>
                <UserRound /> Make member
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setConfirm({ title: `Make ${member.name} the owner?`, description: "They'll control billing and can delete the workspace. You'll become an admin. This can only be undone by the new owner.", label: "Transfer ownership", run: () => transferOwnershipAction(member.userId) })}>
                <Crown /> Transfer ownership
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem destructive onSelect={() => setConfirm({ title: `Remove ${member.name}?`, description: "They'll lose access to this workspace straight away. You can invite them again later.", label: "Remove", destructive: true, run: () => removeMemberAction(member.userId) })}>
            <UserMinus /> Remove from workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}

export function RevokeInviteButton({ id, email }: { id: string; email: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" loading={pending} onClick={() => start(async () => report(await revokeInviteAction(id)))} aria-label={`Cancel invitation for ${email}`}>
      Cancel
    </Button>
  );
}

export function LeaveButton({ workspaceName }: { workspaceName: string }) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  return (
    <>
      <Button variant="secondary" className="text-danger" onClick={() => setConfirm({ title: `Leave ${workspaceName}?`, description: "You'll lose access straight away. An owner or admin can invite you back.", label: "Leave workspace", destructive: true, run: leaveWorkspaceAction })}>
        Leave workspace
      </Button>
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
