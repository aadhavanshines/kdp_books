import { afterAll, describe, expect, inject, it } from "vitest";
import { createDb } from "../db";
import { gstinCheckChar } from "../india";
import { contextFor, createTestUser } from "../testing";
import { createWorkspace, slugify, updateWorkspace, workspaceDetailsSchema } from ".";
import { addMember } from "../testing";

const { db, close } = createDb(inject("databaseUrl"));
afterAll(close);

describe("workspace details", () => {
  it("gives friendly messages for missing fields", () => {
    const r = workspaceDetailsSchema.safeParse({ name: "A" });
    expect(r.success).toBe(false);
    const messages = r.error!.issues.map((i) => i.message);
    expect(messages).toContain("Choose your state.");
    expect(messages).toContain("Use at least 2 characters.");
  });

  it("checks the GSTIN against the chosen state", () => {
    const gstin = "29ABCDE1234F1Z" + gstinCheckChar("29ABCDE1234F1Z");
    expect(workspaceDetailsSchema.safeParse({ name: "Studio", billingState: "29", gstin }).success).toBe(true);
    expect(workspaceDetailsSchema.safeParse({ name: "Studio", billingState: "27", gstin }).success).toBe(false);
    expect(workspaceDetailsSchema.parse({ name: "Studio", billingState: "29", gstin: "" }).gstin).toBeUndefined();
  });

  it("makes unique slugs and an owner membership", async () => {
    expect(slugify("Riya's Café & Co.")).toBe("riya-s-cafe-co");
    const u = await createTestUser(db);
    const a = await createWorkspace(db, u.id, { name: "Same Name Ltd", billingState: "29" });
    const b = await createWorkspace(db, u.id, { name: "Same Name Ltd", billingState: "29" });
    expect(a.slug).not.toBe(b.slug);
    expect((await contextFor(db, u, b.id)).role).toBe("owner");
  });

  it("only owners and admins can update details", async () => {
    const owner = await createTestUser(db);
    const member = await createTestUser(db);
    const ws = await createWorkspace(db, owner.id, { name: "Locked Ltd", billingState: "29" });
    await addMember(db, ws.id, member.id, "member");
    await expect(updateWorkspace(db, await contextFor(db, member, ws.id), { name: "Hijacked", billingState: "29" })).rejects.toThrow(/owners and admins/);
    const updated = await updateWorkspace(db, await contextFor(db, owner, ws.id), { name: "Renamed Ltd", billingState: "07" });
    expect(updated?.name).toBe("Renamed Ltd");
  });
});
