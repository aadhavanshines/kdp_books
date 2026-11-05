import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { recordAudit } from "../audit";
import type { Db } from "../db";
import { accounts, sessions, users, verifications } from "../db/schema";
import { enqueueEmail, magicLinkTemplate, resetPasswordTemplate, verifyEmailTemplate } from "../email";

export interface AuthConfig {
  db: Db;
  /** Product name used in emails, e.g. "Billora". */
  product: string;
  /** The app's public origin, e.g. http://localhost:3000. */
  baseURL: string;
  /** At least 32 random characters. */
  secret: string;
  google?: { clientId?: string | undefined; clientSecret?: string | undefined } | undefined;
}

export function isGoogleConfigured(google: AuthConfig["google"]): boolean {
  return Boolean(google?.clientId && google.clientSecret);
}

/**
 * Better Auth for one product: email + password (verification required),
 * magic links, and Google when keys exist. Every email goes to the outbox.
 */
export function createAuth(config: AuthConfig) {
  const { db, product } = config;
  const google = isGoogleConfigured(config.google)
    ? { google: { clientId: config.google!.clientId!, clientSecret: config.google!.clientSecret! } }
    : {};

  return betterAuth({
    appName: product,
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: [config.baseURL],
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: { user: users, session: sessions, account: accounts, verification: verifications },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 10,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await enqueueEmail(db, { to: user.email, kind: "auth.reset_password", ...resetPasswordTemplate({ product, name: user.name, url }) });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await enqueueEmail(db, { to: user.email, kind: "auth.verify", ...verifyEmailTemplate({ product, name: user.name, url }) });
      },
    },
    socialProviders: google,
    session: {
      additionalFields: {
        // Set by the server after a membership check; never accepted as input.
        activeWorkspaceId: { type: "string", required: false, input: false },
      },
    },
    account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await recordAudit(db, { actorUserId: user.id, action: "auth.sign_up", targetType: "user", targetId: user.id });
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            await recordAudit(db, { actorUserId: session.userId, action: "auth.sign_in", targetType: "session", targetId: session.id, ipAddress: session.ipAddress ?? null });
          },
        },
      },
    },
    plugins: [
      magicLink({
        expiresIn: 300,
        sendMagicLink: async ({ email, url }) => {
          await enqueueEmail(db, { to: email, kind: "auth.magic_link", ...magicLinkTemplate({ product, url }) });
        },
      }),
      // Must stay last: lets Server Actions set auth cookies.
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type AuthSession = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
