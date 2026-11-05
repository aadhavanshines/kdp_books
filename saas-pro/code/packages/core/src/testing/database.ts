import { randomBytes } from "node:crypto";
import { dropDatabase, ensureDatabase, runMigrations } from "../db/migrate";

export const DEFAULT_TEST_ADMIN_URL = "postgres://saas:saas@localhost:5432/postgres";

/** Create a uniquely named, fully migrated database. Call `drop()` when done. */
export async function createTestDatabase(adminUrl = process.env.TEST_DATABASE_ADMIN_URL ?? DEFAULT_TEST_ADMIN_URL) {
  const u = new URL(adminUrl);
  u.pathname = `/saas_test_${Date.now()}_${randomBytes(3).toString("hex")}`;
  const url = u.toString();
  await ensureDatabase(url);
  try {
    await runMigrations(url);
  } catch (e) {
    await dropDatabase(url);
    throw e;
  }
  return { url, drop: () => dropDatabase(url) };
}
