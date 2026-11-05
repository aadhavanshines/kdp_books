"use client";
import { INDIAN_STATES } from "@saas/core/india";
import { Field, Input, Select } from "@saas/ui";
import type { FormState } from "@/lib/forms";

export function WorkspaceFields({ state, defaults, disabled, timeZones }: { state: FormState; defaults?: { name?: string; billingState?: string | null; gstin?: string | null; timeZone?: string }; disabled?: boolean; timeZones?: string[] }) {
  const v = { ...defaults, ...state.values };
  return (
    <>
      <Field label="Business name" error={state.errors?.name} help="Shown on your invoices. You can change it later.">
        {(p) => <Input {...p} name="name" defaultValue={v.name ?? ""} autoComplete="organization" required disabled={disabled} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State" error={state.errors?.billingState} help="Decides CGST + SGST or IGST.">
          {(p) => (
            <Select {...p} name="billingState" defaultValue={v.billingState ?? ""} required disabled={disabled}>
              <option value="" disabled>Choose a state</option>
              {INDIAN_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
          )}
        </Field>
        <Field label="GSTIN" optional error={state.errors?.gstin} help="15 characters, if you're GST registered.">
          {(p) => <Input {...p} name="gstin" defaultValue={v.gstin ?? ""} placeholder="29ABCDE1234F1Z5" autoCapitalize="characters" spellCheck={false} maxLength={15} className="font-mono uppercase placeholder:normal-case" disabled={disabled} />}
        </Field>
      </div>
      {timeZones && (
        <Field label="Time zone" error={state.errors?.timeZone} help="Dates and reminders use this time zone.">
          {(p) => (
            <Select {...p} name="timeZone" defaultValue={v.timeZone ?? "Asia/Kolkata"} disabled={disabled}>
              {timeZones.map((tz) => <option key={tz} value={tz}>{tz.replaceAll("_", " ")}</option>)}
            </Select>
          )}
        </Field>
      )}
    </>
  );
}
