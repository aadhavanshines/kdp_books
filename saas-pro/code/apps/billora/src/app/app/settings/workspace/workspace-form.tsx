"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@saas/ui";
import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms";
import { WorkspaceFields } from "@/components/workspace-fields";
import { initialFormState } from "@/lib/forms";
import { updateWorkspaceAction } from "./actions";

export function WorkspaceForm({ defaults, canEdit, timeZones }: { defaults: { name: string; billingState: string | null; gstin: string | null; timeZone: string }; canEdit: boolean; timeZones: string[] }) {
  const [state, action] = useActionState(updateWorkspaceAction, initialFormState);
  return (
    <Card>
      <form action={action} noValidate>
        <CardHeader title="Business details" description={canEdit ? "Used on invoices and to work out GST." : "Only owners and admins can change these."} />
        <CardBody className="grid max-w-2xl gap-4">
          <FormMessage state={state} />
          <WorkspaceFields state={state} defaults={defaults} disabled={!canEdit} timeZones={timeZones} />
        </CardBody>
        {canEdit && <CardFooter><SubmitButton pendingLabel="Saving…">Save changes</SubmitButton></CardFooter>}
      </form>
    </Card>
  );
}
