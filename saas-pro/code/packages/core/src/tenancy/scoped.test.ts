import { eq, sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { createDb } from "../db";
import { createTestSession, createTestUser, createTestWorkspace } from "../testing";
import { getWorkspaceContext, switchWorkspace } from "./context";
import { scoped } from "./scoped";

// A stand-in product table, shaped like every real product table will be.
const notes = pgTable("test_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull(),
  body: text("body").notNull(),
});

const { db, close } = createDb(inject("databaseUrl"));
let wsA: string;
let wsB: string;
let alice: Awaited<ReturnType<typeof createTestUser>>;

beforeAll(async () => {
  await db.execute(sql`create table if not exists test_notes (id uuid primary key default gen_random_uuid(), workspace_id uuid not null, body text not null)`);
  alice = await createTestUser(db, { name: "Alice" });
  const bob = await createTestUser(db, { name: "Bob" });
  wsA = (await createTestWorkspace(db, alice.id, "Alpha")).id;
  wsB = (await createTestWorkspace(db, bob.id, "Beta")).id;
  await scoped(db, wsA).insert(notes, [{ body: "a1" }, { body: "a2" }]);
  await scoped(db, wsB).insert(notes, { body: "b1" });
});
afterAll(close);

describe("scoped()", () => {
  it("only reads the workspace's own rows", async () => {
    const a = await scoped(db, wsA).select(notes, { orderBy: notes.body });
    const b = await scoped(db, wsB).select(notes);
    expect(a.map((n) => n.body)).toEqual(["a1", "a2"]);
    expect(b.map((n) => n.body)).toEqual(["b1"]);
    expect(await scoped(db, wsA).count(notes)).toBe(2);
  });

  it("can't fetch another workspace's row even by id", async () => {
    const [b1] = await scoped(db, wsB).select(notes);
    expect(await scoped(db, wsA).first(notes, eq(notes.id, b1!.id))).toBeUndefined();
  });

  it("can't update or delete another workspace's rows", async () => {
    const [b1] = await scoped(db, wsB).select(notes);
    expect(await scoped(db, wsA).update(notes, { body: "hacked" }, eq(notes.id, b1!.id))).toEqual([]);
    expect(await scoped(db, wsA).delete(notes, eq(notes.id, b1!.id))).toEqual([]);
    expect((await scoped(db, wsB).first(notes, eq(notes.id, b1!.id)))?.body).toBe("b1");
  });

  it("ignores a workspaceId smuggled into insert or update values", async () => {
    const smuggled = { body: "sneaky", workspaceId: wsB } as unknown as { body: string };
    const [row] = await scoped(db, wsA).insert(notes, smuggled);
    expect(row!.workspaceId).toBe(wsA);
    const [moved] = await scoped(db, wsA).update(notes, { workspaceId: wsB, body: "still A" } as unknown as { body: string }, eq(notes.id, row!.id));
    expect(moved!.workspaceId).toBe(wsA);
    await scoped(db, wsA).delete(notes, eq(notes.id, row!.id));
  });

  it("refuses an empty workspace id", () => {
    expect(() => scoped(db, "")).toThrow();
  });
});

describe("workspace context", () => {
  it("never resolves to a workspace the user isn't a member of", async () => {
    const s = await createTestSession(db, alice.id);
    const ctx = await getWorkspaceContext(db, { session: { id: s.id, activeWorkspaceId: wsB }, user: alice });
    expect(ctx?.workspace.id).toBe(wsA);
    expect(ctx?.role).toBe("owner");
    expect(ctx?.db.workspaceId).toBe(wsA);
  });

  it("refuses to switch to someone else's workspace", async () => {
    const s = await createTestSession(db, alice.id);
    await expect(switchWorkspace(db, { session: { id: s.id }, user: alice }, wsB)).rejects.toThrow(/not a member/);
    await expect(switchWorkspace(db, { session: { id: s.id }, user: alice }, "not-a-uuid")).rejects.toThrow();
  });

  it("returns null when the user has no workspace", async () => {
    const loner = await createTestUser(db);
    const s = await createTestSession(db, loner.id);
    expect(await getWorkspaceContext(db, { session: { id: s.id }, user: loner })).toBeNull();
  });
});
