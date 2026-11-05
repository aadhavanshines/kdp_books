# SaaS Suite: project guide for Claude Code

A monorepo of four SaaS products built on one shared foundation, for the
book *Vibe Coding a SaaS*. Read `docs/PRD.md` for what to build and
`docs/DESIGN.md` for how it should look.

## Layout
- `apps/billora`   invoicing and getting paid (Next.js app)
- `apps/slotra`    online booking (Next.js app)
- `apps/wordloom`  AI writing assistant (Next.js app)
- `apps/formora`   forms and surveys (Next.js app)
- `packages/core`  database schema and helpers (Drizzle + PostgreSQL), auth
                   (Better Auth), workspaces, roles, billing (plans,
                   entitlements, Razorpay/Stripe/fake providers, webhooks),
                   email (React Email + outbox), audit log, rate limits
- `packages/ui`    design system (Tailwind CSS 4, components, charts, app
                   shell, marketing blocks)

## Stack
Next.js 16 (App Router, React 19, TypeScript strict, Turbopack), Drizzle
ORM on PostgreSQL 16, Better Auth, Zod 4, Tailwind CSS 4, Vitest for unit
and integration tests, Playwright for end-to-end tests and screenshots.
Use the current versions of these packages from npm.

## Local database
PostgreSQL 16 runs locally. Development uses
`DATABASE_URL=postgres://saas:saas@localhost:5432/saas_dev` (one database per
app is fine: `saas_billora`, `saas_slotra`, ...). The `saas` role may create
databases, so tests create a fresh database per run and drop it afterwards.
Also provide a `docker-compose.yml` with PostgreSQL for readers.

## Rules
- TypeScript strict everywhere; no `any` without a comment saying why.
- Server first: data is read in Server Components and changed in Server
  Actions or Route Handlers. Validate every input with Zod on the server.
- Multi-tenancy: every product table has a `workspace_id`; product data is
  only ever read or written through the workspace-scoped helpers in
  `packages/core`. Never trust a workspace id sent by the browser.
- Money is integer paise; never floating-point rupees. Format with
  `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- Store times in UTC; show them in the workspace's time zone
  (default `Asia/Kolkata`).
- Payments and subscriptions change state only from verified webhooks,
  processed exactly once (store event ids). The amount always comes from
  the server.
- External services are optional: with no keys, use the built-in fake
  payment provider, the fake AI model and the email outbox, so every app
  runs and every test passes offline. Never send real email or real
  payments from development or tests.
- Secrets live in environment variables (`.env.local`, never committed);
  only `NEXT_PUBLIC_` values reach the browser.
- Design: only `packages/ui` components and theme roles; never hard-code a
  colour in an app. Every page has loading, empty, error and full states.
  Accessible: labels, focus, keyboard, contrast.
- All data is fictional; use `.example` domains; no real company logos.
- Tests live next to the code (`*.test.ts(x)`). New logic needs a test.
  Database tests run against a real PostgreSQL created per test run.
- Before saying a task is done: run typecheck, lint and tests for the
  whole workspace and fix everything they report.
