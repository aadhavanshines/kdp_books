import { defineConfig } from "@playwright/test";

/**
 * Screenshot tour of every screen. Start the app first (`npm run dev:billora`)
 * against a seeded database, then run `npm run screenshots:billora`.
 * Set CHROME_PATH to use an installed Chromium instead of Playwright's.
 */
const launchOptions = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", launchOptions, colorScheme: "light", locale: "en-IN", timezoneId: "Asia/Kolkata" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
