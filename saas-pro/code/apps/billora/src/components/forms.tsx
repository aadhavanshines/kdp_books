"use client";
import { Alert, Button, type ButtonProps } from "@saas/ui";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/forms";

export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}

/** The form-level message (errors and confirmations). */
export function FormMessage({ state, className }: { state: FormState; className?: string }) {
  if (!state.message) return null;
  return (
    <Alert tone={state.ok ? "success" : "danger"} className={className}>
      {state.message}
    </Alert>
  );
}
