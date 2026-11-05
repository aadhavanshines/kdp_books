"use client";
import { Field, Input } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { resetPasswordAction } from "../actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialFormState);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field label="New password" error={state.errors?.password} help="At least 10 characters. You'll be signed out on other devices.">
        {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" minLength={10} required autoFocus />}
      </Field>
      <Field label="Confirm new password" error={state.errors?.confirm}>
        {(p) => <Input {...p} name="confirm" type="password" autoComplete="new-password" required />}
      </Field>
      <SubmitButton className="mt-1 w-full" pendingLabel="Saving…">Save new password</SubmitButton>
    </form>
  );
}
