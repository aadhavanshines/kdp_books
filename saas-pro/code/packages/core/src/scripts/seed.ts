/**
 * Fictional demo data for local development (all `.example` addresses).
 *   riya@billora.example   owner of "Riya Sharma Design Studio" (Karnataka, GSTIN)
 *   arjun@billora.example  member of Riya's workspace
 *   kabir@billora.example  owner of "Kabir Traders" (Maharashtra) — a separate
 *                          workspace for checking isolation
 * Every password is `demo-password-2026`. Safe to run repeatedly.
 */
import { eq, inArray } from "drizzle-orm";
import { createAuth } from "../auth";
import { createDb, DEFAULT_DATABASE_URL } from "../db";
import { ensureDatabase, runMigrations } from "../db/migrate";
import { emailOutbox, memberships, users, workspaces } from "../db/schema";
import { gstinCheckChar } from "../india";
import { createWorkspace } from "../workspaces";

const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
await ensureDatabase(url);
await runMigrations(url);
const { db, close } = createDb(url);

const PASSWORD = "demo-password-2026";
const people = [
  { name: "Riya Sharma", email: "riya@billora.example" },
  { name: "Arjun Mehta", email: "arjun@billora.example" },
  { name: "Kabir Khan", email: "kabir@billora.example" },
];
const slugs = ["riya-sharma-design-studio", "kabir-traders"];

const auth = createAuth({ db, product: "Billora", baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000", secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-do-not-use-in-production-0001" });

// Start clean: remove earlier seed users, their workspaces and their emails.
const emails = people.map((p) => p.email);
await db.delete(workspaces).where(inArray(workspaces.slug, slugs));
await db.delete(users).where(inArray(users.email, emails));
await db.delete(emailOutbox).where(inArray(emailOutbox.to, emails));

const ids: Record<string, string> = {};
for (const p of people) {
  const res = await auth.api.signUpEmail({ body: { name: p.name, email: p.email, password: PASSWORD } });
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, res.user.id));
  ids[p.email] = res.user.id;
}
// Sign-up queued verification emails; they're already verified.
await db.delete(emailOutbox).where(inArray(emailOutbox.to, emails));

const riyaGstin = "29ABCPS1234K1Z" + gstinCheckChar("29ABCPS1234K1Z");
const studio = await createWorkspace(db, ids["riya@billora.example"]!, { name: "Riya Sharma Design Studio", billingState: "29", gstin: riyaGstin });
await db.insert(memberships).values({ workspaceId: studio.id, userId: ids["arjun@billora.example"]!, role: "member" });
const traders = await createWorkspace(db, ids["kabir@billora.example"]!, { name: "Kabir Traders", billingState: "27" });

console.log(`Seeded ${url.split("/").pop()}:`);
console.log(`  ${studio.name} (${studio.slug}), GSTIN ${riyaGstin}: riya (owner), arjun (member)`);
console.log(`  ${traders.name} (${traders.slug}): kabir (owner)`);
console.log(`  Password for all: ${PASSWORD}`);
await close();
