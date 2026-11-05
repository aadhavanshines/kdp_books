import { and, eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, inject } from "vitest";
import { createDb } from "../db";
import { emailOutbox, memberships } from "../db/schema";
import { firstLink } from "../email";
import { addMember, contextFor, createTestUser, createTestWorkspace, testEmail } from "../testing";
import {
  acceptInvitation,
  changeRole,
  getInvitationByToken,
  INVITE_TTL_MS,
  inviteMember,
  leaveWorkspace,
  listMembers,
  listPendingInvitations,
  removeMember,
  revokeInvitation,
  transferOwnership,
} from ".";

const { db, close } = createDb(inject("databaseUrl"));
afterAll(close);

const opts = { product: "Billora", inviteUrl: (t: string) => `http://localhost:3000/invite/${t}` };

async function setup() {
  const owner = await createTestUser(db, { name: "Owner" });
  const admin = await createTestUser(db, { name: "Admin" });
  const member = await createTestUser(db, { name: "Member" });
  const ws = await createTestWorkspace(db, owner.id);
  await addMember(db, ws.id, admin.id, "admin");
  await addMember(db, ws.id, member.id, "member");
  return {
    ws, owner, admin, member,
    ownerCtx: await contextFor(db, owner, ws.id),
    adminCtx: await contextFor(db, admin, ws.id),
    memberCtx: await contextFor(db, member, ws.id),
  };
}
let t: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => { t = await setup(); });

const roleOf = async (workspaceId: string, userId: string) =>
  (await db.select().from(memberships).where(and(eq(memberships.workspaceId, workspaceId), eq(memberships.userId, userId))))[0]?.role;

describe("invitations", () => {
  it("emails a link whose token works once, for the invited email only", async () => {
    const email = testEmail("invitee");
    const { token, invitation } = await inviteMember(db, t.ownerCtx, { email: email.toUpperCase(), role: "member" }, opts);
    expect(invitation.email).toBe(email);
    expect(invitation.tokenHash).not.toContain(token);

    const [mail] = await db.select().from(emailOutbox).where(eq(emailOutbox.to, email));
    expect(mail?.kind).toBe("team.invite");
    expect(firstLink(mail!.text)).toBe(`http://localhost:3000/invite/${token}`);
    expect((await getInvitationByToken(db, token))?.status).toBe("pending");

    const stranger = await createTestUser(db);
    await expect(acceptInvitation(db, { ...stranger, emailVerified: true }, token)).rejects.toThrow(/is for/);

    const invitee = await createTestUser(db, { email, verified: false });
    await expect(acceptInvitation(db, invitee, token)).rejects.toThrow(/Verify/);
    await acceptInvitation(db, { ...invitee, emailVerified: true }, token);
    expect(await roleOf(t.ws.id, invitee.id)).toBe("member");
    await expect(acceptInvitation(db, { ...invitee, emailVerified: true }, token)).rejects.toThrow(/already been used/);
    expect((await getInvitationByToken(db, token))?.status).toBe("accepted");
  });

  it("expires after 7 days", async () => {
    const email = testEmail();
    const { token } = await inviteMember(db, t.ownerCtx, { email, role: "member" }, opts);
    const user = await createTestUser(db, { email });
    const later = new Date(Date.now() + INVITE_TTL_MS + 1000);
    expect((await getInvitationByToken(db, token, later))?.status).toBe("expired");
    await expect(acceptInvitation(db, user, token, later)).rejects.toThrow(/expired/);
  });

  it("re-inviting replaces the old link; revoked links stop working", async () => {
    const email = testEmail();
    const first = await inviteMember(db, t.adminCtx, { email, role: "member" }, opts);
    const second = await inviteMember(db, t.adminCtx, { email, role: "member" }, opts);
    expect((await getInvitationByToken(db, first.token))?.status).toBe("revoked");
    expect(await listPendingInvitations(db, t.ws.id)).toHaveLength(1);
    await revokeInvitation(db, t.adminCtx, second.invitation.id);
    const user = await createTestUser(db, { email });
    await expect(acceptInvitation(db, user, second.token)).rejects.toThrow(/cancelled/);
  });

  it("enforces who may invite whom", async () => {
    await expect(inviteMember(db, t.memberCtx, { email: testEmail(), role: "member" }, opts)).rejects.toThrow(/owners and admins/);
    await expect(inviteMember(db, t.adminCtx, { email: testEmail(), role: "admin" }, opts)).rejects.toThrow(/Only the owner/);
    await expect(inviteMember(db, t.ownerCtx, { email: t.member.email, role: "member" }, opts)).rejects.toThrow(/already a member/);
    await expect(inviteMember(db, t.ownerCtx, { email: "not-an-email", role: "member" }, opts)).rejects.toThrow();
    await expect(inviteMember(db, t.ownerCtx, { email: testEmail(), role: "owner" as "admin" }, opts)).rejects.toThrow();
  });

  it("can't revoke another workspace's invitation", async () => {
    const other = await createTestUser(db);
    const otherWs = await createTestWorkspace(db, other.id, "Other");
    const otherCtx = await contextFor(db, other, otherWs.id);
    const { invitation } = await inviteMember(db, otherCtx, { email: testEmail(), role: "member" }, opts);
    await expect(revokeInvitation(db, t.ownerCtx, invitation.id)).rejects.toThrow(/not found/);
  });
});

describe("roles and membership", () => {
  it("lists members owner first", async () => {
    const list = await listMembers(db, t.ws.id);
    expect(list.map((m) => m.role)).toEqual(["owner", "admin", "member"]);
  });

  it("owner can promote and demote; admins can't touch admins or promote", async () => {
    await changeRole(db, t.ownerCtx, { userId: t.member.id, role: "admin" });
    expect(await roleOf(t.ws.id, t.member.id)).toBe("admin");
    await changeRole(db, t.ownerCtx, { userId: t.member.id, role: "member" });

    await expect(changeRole(db, t.adminCtx, { userId: t.member.id, role: "admin" })).rejects.toThrow(/Only the owner/);
    const other = await createTestUser(db);
    await addMember(db, t.ws.id, other.id, "admin");
    await expect(changeRole(db, t.adminCtx, { userId: other.id, role: "member" })).rejects.toThrow(/Only the owner/);
    await expect(changeRole(db, t.memberCtx, { userId: t.admin.id, role: "member" })).rejects.toThrow();
    await expect(changeRole(db, t.ownerCtx, { userId: t.owner.id, role: "member" })).rejects.toThrow(/your own/);
    await expect(changeRole(db, t.adminCtx, { userId: t.owner.id, role: "member" })).rejects.toThrow(/owner/);
  });

  it("remove: admins remove members, only the owner removes admins, nobody removes the owner", async () => {
    await expect(removeMember(db, t.memberCtx, { userId: t.admin.id })).rejects.toThrow();
    await expect(removeMember(db, t.adminCtx, { userId: t.owner.id })).rejects.toThrow();
    await removeMember(db, t.adminCtx, { userId: t.member.id });
    expect(await roleOf(t.ws.id, t.member.id)).toBeUndefined();
    await removeMember(db, t.ownerCtx, { userId: t.admin.id });
    expect(await roleOf(t.ws.id, t.admin.id)).toBeUndefined();
  });

  it("can't remove someone from another workspace", async () => {
    const other = await createTestUser(db);
    await createTestWorkspace(db, other.id, "Elsewhere");
    await expect(removeMember(db, t.ownerCtx, { userId: other.id })).rejects.toThrow(/not a member/);
  });

  it("members and admins can leave; the owner can't", async () => {
    await expect(leaveWorkspace(db, t.ownerCtx)).rejects.toThrow(/Transfer ownership/);
    await leaveWorkspace(db, t.memberCtx);
    expect(await roleOf(t.ws.id, t.member.id)).toBeUndefined();
  });

  it("transfers ownership to a member; the old owner becomes admin", async () => {
    await expect(transferOwnership(db, t.adminCtx, { userId: t.member.id })).rejects.toThrow(/Only the workspace owner/);
    await transferOwnership(db, t.ownerCtx, { userId: t.member.id });
    expect(await roleOf(t.ws.id, t.member.id)).toBe("owner");
    expect(await roleOf(t.ws.id, t.owner.id)).toBe("admin");
  });

  it("the database refuses a second owner", async () => {
    await expect(db.update(memberships).set({ role: "owner" }).where(and(eq(memberships.workspaceId, t.ws.id), eq(memberships.userId, t.admin.id)))).rejects.toThrow();
  });
});
