import { describe, expect, it } from "vitest";
import { parseTableParams, withParams } from "./table-params";

const opts = { sortKeys: ["created", "name", "email"] as const, defaultSort: { key: "created" as const, dir: "desc" as const } };

describe("parseTableParams", () => {
  it("uses the default sort and first page", () => {
    expect(parseTableParams({}, opts)).toEqual({ sort: { key: "created", dir: "desc" }, page: 1, pageSize: 20, offset: 0 });
  });
  it("accepts allowed keys, directions and pages", () => {
    expect(parseTableParams({ sort: "name", dir: "desc", page: "3" }, opts)).toMatchObject({ sort: { key: "name", dir: "desc" }, page: 3, offset: 40 });
    expect(parseTableParams({ sort: "email" }, opts).sort).toEqual({ key: "email", dir: "asc" });
  });
  it("ignores anything not on the allow-list", () => {
    const p = parseTableParams({ sort: "password; drop table users", dir: "sideways", page: "-4" }, opts);
    expect(p.sort).toEqual({ key: "created", dir: "desc" });
    expect(p.page).toBe(1);
    expect(parseTableParams({ page: "abc" }, opts).page).toBe(1);
  });
});

describe("withParams", () => {
  it("keeps other params and replaces changed ones", () => {
    expect(withParams("/admin/users", { q: "riya", page: "2" }, { sort: "name", dir: "asc", page: 1 })).toBe("/admin/users?q=riya&sort=name&dir=asc&page=1");
    expect(withParams("/x", {}, {})).toBe("/x");
  });
});
