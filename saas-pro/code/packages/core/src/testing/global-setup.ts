import type { TestProject } from "vitest/node";
import { createTestDatabase } from "./database";

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

/** One fresh PostgreSQL database per test run, dropped afterwards. */
export default async function setup(project: TestProject) {
  const database = await createTestDatabase();
  project.provide("databaseUrl", database.url);
  return async () => {
    await database.drop();
  };
}
