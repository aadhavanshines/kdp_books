"use client";
import { Card, CardBody, CardFooter, CardHeader, Field, Input } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { initialFormState } from "@/lib/forms";
import { changePasswordAction, updateProfileAction } from "./actions";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(updateProfileAction, initialFormState);
  return (
    <Card>
      <form action={action} noValidate>
        <CardHeader title="Your profile" description="How you appear to your team and on emails." />
        <CardBody className="grid max-w-xl gap-4">
          <FormMessage state={state} />
          <Field label="Name" error={state.errors?.name}>
            {(p) => <Input {...p} name="name" autoComplete="name" defaultValue={state.values?.name ?? name} required />}
          </Field>
          <Field label="Email" help="Contact support to change the email you sign in with.">
            {(p) => <Input {...p} value={email} readOnly disabled />}
          </Field>
        </CardBody>
        <CardFooter><SubmitButton pendingLabel="Saving…">Save profile</SubmitButton></CardFooter>
      </form>
    </Card>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, action] = useActionState(changePasswordAction, initialFormState);
  if (!hasPassword) {
    return (
      <Card>
        <CardHeader title="Password" description="You sign in with an email link or Google, so there's no password to change. Use “Forgot password” on the sign-in page to set one." />
      </Card>
    );
  }
  return (
    <Card>
      <form action={action} noValidate key={state.ok ? "done" : "form"}>
        <CardHeader title="Password" description="Changing it signs you out on your other devices." />
        <CardBody className="grid max-w-xl gap-4">
          <FormMessage state={state} />
          <Field label="Current password" error={state.errors?.currentPassword}>
            {(p) => <Input {...p} name="currentPassword" type="password" autoComplete="current-password" required />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password" error={state.errors?.newPassword} help="At least 10 characters.">
              {(p) => <Input {...p} name="newPassword" type="password" autoComplete="new-password" required />}
            </Field>
            <Field label="Confirm new password" error={state.errors?.confirm}>
              {(p) => <Input {...p} name="confirm" type="password" autoComplete="new-password" required />}
            </Field>
          </div>
        </CardBody>
        <CardFooter><SubmitButton variant="secondary" pendingLabel="Changing…">Change password</SubmitButton></CardFooter>
      </form>
    </Card>
  );
}
