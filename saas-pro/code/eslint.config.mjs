import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import globals from "globals";
import tseslint from "typescript-eslint";

const appFiles = ["apps/**/*.{ts,tsx,js,jsx,mjs}"];

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/drizzle/**", "**/next-env.d.ts", "**/test-results/**", "**/playwright-report/**", "**/coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
    },
  },
  // Next.js, React, hooks and accessibility rules for the apps.
  ...nextVitals.map((c) => ({ ...c, files: appFiles })),
  { files: appFiles, settings: { next: { rootDir: "apps/*/" } } },
);
