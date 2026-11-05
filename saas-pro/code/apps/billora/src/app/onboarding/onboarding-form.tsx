"use client";
import { Field, Input } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { WorkspaceFields } from "@/components/workspace-fields";
import { initialFormState } from "@/lib/forms";
import { createWorkspaceAction } from "./actions";

export function OnboardingForm({ askName }: { askName: boolean }) {
  const [state, action] = useActionState(createWorkspaceAction, initialFormState);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      {askName && (
        <Field label="Your name" error={state.errors?.yourName}>
          {(p) => <Input {...p} name="yourName" autoComplete="name" defaultValue={state.values?.yourName} required />}
        </Field>
      )}
      <WorkspaceFields state={state} />
      <SubmitButton size="lg" className="mt-1 w-full" pendingLabel="Creating workspace…">Create workspace</SubmitButton>
    </form>
  );
}
