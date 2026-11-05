"use client";
import { Checkbox, Field, Input } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { signUpAction } from "../actions";

export function SignUpForm({ next, defaultEmail }: { next?: string | undefined; defaultEmail?: string | undefined }) {
  const [state, action] = useActionState(signUpAction, initialFormState);
  const v = state.values ?? {};
  return (
    <form action={action} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage state={state} />
      <Field label="Your name" error={state.errors?.name}>
        {(p) => <Input {...p} name="name" autoComplete="name" defaultValue={v.name} required autoFocus />}
      </Field>
      <Field label="Work email" error={state.errors?.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" defaultValue={v.email ?? defaultEmail} required />}
      </Field>
      <Field label="Password" error={state.errors?.password} help="At least 10 characters.">
        {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" minLength={10} required />}
      </Field>
      <div className="grid gap-1.5">
        <Checkbox name="terms" label={<>I agree to the terms of service and privacy policy</>} defaultChecked={v.terms === "on"} aria-invalid={state.errors?.terms ? true : undefined} />
        {state.errors?.terms && <p className="pl-7 text-[13px] text-danger" role="alert">{state.errors.terms[0]}</p>}
      </div>
      <SubmitButton className="mt-1 w-full" pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}
