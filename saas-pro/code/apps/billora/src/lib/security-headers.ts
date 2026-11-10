/**
 * Security headers for every response. Pure functions so they can be tested;
 * src/proxy.ts applies them per request (with a fresh CSP nonce) and
 * next.config.ts applies the static ones to routes the proxy skips.
 */

export interface CspOptions {
  nonce: string;
  dev: boolean;
}

/**
 * A nonce-based Content Security Policy suitable for Next.js App Router.
 * - script-src: only scripts carrying this request's nonce run; 'strict-dynamic'
 *   lets them load Next's chunks. Development adds 'unsafe-eval' (React uses
 *   eval for debugging stacks) — never in production.
 * - style-src keeps 'unsafe-inline': React renders `style={...}` attributes
 *   (progress bars, chart widths) and Next/Radix inject inline styles; nonces
 *   don't cover style attributes. Inline styles can't run script, so the
 *   XSS protection comes from script-src.
 * - frame-src 'self' allows the /dev/mail srcdoc preview; frame-ancestors
 *   'none' stops other sites framing us (clickjacking).
 * - form-action allows the payment providers' hosted pages.
 */
export function buildCsp({ nonce, dev }: CspOptions): string {
  const directives: [string, ...string[]][] = [
    ["default-src", "'self'"],
    ["script-src", "'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])],
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:"],
    ["font-src", "'self'"],
    ["connect-src", "'self'", ...(dev ? ["ws:"] : [])],
    ["frame-src", "'self'"],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'", "https://checkout.stripe.com", "https://api.razorpay.com"],
    ["frame-ancestors", "'none'"],
  ];
  if (!dev) directives.push(["upgrade-insecure-requests"]);
  return directives.map((d) => d.join(" ")).join("; ");
}

/** Headers that don't change per request. */
export function staticSecurityHeaders({ production }: { production: boolean }): { key: string; value: string }[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
    // HSTS only in production: on localhost it would pin http://localhost to HTTPS.
    ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  ];
}

/** A random, base64 nonce (128 bits), fresh for each request. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
