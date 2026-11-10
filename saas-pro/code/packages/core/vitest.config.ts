import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globalSetup: ["./src/testing/global-setup.ts"],
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
