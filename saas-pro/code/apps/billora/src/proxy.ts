import { NextResponse, type NextRequest } from "next/server";
import { buildCsp, createNonce, staticSecurityHeaders } from "./lib/security-headers";

/**
 * Adds a per-request nonce Content Security Policy and the security headers.
 * Next.js reads the CSP from the request headers and puts the nonce on its
 * own scripts, so pages render dynamically (they already do: they read the
 * session or the theme cookie).
 */
export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp({ nonce, dev: process.env.NODE_ENV === "development" });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  for (const { key, value } of staticSecurityHeaders({ production: process.env.NODE_ENV === "production" })) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: API routes, static files and images get the static headers from next.config.ts.
      source: "/((?!api|_next/static|_next/image|favicon.ico|marketing/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
