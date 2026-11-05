import { describe, expect, it } from "vitest";
import { can, hasRole, requireRole } from "./roles";

describe("roles", () => {
  it("ranks owner > admin > member", () => {
    expect(hasRole("owner", "admin")).toBe(true);
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("member", "admin")).toBe(false);
    expect(hasRole("admin", "owner")).toBe(false);
  });

  it("requireRole throws a forbidden AppError", () => {
    expect(() => requireRole({ role: "member" as const }, "admin")).toThrow(/owners and admins/);
    expect(requireRole({ role: "owner" as const }, "owner").role).toBe("owner");
  });

  it("members can't manage billing; only the owner deletes the workspace", () => {
    expect(can("member", "manageBilling")).toBe(false);
    expect(can("admin", "manageBilling")).toBe(false);
    expect(can("owner", "manageBilling")).toBe(true);
    expect(can("admin", "deleteWorkspace")).toBe(false);
    expect(can("admin", "manageTeam")).toBe(true);
  });
});
