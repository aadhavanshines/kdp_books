"use client";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { resendVerificationAction } from "../actions";

export function ResendForm({ email }: { email: string }) {
  const [state, action] = useActionState(resendVerificationAction, initialFormState);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="email" value={email} />
      <FormMessage state={state} />
      <SubmitButton variant="secondary" className="w-full" pendingLabel="Sending…">Resend the link</SubmitButton>
    </form>
  );
}
