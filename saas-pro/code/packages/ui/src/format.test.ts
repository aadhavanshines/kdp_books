import { describe, expect, it } from "vitest";
import { formatDate, formatINR, initials } from "./format";

describe("format", () => {
  it("formats paise as rupees with Indian grouping", () => {
    expect(formatINR(1234567)).toBe("₹12,345.67");
    expect(formatINR(1_00_00_000_00)).toBe("₹1,00,00,000.00");
    expect(() => formatINR(1.5)).toThrow();
  });
  it("formats dates in the workspace time zone", () => {
    // 20:00 UTC on 4 Nov is 01:30 on 5 Nov in India.
    expect(formatDate("2026-11-04T20:00:00Z")).toBe("5 Nov 2026");
    expect(formatDate("2026-11-04T20:00:00Z", "UTC")).toBe("4 Nov 2026");
  });
  it("makes initials", () => {
    expect(initials("Riya Sharma")).toBe("RS");
    expect(initials("riya")).toBe("R");
  });
});
