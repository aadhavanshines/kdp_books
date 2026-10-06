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

No accounts or keys are needed: `pnpm dev` runs the app on an **in-memory
backend** filled with seed data (13 areas in 4 cities, ~200 restaurants,
~3,000 dishes).

### On the Firebase emulators

You also need **Java 21** (the Firestore emulator is a Java program).

```bash
pnpm dev:firebase # Auth, Firestore and Functions emulators + seed + order simulator
                  # + web app on http://localhost:5173 (Emulator UI on :4000)
```

This uses the `demo-quickbite` project, so no Firebase account is needed. Sign in
with any email address: no email is sent locally, so the sign-in page shows an
**Open sign-in link** button (the link comes from the Auth emulator).

Then order something: the **Test payment** sheet has _Pay_ and _Simulate a failed
payment_ buttons. Paying makes the fake provider send a signed webhook to the
real webhook function, and the order page follows the order live from "Order
placed" to "Delivered" (one step every 20 seconds; set `DEMO_STEP_SECONDS` to
change it).

### On a local Supabase stack

You need **Docker** and the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).

```bash
pnpm dev:supabase # supabase start (applies supabase/migrations) + seed + Edge Functions
                  # + order simulator + web app on http://localhost:5173
```

No Supabase account is needed. Sign-in emails land in Mailpit
(http://127.0.0.1:54324): open the link, or type the 6-digit code from the email
on the sign-in page. Studio is on http://127.0.0.1:54323. `supabase stop` stops
the stack; `supabase db reset` re-applies the migrations from scratch (run
`pnpm seed:supabase` again afterwards).

## What works today (build phases 0–7)

- Choose a delivery area (or use your location), browse restaurants with offers,
  ratings, delivery times and cost for two; filter and sort
- Search dishes and restaurants; open a menu with veg / non-veg marks
- Add to a cart that follows you around (one restaurant at a time) and survives reloads
- Checkout with a delivery address, coupons and an itemised bill (item total,
  delivery fee by distance, platform fee, GST, discount) priced by the backend
- Passwordless sign-in with an emailed link, a profile and saved addresses
  (private to each customer)
- Three interchangeable backends chosen with `VITE_BACKEND`: `memory`,
  `firebase` (Auth + Firestore, protected by security rules) and `supabase`
  (Auth + Postgres protected by Row Level Security + Realtime + Edge Functions),
  all passing the same contract and end-to-end suites
- Server-side orders (Cloud Functions or Supabase Edge Functions, sharing one
  copy of the order and payment code): the server prices every order from its
  own data, creates it idempotently (a retried checkout never duplicates an
  order) and limits each customer to 10 orders a minute
- Payments in **fake mode** (`PAYMENTS_MODE=fake`, the default locally): a
  signed webhook (HMAC-SHA256 over the raw body, 5-minute window) is the only
  way an order becomes "placed", and only if the amount and currency match;
  repeated webhooks are no-ops
- Live order tracking, order history, retry after a failed payment, and a demo
  simulator that moves paid orders to "delivered" and expires unpaid ones
- Real payments in **test mode** (`PAYMENTS_MODE=real`): Razorpay Checkout
  (UPI, cards, netbanking) for India and the Stripe Payment Element for
  international regions, chosen per region on the server. Razorpay's payment
  signature is checked and the payment fetched from Razorpay before an order is
  placed; Razorpay and Stripe webhooks are signature-checked on the raw body,
  replays are skipped, and the amount and currency must match the order
- Ready for Firebase Hosting (phase 7): `firebase.json` with single-page-app
  routing, `/api/*` and `/webhooks/*` rewrites to the functions, security headers
  including a strict Content-Security-Policy, and long caching for hashed files;
  Razorpay keys in Secret Manager; a GitHub Actions workflow with a preview
  channel per pull request and the live deploy from `main`; and the About,
  Contact, Terms, Privacy, Refunds and Shipping pages Razorpay requires.
  Step by step: [docs/LAUNCH.md](docs/LAUNCH.md)

## Scripts

| Command                                        | What it does                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Start the web app with hot reload                                                       |
| `pnpm build` / `pnpm preview`                  | Production build / serve it on :4173                                                    |
| `pnpm test`                                    | Unit and component tests (Vitest)                                                       |
| `pnpm test:e2e`                                | End-to-end tests on a phone and a desktop screen (Playwright)                           |
| `pnpm dev:firebase`                            | Firebase emulators, seed data and the web app together                                  |
| `pnpm test:rules`                              | Firestore security rules tests (starts the Firestore emulator)                          |
| `pnpm test:contract`                           | One backend contract suite run against `memory` and `firebase`                          |
| `pnpm test:e2e:firebase`                       | The end-to-end tests against the Firebase emulators                                     |
| `pnpm test:hosting`                            | Hosting emulator: routes, headers, caching, and the app and payments under the real CSP |
| `pnpm launch:check`                            | Fails while `business.ts` still has placeholder details (run before going live)         |
| `pnpm emulators` / `pnpm seed:firebase`        | Start the emulators on their own / load seed data into them                             |
| `pnpm sim`                                     | The order simulator, against running emulators                                          |
| `pnpm build:functions`                         | Bundle the Cloud Functions into `firebase/functions/lib`                                |
| `pnpm dev:supabase`                            | Local Supabase stack, seed data, Edge Functions and the web app together                |
| `pnpm test:supabase:standin`                   | Migrations from scratch + RLS + server tests on plain PostgreSQL (no Docker)            |
| `pnpm test:supabase:db`                        | The same tests against a running local Supabase stack                                   |
| `pnpm test:contract:supabase`                  | The backend contract suite against a running local Supabase stack                       |
| `pnpm test:e2e:supabase`                       | The end-to-end tests against a local Supabase stack                                     |
| `pnpm seed:supabase` / `pnpm sim:supabase`     | Load seed data into the local database / run the order simulator against it             |
| `pnpm build:supabase`                          | Bundle the server code into `supabase/functions/_shared/server.js`                      |
| `pnpm payments:check`                          | Check Razorpay / Stripe **test** keys against the real APIs (see below)                 |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | Code quality                                                                            |
| `pnpm check`                                   | Everything above, in order (what CI runs)                                               |
| `pnpm images`                                  | Regenerate seed images (`--force` to rebuild all, `--sheet` for a preview)              |

The first time you run end-to-end tests, install a browser with
`pnpm exec playwright install chromium`, or point
`PLAYWRIGHT_BROWSERS_PATH` at an existing install.

## Project layout

```
apps/web/          React app (routes, features, design-system components, backend adapters)
packages/core/     Pure TypeScript business logic: money, pricing, coupons, quotes, order types
packages/server/   Order workflow written once: OrderService, Razorpay / Stripe / fake
                   gateways, webhook handling, simulator (web-standard APIs only);
                   packages/server/test holds the offline provider simulators
packages/seed/     Seed catalog, the Firestore seed loader and the generator for the seed artwork
firebase/          Security rules, Firestore indexes and Cloud Functions (firebase/functions)
supabase/          Migrations (schema, RLS, search, cron), Edge Functions, email template,
                   and supabase/server: the Postgres order store, row mapping and function handlers
tests/rules/       Firestore security rules tests
tests/supabase/    Migrations, RLS and server tests on PostgreSQL (with a test-only Supabase stand-in)
tests/contract/    One suite that every backend must pass
tests/e2e/         Playwright tests (E2E_BACKEND=memory|firebase|supabase)
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

## Payments

The server settings live in environment variables of the Cloud Functions
(`firebase/functions/.env.local` / `.secret.local` on the emulator) or in
Supabase function secrets (`supabase secrets set …`):

| Variable                    | Default                             | Meaning                                                            |
| --------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `PAYMENTS_MODE`             | `fake` locally                      | `fake` or `real`. Required when deployed                           |
| `FAKE_WEBHOOK_SECRET`       | a fixed dev secret                  | Fake mode, when deployed (16+ characters)                          |
| `RAZORPAY_KEY_ID`           |                                     | `rzp_test_…` (Dashboard → Test mode → API keys)                    |
| `RAZORPAY_KEY_SECRET`       |                                     | The key secret shown with it                                       |
| `RAZORPAY_WEBHOOK_SECRET`   |                                     | The secret you set on the test-mode webhook                        |
| `STRIPE_SECRET_KEY`         |                                     | `sk_test_…` (or a restricted `rk_test_…`)                          |
| `STRIPE_PUBLISHABLE_KEY`    |                                     | `pk_test_…`; sent to browsers, public by design                    |
| `STRIPE_WEBHOOK_SECRET`     |                                     | `whsec_…` of the webhook endpoint (or of `stripe listen`)          |
| `PAYMENTS_REGION_PROVIDERS` |                                     | Test mode only: e.g. `IN=stripe` to try Stripe on the India region |
| `PAYMENTS_LIVE`             | `false`                             | Live keys are refused unless `true` (production launch, phase 7)   |
| `DEMO_STEP_SECONDS`         | 45 (20 in `dev:firebase`, 4 in e2e) | Seconds per tracking step of the simulator                         |

**Which provider pays.** Each region names its provider (`regions.paymentProvider`):
Razorpay for India; Stripe for international regions (Stripe is invite-only
for new Indian businesses). In real mode either provider may be configured on
its own; an order in a region whose provider isn't configured is refused with
"Online payment isn't available in this area yet". Fake mode pays every region
with the fake provider and refuses to start if live keys are configured.

**Safety.** Real mode accepts only test keys unless `PAYMENTS_LIVE=true`, and
then only live keys, so the two never mix. Browsers only ever receive the
Razorpay key id, the Stripe publishable key and, for the order's owner, the
PaymentIntent's client secret.

**How an order gets paid**

- Razorpay: the server creates a Razorpay order for the server-priced total.
  Checkout's success handler output goes to `verifyRazorpayPayment` /
  `verify-razorpay`, which checks
  `HMAC_SHA256(order_id|payment_id, key secret)` against the Razorpay order id
  stored on our order, fetches the payment from Razorpay (capturing it if
  automatic capture is off) and places the order. The `payment.captured` /
  `order.paid` webhook does the same for customers who close the tab; whichever
  arrives second is a no-op.
- Stripe: the server creates a PaymentIntent (one per order, via an
  Idempotency-Key); the Payment Element confirms it in the browser, and the
  order is placed only by the verified `payment_intent.succeeded` webhook,
  using `amount_received`.
- A declined attempt marks the order "Payment failed"; paying again reuses the
  same Razorpay order / PaymentIntent.

**Webhook URLs** (test mode in each Dashboard):

- Firebase: `https://asia-south1-<project>.cloudfunctions.net/paymentWebhook?provider=razorpay`
  (and `?provider=stripe`)
- Supabase: `https://<ref>.supabase.co/functions/v1/payment-webhook?provider=razorpay`
  (and `?provider=stripe`)

Subscribe Razorpay to `payment.captured`, `payment.failed` and `order.paid`,
and Stripe to `payment_intent.succeeded` and `payment_intent.payment_failed`.
Set the Stripe endpoint's API version to `2026-09-30.endive` (what the server
sends, the version stripe-node 23 pins). Keep Razorpay's automatic capture on;
the browser path captures authorized payments itself, but the webhook path
waits for `payment.captured`.

When the site gets a Content-Security-Policy (phase 7), it must allow
`checkout.razorpay.com`, `api.razorpay.com` and the Razorpay frames, and
`js.stripe.com`, `api.stripe.com` and `hooks.stripe.com`.

The web app's banner follows `VITE_PAYMENTS_MODE`: `fake` (default, "Demo
mode"), `test` ("Test mode") or `live` (no banner).

### Checking your test keys against the real providers

The tests run fully offline: the gateways' HTTP calls go to simulators of the
Razorpay and Stripe APIs, and the signature checks are cross-checked against
the official `razorpay` and `stripe` Node libraries. To check the live part,
put your **test** keys in `.env.payments.local` (git-ignored) and run:

```bash
pnpm payments:check              # creates a ₹1 Razorpay test order and Stripe test payments
pnpm payments:check --browser    # + pay the Razorpay test order at http://localhost:8787;
                                 #   the real Checkout signature is verified by our code
pnpm payments:check --webhooks   # + verify real webhooks: `stripe listen --forward-to
                                 #   localhost:8787/webhooks/stripe`; Razorpay needs a tunnel
```

It refuses to run if any live key is present.

## Deploying the Supabase backend

1. Create a project, then link and push the schema:
   `supabase link --project-ref <ref>` and `supabase db push`.
2. Load the catalog: `SUPABASE_DB_URL=<connection string> pnpm seed:supabase --allow-production`.
3. Set the function secrets and deploy the functions:
   ```bash
   supabase secrets set PAYMENTS_MODE=fake FAKE_WEBHOOK_SECRET=<16+ random chars> CRON_SECRET=<16+ random chars>
   pnpm build:supabase && supabase functions deploy
   ```
   `payment-webhook` and `scheduled-jobs` are deployed without JWT verification
   (see `supabase/config.toml`); they check a webhook signature or `CRON_SECRET`.
   The customer functions also ask Supabase Auth who the caller is themselves,
   so they keep working if you switch to the new publishable keys and turn the
   gateway's JWT check off.
4. Let pg_cron call the simulator and expiry jobs every minute (SQL editor):
   ```sql
   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
   select vault.create_secret('<the same CRON_SECRET>', 'cron_secret');
   ```
5. Authentication → URL configuration: set the site URL and add
   `https://<your-site>/login/finish**` to the redirect URLs. Authentication →
   Email templates: use `supabase/templates/sign-in.html` for **Magic link** and
   **Confirm signup** (the app expects the code in the link's `#otp=` fragment).
6. Build the web app with `VITE_BACKEND=supabase`, `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (public by design; RLS decides what it can do).

The Edge Functions talk to Postgres directly (`SUPABASE_DB_URL`, as the table
owner) inside SERIALIZABLE transactions, running the same `packages/server`
order code as the Cloud Functions. Browsers can only read the catalog, active
coupons and their own rows, and write their own profile and addresses.
