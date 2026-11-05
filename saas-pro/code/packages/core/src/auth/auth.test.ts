import { desc, eq } from "drizzle-orm";
import { afterAll, describe, expect, inject, it } from "vitest";
import { createDb } from "../db";
import { auditLog, emailOutbox, users } from "../db/schema";
import { firstLink } from "../email";
import { testEmail } from "../testing";
import { createAuth, isGoogleConfigured } from ".";

const { db, close } = createDb(inject("databaseUrl"));
afterAll(close);
const auth = createAuth({ db, product: "Billora", baseURL: "http://localhost:3000", secret: "test-secret-test-secret-test-secret-123" });

const latestMail = async (to: string) =>
  (await db.select().from(emailOutbox).where(eq(emailOutbox.to, to)).orderBy(desc(emailOutbox.createdAt)))[0];

describe("auth", () => {
  it("sign-up sends a verification email and blocks sign-in until verified", async () => {
    const email = testEmail("signup");
    await auth.api.signUpEmail({ body: { name: "Asha", email, password: "correct-horse-1" } });
    const mail = await latestMail(email);
    expect(mail?.kind).toBe("auth.verify");
    const link = firstLink(mail!.text)!;
    expect(link).toContain("/api/auth/verify-email?token=");

    await expect(auth.api.signInEmail({ body: { email, password: "correct-horse-1" } })).rejects.toThrow();

    const token = new URL(link).searchParams.get("token")!;
    await auth.api.verifyEmail({ query: { token } });
    const [user] = await db.select().from(users).where(eq(users.email, email));
    expect(user?.emailVerified).toBe(true);

    const res = await auth.api.signInEmail({ body: { email, password: "correct-horse-1" } });
    expect(res.user.email).toBe(email);
    const [entry] = await db.select().from(auditLog).where(eq(auditLog.actorUserId, user!.id)).orderBy(desc(auditLog.createdAt));
    expect(entry?.action).toBe("auth.sign_in");
  });

  it("rejects short passwords", async () => {
    await expect(auth.api.signUpEmail({ body: { name: "X", email: testEmail(), password: "short" } })).rejects.toThrow();
  });

  it("magic links go to the outbox", async () => {
    const email = testEmail("magic");
    await auth.api.signInMagicLink({ body: { email, callbackURL: "/app" }, headers: new Headers() });
    const mail = await latestMail(email);
    expect(mail?.kind).toBe("auth.magic_link");
    expect(firstLink(mail!.text)).toContain("/api/auth/magic-link/verify?token=");
  });

  it("password reset links go to the outbox", async () => {
    const email = testEmail("reset");
    await auth.api.signUpEmail({ body: { name: "R", email, password: "correct-horse-1" } });
    await auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" } });
    expect((await latestMail(email))?.kind).toBe("auth.reset_password");
  });

  it("Google is enabled only with both keys", () => {
    expect(isGoogleConfigured(undefined)).toBe(false);
    expect(isGoogleConfigured({ clientId: "x" })).toBe(false);
    expect(isGoogleConfigured({ clientId: "x", clientSecret: "y" })).toBe(true);
  });
});
