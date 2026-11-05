"use client";
import { Field, Input } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { forgotPasswordAction } from "../actions";
import { DevMailHint } from "../auth-card";

export function ForgotForm() {
  const [state, action] = useActionState(forgotPasswordAction, initialFormState);
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormMessage state={state} />
      <Field label="Email" error={state.errors?.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" defaultValue={state.values?.email} required autoFocus />}
      </Field>
      <SubmitButton className="mt-1 w-full" pendingLabel="Sending…">Send reset link</SubmitButton>
      {state.ok && <DevMailHint />}
    </form>
  );
}
