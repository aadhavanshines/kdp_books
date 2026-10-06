# QuickBite

A production-quality food delivery web app (React + TypeScript + Vite + Tailwind CSS).
It launches in India (₹, Razorpay) and is built to expand to other countries.

The full plan (architecture, data model, security, payments, phases) is in
[docs/PLAN.md](docs/PLAN.md).

## Quick start

You need **Node 22.22+** and **pnpm 10** (`corepack enable` installs pnpm for you).

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

No accounts or keys are needed: until the real backends arrive, the app runs on
an **in-memory backend** filled with seed data (13 areas in 4 cities, ~200
restaurants, ~3,000 dishes).

## What works today (build phases 0–2)

- Choose a delivery area (or use your location), browse restaurants with offers,
  ratings, delivery times and cost for two; filter and sort
- Search dishes and restaurants; open a menu with veg / non-veg marks
- Add to a cart that follows you around (one restaurant at a time) and survives reloads
- Checkout with a delivery address, coupons and an itemised bill (item total,
  delivery fee by distance, platform fee, GST, discount) priced by the backend
- Not yet: sign-in, real backends, payments and order tracking (phases 3–6)

## Scripts

| Command                                        | What it does                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm dev`                                     | Start the web app with hot reload                                          |
| `pnpm build` / `pnpm preview`                  | Production build / serve it on :4173                                       |
| `pnpm test`                                    | Unit and component tests (Vitest)                                          |
| `pnpm test:e2e`                                | End-to-end tests on a phone and a desktop screen (Playwright)              |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Code quality                                                               |
| `pnpm check`                                   | Everything above, in order (what CI runs)                                  |
| `pnpm images`                                  | Regenerate seed images (`--force` to rebuild all, `--sheet` for a preview) |

The first time you run end-to-end tests, install a browser with
`pnpm exec playwright install chromium`, or point
`PLAYWRIGHT_BROWSERS_PATH` at an existing install.

## Project layout

```
apps/web/          React app (routes, features, design-system components, backend adapters)
packages/core/     Pure TypeScript business logic: money, pricing, coupons, filters, search
packages/seed/     Seed catalog + the generator for the seed artwork
tests/e2e/         Playwright tests
docs/PLAN.md       The build plan
```

## Seed images

There's no stock photography in the repo. Every dish and restaurant image is
**generated artwork** (illustrated dishes on soft backgrounds) produced by
`packages/seed/art` and rendered to WebP by `pnpm images`.

To use real photos, drop files named after the image key into
`packages/seed/photos/dishes/<key>.jpg` or
`packages/seed/photos/restaurants/<brandId>.jpg` and run `pnpm images --force`.
They are cropped and resized to the same sizes and names, so the app needs no change.
