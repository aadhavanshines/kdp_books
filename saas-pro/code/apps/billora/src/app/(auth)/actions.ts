"use server";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, safeNext } from "@/lib/auth";
import { errorState, fieldErrors, formValues, type FormState } from "@/lib/forms";

const email = z.email("Enter a valid email address.").trim().toLowerCase();
const password = z.string().min(10, "Use at least 10 characters.").max(128, "Use at most 128 characters.");

const signInSchema = z.object({ email, password: z.string().min(1, "Enter your password."), next: z.string().optional() });

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form, "password");
  const parsed = signInSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await auth.api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password, callbackURL: "/app" }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError && e.status === "FORBIDDEN") {
      // Better Auth has just sent a fresh verification link.
      redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}&resent=1`);
    }
    if (e instanceof APIError && e.status === "UNAUTHORIZED") return { message: "That email and password don't match.", values };
    return errorState(e, values);
  }
  redirect(safeNext(parsed.data.next));
}

const magicSchema = z.object({ email, next: z.string().optional() });

export async function magicLinkAction(_: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form);
  const parsed = magicSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await auth.api.signInMagicLink({ body: { email: parsed.data.email, callbackURL: safeNext(parsed.data.next), newUserCallbackURL: "/onboarding", errorCallbackURL: "/sign-in?error=link" }, headers: await headers() });
  } catch (e) {
    return errorState(e, values);
  }
  return { ok: true, message: `We sent a sign-in link to ${parsed.data.email}. It works once and expires in 5 minutes.`, values };
}

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80),
  email,
  password,
  terms: z.literal("on", { error: "Please accept the terms to continue." }),
  next: z.string().optional(),
});

export async function signUpAction(_: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form, "password");
  const parsed = signUpSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const next = safeNext(parsed.data.next, "/onboarding");
  try {
    await auth.api.signUpEmail({ body: { name: parsed.data.name, email: parsed.data.email, password: parsed.data.password, callbackURL: next }, headers: await headers() });
  } catch (e) {
    return errorState(e, values);
  }
  // Same response whether or not the email already had an account.
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function resendVerificationAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: "Enter a valid email address." };
  try {
    await auth.api.sendVerificationEmail({ body: { email: parsed.data.email, callbackURL: "/onboarding" }, headers: await headers() });
  } catch (e) {
    return errorState(e);
  }
  return { ok: true, message: "If that address needs verifying, a new link is on its way." };
}

export async function forgotPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const values = formValues(form);
  const parsed = z.object({ email }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  try {
    await auth.api.requestPasswordReset({ body: { email: parsed.data.email, redirectTo: "/reset-password" }, headers: await headers() });
  } catch (e) {
    return errorState(e, values);
  }
  return { ok: true, message: `If ${parsed.data.email} has an account, a reset link is on its way. It expires in 1 hour.`, values };
}

const resetSchema = z
  .object({ token: z.string().min(1), password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "The passwords don't match." });

export async function resetPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  try {
    await auth.api.resetPassword({ body: { newPassword: parsed.data.password, token: parsed.data.token }, headers: await headers() });
  } catch (e) {
    if (e instanceof APIError) return { message: "This reset link is invalid or has expired. Ask for a new one." };
    throw e;
  }
  redirect("/sign-in?reset=1");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

export async function googleSignInAction(form: FormData) {
  const next = safeNext(form.get("next"));
  const res = await auth.api.signInSocial({ body: { provider: "google", callbackURL: next, newUserCallbackURL: "/onboarding", errorCallbackURL: "/sign-in?error=google" }, headers: await headers() });
  if (!res.url) redirect("/sign-in?error=google");
  redirect(res.url);
}
