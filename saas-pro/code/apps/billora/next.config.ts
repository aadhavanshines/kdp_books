import type { NextConfig } from "next";
import { staticSecurityHeaders } from "./src/lib/security-headers";

// Static headers for every route; src/proxy.ts adds the per-request CSP to pages.
const securityHeaders = staticSecurityHeaders({ production: process.env.NODE_ENV === "production" });

const config: NextConfig = {
  transpilePackages: ["@saas/core", "@saas/ui"],
  serverExternalPackages: ["pg"],
  devIndicators: false,
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
