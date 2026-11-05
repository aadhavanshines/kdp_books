import { isAppError } from "@saas/core/errors";
import { APIError } from "better-auth/api";
import { z } from "zod";

/** What every Server Action form returns to `useActionState`. */
export type FormState = {
  ok?: boolean;
  message?: string;
  /** Field errors keyed by input name. */
  errors?: Record<string, string[] | undefined>;
  /** Submitted values to refill the form after an error (never passwords). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};

export function formValues(form: FormData, ...omit: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && !omit.includes(k) && !k.startsWith("$")) out[k] = v;
  return out;
}

export function fieldErrors(error: z.ZodError): FormState["errors"] {
  return z.flattenError(error).fieldErrors as FormState["errors"];
}

/** Turn a known error into a message; rethrow anything unexpected. */
export function errorState(e: unknown, values?: Record<string, string>): FormState {
  if (isAppError(e)) return { message: e.message, ...(values ? { values } : {}) };
  if (e instanceof APIError) {
    const body = e.body as { message?: string; code?: string } | undefined;
    return { message: body?.message ?? "Something went wrong. Please try again.", ...(values ? { values } : {}) };
  }
  if (e instanceof z.ZodError) return { errors: fieldErrors(e), ...(values ? { values } : {}) };
  throw e;
}
