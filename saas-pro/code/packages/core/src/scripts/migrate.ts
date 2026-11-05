import { DEFAULT_DATABASE_URL } from "../db";
import { ensureDatabase, runMigrations } from "../db/migrate";

const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
await ensureDatabase(url);
await runMigrations(url);
console.log(`Migrated ${new URL(url).pathname.slice(1)}`);
