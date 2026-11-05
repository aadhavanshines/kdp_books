"use client";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { acceptInviteAction } from "./actions";

export function AcceptForm({ token, workspaceName }: { token: string; workspaceName: string }) {
  const [state, action] = useActionState(acceptInviteAction, initialFormState);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <SubmitButton size="lg" className="w-full" pendingLabel="Joining…">Join {workspaceName}</SubmitButton>
    </form>
  );
}
