import "server-only";
import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

const schema = z.object({
  DATABASE_URL: z.string().default("postgres://saas:saas@localhost:5432/saas_billora"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: isProd
    ? z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
    : z.string().min(32).default("dev-only-secret-do-not-use-in-production-0001"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const blankToUndefined = Object.fromEntries(
  Object.entries(process.env).map(([k, v]) => [k, v === "" ? undefined : v]),
);

export const env = schema.parse(blankToUndefined);
export const PRODUCT = "Billora";
