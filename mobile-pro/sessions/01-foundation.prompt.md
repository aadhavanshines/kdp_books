Read CLAUDE.md, docs/PRD.md and docs/DESIGN.md. This session sets up the
foundation that all four apps will share. Build it in this order, and check
each step before moving on:

1. The npm workspace: a root package.json with workspaces apps/*, packages/*
   and server; shared tsconfig (strict); ESLint (flat config, expo +
   typescript rules) and Jest configured so `npm run typecheck`, `npm run
   lint` and `npm test` run across every package. Use the exact versions
   Expo SDK 58 expects (expo ~58.0.22, react-native 0.88.1, react 19.3.0;
   check with `npx expo install --check` once an app exists).

2. packages/ui, the design system in docs/DESIGN.md: tokens (colors per
   brand with light and dark, type scale with Inter, spacing, radii,
   shadows), a ThemeProvider that takes a brand name, and every component
   listed in DESIGN.md, built with React Native primitives and Reanimated 4
   so they render on Android, iOS and web. An `Art` component and ArtTile
   that load the illustrations in packages/ui/art by name (typed from
   art/index.json). Component tests with @testing-library/react-native for
   the stateful ones (QuantityStepper, Price, CountdownTimer, Button).

3. server/: the Node + TypeScript API from the PRD, Hono on port 4000,
   better-sqlite3, a seed script with rich, believable fictional data for
   all four apps (at least 24 restaurants with full menus, 60 products with
   reviews, 20 users with posts, stories and comments, 120 grocery items in
   12 categories, coupons), OTP login (code 123456) returning a JWT, carts,
   orders, and order-status simulation pushed over Server-Sent Events.
   Tests for the routes with Vitest or Jest and supertest-style requests.

4. packages/api: typed fetch client for every route, React Query hooks,
   an SSE helper that works in React Native and on web, shared types.
   Base URL from EXPO_PUBLIC_API_URL, defaulting to http://localhost:4000.

Do not create the four apps yet; the next sessions do that. Finish by
running typecheck, lint and tests, fixing everything, and then write a
short summary: what you built, the commands, and anything you decided that
differs from the docs.
