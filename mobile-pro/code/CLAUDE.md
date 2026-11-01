# Pro Apps: project guide for Claude Code

A monorepo of four production-quality mobile apps for Android and iOS, built
with Expo SDK 58 (React Native 0.88, React 19.3, Expo Router), one shared
design system, one shared API client and one local backend. A fifth app,
Reelhouse TV, targets Android TV and lives in `tv/`, outside the workspace.
Read `docs/PRD.md` for what each app does, and `docs/DESIGN.md` for the look.

## Layout
- `apps/platter`  food delivery (Expo app)
- `apps/cartly`   e-commerce store (Expo app)
- `apps/lumo`     social photo sharing (Expo app)
- `apps/minutely` 10-minute grocery delivery (Expo app)
- `packages/ui`   design system: tokens, themed components, icons, art
- `packages/api`  typed API client, React Query hooks, shared types
- `server`        Node + TypeScript API (Hono, SQLite via better-sqlite3,
                  seed data, JWT auth, Server-Sent Events for live status)
- `tv`            Reelhouse TV (react-native-tvos, its own node_modules)

## Commands (run from the repository root)
- `npm install`                 install the workspace
- `npm run server`              start the API on http://localhost:4000
- `npm run typecheck`           TypeScript, every package
- `npm run lint`                ESLint, every package
- `npm test`                    Jest unit and component tests, every package
- `npm run web -w apps/platter` run one app in the browser (also `start`, `android`, `ios`)
- `npm run seed`                wipe and re-seed `server/data/pro.db` (also seeded on first start)
- `npm run check`               typecheck + lint + test in one go
- `npm run gen:art -w packages/ui` regenerate the typed art registry after editing `art/index.json`

Demo login: phone 9876543210, OTP 123456. Server env: `PORT`, `DB_PATH`,
`JWT_SECRET`, `SIM_SPEED` (2 = order simulation twice as fast). Apps read
`EXPO_PUBLIC_API_URL` (Android emulator: http://10.0.2.2:4000).
Tests: Jest (jest-expo) in packages, Vitest in server/.

## Rules
- TypeScript strict mode everywhere. No `any` without a comment saying why.
- Every screen works on Android, iOS and web (react-native-web): no
  native-only library without a web fallback. Maps are drawn with
  react-native-svg, not a map SDK, so they render everywhere.
- Use only components and tokens from `@pro/ui` for colors, type, spacing,
  radii and shadows. Never hard-code a color in an app.
- Images: the 3D illustrations in `packages/ui/art` (MIT, Microsoft Fluent
  Emoji 3D). No downloaded photos, no brand logos of real companies.
- All people, restaurants, products, shops and data are fictional. Use
  `.example` domains for any email or URL. Prices are in Indian rupees (₹)
  formatted with `Intl.NumberFormat('en-IN')`.
- Accessibility: every touchable has an `accessibilityRole` and label; text
  scales with the system font size; touch targets at least 44x44.
- Tests live next to the code as `*.test.ts(x)`. New logic needs a test.
- Before saying a task is done, run typecheck, lint and tests, and fix
  everything they report.
