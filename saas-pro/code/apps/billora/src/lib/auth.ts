import "server-only";
import { createAuth, isGoogleConfigured } from "@saas/core/auth";
import { getDb } from "@saas/core/db";
import { getWorkspaceContext } from "@saas/core/tenancy";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env, PRODUCT } from "./env";

process.env.DATABASE_URL ??= env.DATABASE_URL;

export const db = getDb();

const google = { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET };
export const googleEnabled = isGoogleConfigured(google);

export const auth = createAuth({ db, product: PRODUCT, baseURL: env.BETTER_AUTH_URL, secret: env.BETTER_AUTH_SECRET, google });

/** The signed-in session for this request, or null. Cached per request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** Signed in and verified, or redirect. */
export async function requireUser(next?: string) {
  const session = await getSession();
  if (!session) redirect(next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in");
  if (!session.user.emailVerified) redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  return session;
}

/**
 * The current workspace context, resolved from the server-side session (the
 * browser never supplies a workspace id). Redirects to onboarding if the user
 * has no workspace yet.
 */
export const requireWorkspace = cache(async () => {
  const session = await requireUser();
  const ctx = await getWorkspaceContext(db, session);
  if (!ctx) redirect("/onboarding");
  return ctx;
});

export { safeNext } from "./redirect";
