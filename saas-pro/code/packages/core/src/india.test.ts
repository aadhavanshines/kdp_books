import { describe, expect, it } from "vitest";
import { gstinCheckChar, validateGstin } from "./india";

const make = (first14: string) => first14 + gstinCheckChar(first14);

describe("validateGstin", () => {
  it("accepts a well-formed GSTIN with the right check character", () => {
    const g = make("29ABCDE1234F1Z");
    expect(validateGstin(g.toLowerCase(), "29")).toEqual({ ok: true, gstin: g });
  });

  it("rejects bad format, wrong state and wrong check character", () => {
    expect(validateGstin("12345").ok).toBe(false);
    expect(validateGstin(make("29ABCDE1234F1Z"), "27")).toMatchObject({ ok: false, reason: expect.stringMatching(/Karnataka/) });
    const g = make("29ABCDE1234F1Z");
    const wrong = g.slice(0, 14) + (g[14] === "A" ? "B" : "A");
    expect(validateGstin(wrong)).toMatchObject({ ok: false, reason: expect.stringMatching(/last character/) });
    expect(validateGstin(make("99ABCDE1234F1Z")).ok).toBe(false);
  });
});
