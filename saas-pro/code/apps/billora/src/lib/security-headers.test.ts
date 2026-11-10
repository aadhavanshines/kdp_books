import { describe, expect, it } from "vitest";
import { buildCsp, createNonce, staticSecurityHeaders } from "./security-headers";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(name + " ") || d === name);

describe("security headers", () => {
  it("builds a strict nonce CSP for production", () => {
    const csp = buildCsp({ nonce: "abc123", dev: false });
    expect(directive(csp, "script-src")).toBe("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
    expect(csp).not.toContain("unsafe-eval");
    expect(directive(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(directive(csp, "object-src")).toBe("object-src 'none'");
    expect(directive(csp, "upgrade-insecure-requests")).toBeDefined();
    expect(directive(csp, "connect-src")).toBe("connect-src 'self'");
    expect(directive(csp, "form-action")).toContain("https://checkout.stripe.com");
  });

  it("relaxes only what development needs", () => {
    const csp = buildCsp({ nonce: "n", dev: true });
    expect(directive(csp, "script-src")).toContain("'unsafe-eval'");
    expect(directive(csp, "connect-src")).toContain("ws:");
    expect(directive(csp, "upgrade-insecure-requests")).toBeUndefined();
  });

  it("sends HSTS only in production", () => {
    const keys = (production: boolean) => staticSecurityHeaders({ production }).map((h) => h.key);
    expect(keys(true)).toContain("Strict-Transport-Security");
    expect(keys(false)).not.toContain("Strict-Transport-Security");
    expect(keys(false)).toEqual(expect.arrayContaining(["X-Frame-Options", "Referrer-Policy", "X-Content-Type-Options"]));
  });

  it("makes a different nonce each time", () => {
    const a = createNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(createNonce()).not.toBe(a);
  });
});
