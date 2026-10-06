# QuickBite: Build Plan

## Context

The repository is empty (one "Empty project" commit), so this is a greenfield build.
The goal is a production-quality food delivery web app that looks and feels like
Swiggy or Zomato. It launches in India (₹, Razorpay) and is built so it can expand to other
countries later (other currencies, Stripe). There are two interchangeable backends
(Supabase or Firebase), chosen by one environment variable. Payments must be
server-authoritative and signature-verified. The site is hosted on Firebase Hosting (`*.web.app`),
and everything must run and be tested locally with no real accounts.

Each choice below has a short **Why** written for a beginner.

---

## 1. Architecture

```
                         ┌──────────────────────────────────────────┐
  Browser (React SPA)    │ apps/web                                 │
  served by Firebase ───►│  UI ─► features ─► Backend interface     │
  Hosting (web.app)      │                     │ (chosen by          │
                         │                     │  VITE_BACKEND)      │
                         └─────────────────────┼────────────────────┘
                     ┌─────────────────────────┴───────────────────────┐
                     ▼                                                 ▼
          Firebase adapter                                  Supabase adapter
   Auth · Firestore (read, realtime)                Auth · Postgres via RLS · Realtime
   Callable Cloud Functions ──┐                      Edge Functions ──┐
                              ▼                                       ▼
                    ┌───────────────────────────────────────────────────────┐
                    │ packages/server (written once, used by both):          │
                    │  OrderService: quote, create, confirm payment          │
                    │  PaymentGateway: Razorpay | Stripe | Fake              │
                    │  uses packages/core: money, pricing, coupons, statuses │
                    └───────────────────────────────────────────────────────┘
                              ▲                                       ▲
              Razorpay / Stripe webhooks ─────────────────────────────┘
```

**Key ideas**

1. **The browser can only read public data and its own data.** It never writes orders,
   prices or payment status. Those writes happen only in server code (Cloud Functions or
   Supabase Edge Functions).
   *Why:* anything running in the browser can be changed by the user, so it can't be trusted
   with money.
2. **There is one `Backend` interface with two adapters.** Pages talk to a TypeScript
   interface (`apps/web/src/backend/types.ts`). `VITE_BACKEND=firebase|supabase` picks the
   adapter at build time through a dynamic `import()`, so only one SDK ends up in the bundle.
   *Why:* the UI code never needs to know which backend is running.
3. **Business logic is written once.** Pricing, coupon rules and the order status machine
   live in `packages/core`, which is pure TypeScript with no dependencies. The order and
   payment workflow lives in `packages/server`. Firebase and Supabase each provide only a
   small "store" adapter: Firestore transactions on one side, Postgres functions on the other.
   *Why:* with one copy of the logic, the bill can't differ between the two backends.
4. **The server code uses only web-standard APIs** (`fetch`, `crypto.subtle`). It
   therefore runs unchanged on Node (Cloud Functions) and Deno (Supabase Edge Functions).
   For Supabase, `packages/server` is bundled into `supabase/functions/_shared/` with esbuild.
5. **A third, in-memory adapter (`memory`)** serves seed JSON. It is used for component
   tests, and it lets the UI run in the first phases before any backend exists. It is never
   allowed in a production build.

**Main libraries**

| Library | What it does | Why this one |
|---|---|---|
| React + TypeScript + Vite | UI framework, type checking, build tool | Required by the brief; fast to develop with |
| Tailwind CSS v4 | Styling | Design tokens are defined once in CSS (`@theme`) |
| React Router | Page routing | The standard choice for React |
| TanStack Query | Server data | Handles caching, loading and error states |
| Zustand (persisted) | Cart state | Small and simple; the cart survives a page refresh |
| Zod | Input validation | The same schemas validate data in the browser and on the server |
| Radix UI primitives | Dialogs, sheets, tabs | Keyboard and screen-reader accessibility come built in |
| react-hook-form | Forms | Used for the address and sign-in forms |

**Out of scope for v1** (assumptions; tell me if any are wrong):

- Restaurant, rider and admin apps. Order status is advanced by a **demo simulator**.
- Cash on delivery and refunds.
- Writing reviews. Ratings are seeded.
- Map pin-drop. Customers pick an area from a list, or use "Use my location" to find the
  nearest area.
- Ordering from more than one restaurant at a time. Like Swiggy, the cart holds one
  restaurant, and adding a dish from another one asks "Replace cart?".

---

## 2. Data model

**Money:** always stored as an **integer in minor units** (paise), together with a currency code.
For example, ₹249.00 is stored as `{ amount: 24900, currency: "INR" }`.
*Why:* decimals like 0.1 + 0.2 give rounding errors. Integers don't. This is also the format
Razorpay and Stripe use. Numbers are formatted with `Intl.NumberFormat(locale, {currency})`.

| Entity | Key fields | Notes |
|---|---|---|
| **regions** | id (`IN`), currency, locale, timezone, paymentProvider, taxRules (bps), platformFee, deliveryFeeBands | Enables international launch later |
| **areas** | id, name, city, regionId, lat, lng | "Koramangala, Bengaluru" |
| **restaurants** | id, slug, name, imageUrl, cuisines[], rating, ratingCount, costForTwo, deliveryTimeMin/Max, isPureVeg, isOpen, areaIds[], lat, lng, regionId, offerBadge | Card data |
| **menu_categories** | id, restaurantId, name, sortOrder | |
| **menu_items** | id, restaurantId, categoryId, name, description, price, isVeg, imageUrl, isAvailable, isBestseller, searchTokens[] | |
| **coupons** | code, title, type (`percent`/`flat`/`free_delivery`), value, maxDiscount, minOrder, restaurantId?, regionId, validFrom/To, perUserLimit, active | Private. A public view exposes only display fields |
| **profiles** | userId, name, phone, createdAt | |
| **addresses** | id, userId, label (Home/Work/Other), line1, line2, landmark, areaId, pincode, lat, lng, isDefault | |
| **orders** | id, userId, restaurantId, status, statusHistory[], items snapshot, address snapshot, bill {itemTotal, discount, deliveryFee, platformFee, taxes{food, fees}, grandTotal}, currency, couponCode, paymentProvider, paymentStatus, providerOrderId, idempotencyKey, createdAt | Stores **snapshots** of items and address, so later menu edits don't change past orders |
| **order_items** (Postgres only) | orderId, menuItemId, name, unitPrice, qty, isVeg, lineTotal | Embedded array in Firestore |
| **payments** | id, orderId, provider, providerPaymentId, amount, status, rawEventId | Server-only |
| **webhook_events** | provider + eventId (unique), receivedAt | Server-only. Prevents processing the same webhook twice |
| **coupon_redemptions** | userId, couponCode, orderId | Server-only. Enforces per-user limits |

**How the model maps to each backend**
- **Postgres (Supabase):** one table per entity, foreign keys, `check` constraints
  (`qty between 1 and 20`, `amount >= 0`), and `pg_trgm` indexes for search.
- **Firestore:**
  - Public catalog: `regions/{id}`, `areas/{id}`, `restaurants/{id}`,
    `restaurants/{id}/categories/{id}`, `restaurants/{id}/menuItems/{id}`.
  - User data: `users/{uid}`, `users/{uid}/addresses/{id}`, `orders/{id}`.
  - Server-only: `coupons/{code}`, `publicCoupons/{code}`, `payments/{id}`, `webhookEvents/{id}`.

**Order statuses** (a state machine in `packages/core`; any other transition is rejected):
`pending_payment → placed → accepted → preparing → out_for_delivery → delivered`,
plus `payment_failed`, `expired` (unpaid for 30 minutes) and `cancelled`.

**Browsing and search strategy:** one area has tens to a few hundred restaurants.
`listRestaurants(areaId)` returns lightweight card data once, and the filter chips and sorting
run instantly in the browser with a tested pure function. The UX is snappy, as in Swiggy.
Dish search works like this on each backend:
- **Supabase:** a SQL function with trigram matching.
- **Firebase:** a `collectionGroup('menuItems')` query on `searchTokens`, then filtering to the
  area's restaurants.

The upgrade path at scale is Typesense or Algolia, behind the same interface.

---

## 3. Bill calculation (`packages/core/pricing.ts`)

All amounts are integers. Tax rates are stored in **basis points** (500 = 5%) and each
tax line rounds half-up.

1. `itemTotal` = Σ(unitPrice × qty), using prices **read from the database by the server**
2. `discount` = coupon result, capped by `maxDiscount` and never more than `itemTotal`
3. `deliveryFee` = distance band from restaurant to address (0–3 km ₹25, 3–6 km ₹40,
   6–8 km ₹55, over 8 km not deliverable). It is zero with a free-delivery coupon.
4. `platformFee` = from the region (for example ₹5)
5. `foodTax` = 5% GST × (itemTotal − discount)
6. `feeTax` = 18% GST × (deliveryFee + platformFee)
7. `grandTotal` = sum of the above (minimum ₹1, Razorpay's minimum)

The GST rates are configurable defaults; confirm them with an accountant before going live.
The UI shows a "Taxes & charges ⓘ" line with this breakdown.

---

## 4. Security rules

**Principle: deny by default, then open only what each role needs.**

| Data | Anyone (signed out) | Signed-in owner | Server code only |
|---|---|---|---|
| regions, areas, restaurants, menus, public coupons | read | read | write |
| profile, addresses | – | read and write own (validated fields only) | – |
| orders, order_items | – | **read** own | create and update |
| coupons (private), payments, webhook events, redemptions | – | – | all |

**How each backend enforces the table**

- **Supabase (RLS):**
  - RLS is enabled on every table.
  - Catalog tables have a `select` policy for `anon` and `authenticated`.
  - `profiles` and `addresses` use `user_id = auth.uid()` for all operations. Column grants
    stop a user from changing `user_id`.
  - `orders` and `order_items` have a `select` policy only (own rows), with no
    insert or update policy.
  - Private tables have **no policies at all**, so only the `service_role` key, which exists
    only inside Edge Functions, can touch them.
  - Critical writes run in `SECURITY DEFINER` SQL functions (`create_order`, `mark_order_paid`)
    with `execute` granted only to `service_role`, so they happen atomically in one
    transaction.
  - Realtime on `orders` respects RLS, so users only receive events for their own orders.
- **Firestore rules:**
  - `restaurants/**`, `areas`, `regions` and `publicCoupons`: `read: if true; write: if false`.
  - `users/{uid}/**`: read and write only `if request.auth.uid == uid`, with
    `keys().hasOnly([...])` and type checks.
  - `orders/{id}`: `read: if resource.data.userId == request.auth.uid; write: if false`.
  - Everything else is denied. Cloud Functions use the Admin SDK, which bypasses rules on
    purpose.
- **Storage rules:** images are public to read. Clients can't write; images are uploaded by the
  seed script and admin tools.

**Other security measures**
- Zod validation runs on every server input.
- Each user can create at most 10 orders per minute.
- Firebase App Check is turned on in production.
- `firebase.json` sets security headers: a CSP that allows only Razorpay, Stripe and
  the chosen backend, plus HSTS and `X-Frame-Options`.
- `.env*` and `.secret.local` are in `.gitignore`.

---

## 5. Payment flow

**Golden rules**
- The browser sends only `{restaurantId, items:[{itemId, qty}], addressId, couponCode,
  idempotencyKey}`. It **never sends a price**.
- The server sets the amount on the provider order.
- An order becomes `paid`/`placed` **only** after a signature check *and* an amount and currency
  match.

```
Browser                Server (createOrder)              Provider
  │ cart ids+qty ───────►│ validate, load prices,          │
  │                      │ priceOrder(), save order        │
  │                      │ status=pending_payment ────────►│ create order/intent(amount)
  │◄──── {orderId, providerOrderId | clientSecret, publicKey}│
  │ opens Razorpay Checkout / Stripe Payment Element ──────►│ customer pays (UPI/card)
  │                                                          │
  │ Razorpay: {payment_id, order_id, signature} ─► verifyRazorpayPayment
  │                      │ HMAC_SHA256(order_id|payment_id, KEY_SECRET) == signature?
  │                      │ fetch payment: captured & amount == order.total?
  │                      │ markOrderPaid() in a transaction (idempotent)
  │                                                          │
  │                      │◄──── webhook (payment.captured / payment_intent.succeeded)
  │                      │ verify X-Razorpay-Signature / Stripe-Signature on RAW body
  │                      │ skip if eventId already processed → markOrderPaid()
  │ realtime listener sees status "placed" → tracking page
```

**Razorpay (India: UPI, cards, netbanking)**
- Uses Checkout.js. The immediate check is the **payment signature** from the success handler.
- The **webhook** is a safety net for customers who close the tab after paying.

**Stripe (international cards)**
- Uses a PaymentIntent and the Payment Element.
- The order is marked paid **only from the verified `payment_intent.succeeded` webhook**,
  which also checks `amount_received` and `currency`.
- The return page shows "Confirming payment…" until realtime reports `placed`.

**Fake mode (`PAYMENTS_MODE=fake`)**
- Used for local development, tests and an optional public demo. Checkout opens a
  QuickBite "Test payment" sheet with Success and Fail buttons.
- The `fakePay` endpoint acts as the *provider*: it signs a webhook body with
  `FAKE_WEBHOOK_SECRET` and sends it to the real webhook handler. The same verification and
  idempotency code is therefore exercised every time.
- The server refuses fake mode if live keys are configured.
- A "Demo mode — no real money" banner is shown while fake mode is on.

**markOrderPaid (a single transaction)**
1. Order exists and is in `pending_payment` (or is already paid, in which case return OK).
2. Provider amount and currency equal the order's `grandTotal` and currency.
3. Insert the payment row and the webhook event id (the unique constraint makes repeats no-ops).
4. Record the coupon redemption.
5. Set `status=placed` and append to `statusHistory`.

A payment that arrives for an `expired` order is accepted and flagged `needs_review`.

**Secrets:** the Razorpay key secret and webhook secret, and the Stripe secret key and webhook
secret, live in **Firebase Secret Manager** (`defineSecret`) or **Supabase function secrets**.
The browser only gets the Razorpay `key_id` and the Stripe publishable key, which are public
by design.

**Idempotency:** the client generates one `idempotencyKey` per checkout attempt. If the
same key is sent again, the server returns the same order instead of creating a duplicate.

---

## 6. Order status updates

- The tracking page subscribes through `backend.orders.watch(id, cb)`. This uses Firestore
  `onSnapshot` on Firebase and Supabase Realtime on Supabase.
- **Demo simulator:** a scheduled job advances paid orders one step every N seconds
  (`DEMO_STEP_SECONDS`, default 45; 5 in tests). It runs as a Cloud Scheduler function on
  Firebase and a `pg_cron` job on Supabase.
- Locally, `pnpm sim` runs the same `advanceDemoOrders()` in a loop, because the
  emulator doesn't fire schedules on its own.
- A cleanup job marks `pending_payment` orders older than 30 minutes as `expired`.

---

## 7. Folder structure (pnpm workspace monorepo)

```
quickbite/
├─ apps/web/                     React app
│  ├─ src/
│  │  ├─ app/                    router, providers, layout shell, error boundary
│  │  ├─ routes/                 Home, Search, Restaurant, Cart, Checkout, Orders,
│  │  │                          OrderTracking, Account, Login, AuthCallback, NotFound
│  │  ├─ features/               auth/ location/ restaurants/ menu/ cart/ checkout/
│  │  │                          orders/ account/ (hooks + feature components)
│  │  ├─ components/ui/          design-system primitives (Button, Sheet, VegMark…)
│  │  ├─ backend/                types.ts, index.ts (selector), firebase/, supabase/, memory/
│  │  ├─ lib/                    money format, i18n, analytics, env (validated with zod)
│  │  └─ styles/                 tokens.css (Tailwind @theme), globals.css
│  ├─ public/images/seed/        optimized WebP photos (licensed, credits in seed/CREDITS.md)
│  └─ vite.config.ts, index.html
├─ packages/
│  ├─ core/                      money, pricing, coupons, orderStatus, filters, zod schemas
│  └─ server/                    OrderService, PaymentGateway (razorpay/stripe/fake), OrderStore interface
├─ firebase/
│  ├─ functions/                 callables + webhooks + schedules, FirestoreOrderStore
│  ├─ firestore.rules, firestore.indexes.json, storage.rules
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/                schema, RLS, SQL functions, cron
│  └─ functions/                 create-order, quote-order, verify-razorpay,
│                                razorpay-webhook, stripe-webhook, fake-pay, _shared/
├─ seed/                         areas, restaurants, menus, coupons (JSON) + loaders for both
├─ tests/
│  ├─ contract/                  one suite, runs against BOTH backends
│  ├─ rules/                     Firestore rules + Supabase RLS tests
│  └─ e2e/                       Playwright (mobile + desktop)
├─ docs/                         setup guide, architecture, runbook, deploy
├─ firebase.json, .firebaserc (project "demo-quickbite" locally)
├─ pnpm-workspace.yaml, .env.example, .github/workflows/ci.yml
```

---

## 8. Design system

**Feel:** clean, fast and food-first, with big photos, confident type, and small
delightful touches.

**Tokens** (in `styles/tokens.css` via Tailwind `@theme`, ready for dark mode):
- **Brand:** QuickBite "chili" orange-red (around `#F2542D`), with tints and shades 50–900.
- **Semantic colors:**
  - Veg green `#0F8A43` and non-veg brown-red `#963A2F`, used in the standard Indian
    square markers (dot for veg, triangle for non-veg).
  - Rating colors: green for 4.0+, amber for 3.x, red below 3.
  - Offer blue and success/warning/danger colors.
- **Neutrals:** stone gray scale. Text must meet WCAG AA contrast.
- **Type:** "Plus Jakarta Sans" for UI, with tabular numbers for prices, self-hosted via
  Fontsource. The scale is 12/14/16/18/20/24/32.
- **Spacing and shape:** 4px spacing grid. Corner radius 8 (chips), 12 (inputs), 16–20
  (cards and sheets). Two soft shadow levels.
- **Motion:** 150–250 ms ease-out, and `prefers-reduced-motion` is respected.

**Components** (`components/ui`):
- **Basics:** Button (primary, secondary, ghost; sm/md/lg), IconButton, Badge, Chip and
  FilterChip, Input and OTPInput, Tabs, Skeleton, Toast, EmptyState.
- **Containers:** BottomSheet on mobile and Modal on desktop (the same API), Drawer.
- **Food-specific:** RatingPill, VegMark, Price, OfferRibbon, ADD→stepper button
  ("ADD" turns into "– 2 +"), StickyCartBar, StatusTimeline, Carousel.

**Signature screens** (patterns borrowed from the apps people know):
- **Header:** location selector ("Home ▾ Koramangala, Bengaluru"), search, cart and account.
- **Home:**
  - Offers carousel and a "What's on your mind?" row of cuisines.
  - A sticky row of filter chips: Rating 4.0+, Pure Veg, Fast Delivery, Offers, sort.
  - Restaurant cards with a photo, a gradient offer ribbon ("50% OFF UPTO ₹100"), a rating
    pill, "25–30 mins", cuisines and "₹400 for two". Closed restaurants appear greyed out.
- **Restaurant page:**
  - A header card with rating, time, cost for two and offer chips.
  - A "Veg only" toggle and a menu search.
  - A collapsible category list, and a floating "MENU" button that opens a category jump list.
  - Dish rows with the VegMark, price, description and a photo with an overlapping ADD button.
- **Cart:**
  - On mobile, a sticky "2 items | ₹498 — View Cart" bar.
  - On desktop, a cart panel on the right of the menu.
- **Checkout:**
  - Address cards plus an "Add new address" sheet.
  - Apply coupon, with a list of available coupons and the reason one doesn't apply.
  - Bill details with a taxes tooltip, then "To Pay ₹X" and a sticky Pay button.
- **Order tracking:** a live status timeline with times, ETA, an items summary and the bill.

**Responsive:** designed mobile-first at 360px. Breakpoints are `sm 640 / md 768 / lg 1024 / xl 1280`.
The container is at most 1200px. Restaurant cards show 1 column on phones, then 2, 3 and 4 on
desktop.

**Quality bars**
- Skeleton loaders everywhere; no layout shift.
- Images are lazy-loaded WebP with a width and height set.
- Touch targets are at least 44px.
- Full keyboard support and visible focus rings.
- All text goes through a tiny i18n layer (`en-IN` first), ready for new locales.

---

## 9. Testing approach (all of it runs locally with no accounts)

| Level | Tool | What it covers |
|---|---|---|
| Unit | Vitest + fast-check | Pricing (rounding, caps, coupons, property tests such as "total ≥ ₹1, discount ≤ itemTotal"), status machine, filters, money formatting |
| Server | Vitest | `OrderService` with an in-memory store and the fake gateway; Razorpay and Stripe signature checks (good, bad and tampered); idempotency; amount mismatch rejected |
| Security rules | `@firebase/rules-unit-testing` (Firestore emulator); Vitest + supabase-js as anon, user A and user B (local Supabase) | Users can't read others' orders, write orders, change prices, read private coupons or payments |
| Contract | One Vitest suite × 2 backends | Every `Backend` method behaves the same on Firebase and Supabase |
| Component | Vitest + React Testing Library + `memory` backend | ADD/stepper, cart replace prompt, filter chips, bill display, forms |
| End-to-end | Playwright (Pixel 7 + Desktop Chrome) × both backends | Sign in (magic link read from the Auth emulator or Mailpit API) → pick area → filter → add dishes → coupon → fake pay → watch "placed" → "delivered" |
| Accessibility and performance | `@axe-core/playwright`, Lighthouse CI | No serious axe violations; mobile performance score of at least 90 |

**What you install locally:** Node 22 LTS, pnpm, Java 21 (for the Firebase emulators), and
Docker (only for the Supabase backend).

**One-command scripts:**
- `pnpm dev:firebase`: emulators, seed, functions, web app and the order simulator.
- `pnpm dev:supabase`: `supabase start`, migrations and seed, edge functions and the web app.
- `pnpm test`, `pnpm test:rules`, `pnpm test:contract`, `pnpm test:e2e`.

Firebase uses the `demo-quickbite` project ID, which needs no real project. `supabase start`
needs no login.

**CI (GitHub Actions):** lint, typecheck, unit, rules, contract (backend matrix), e2e
(backend matrix) and build.

---

## 10. Build phases (every phase ends with a working, tested app)

| # | Phase | What works at the end |
|---|---|---|
| **0** | **Foundations:** monorepo, Vite + React + TS + Tailwind v4, ESLint and Prettier, Vitest, Playwright, CI, design tokens, app shell and routes, `memory` backend with seed JSON | `pnpm dev` shows the QuickBite shell with real-looking data; CI is green |
| **1** | **Browse:** design-system components, area picker, home feed (carousel, cuisines, filter chips, cards), search (restaurants and dishes), restaurant menu page, skeletons and empty states | You can browse everything on phone and desktop |
| **2** | **Cart and bill:** `packages/core` pricing, coupons and money (fully unit-tested); persisted cart store; stepper; replace-cart prompt; sticky cart bar or desktop panel; checkout UI with bill preview (memory backend) | The full shopping flow works up to "Pay" |
| **3** | **Firebase backend, part 1:** emulators, seed loader, Firestore and Storage rules with tests, email-link sign-in, profile and addresses, catalog adapter, contract tests (catalog, profile) | Real sign-in and data via emulators; `VITE_BACKEND=firebase` |
| **4** | **Server orders and fake payments (Firebase):** `packages/server` OrderService, callables (`quoteOrder`, `createOrder`), `fakePay` and signed webhook handler, `markOrderPaid` transaction, live tracking page, order history, simulator and expiry jobs | **The complete app works end-to-end locally**, with E2E passing |
| **5** | **Supabase backend:** migrations, RLS and SQL functions, Edge Functions reusing `packages/server`, email OTP and magic link, Realtime, seed; RLS tests; contract and E2E suites green for **both** backends | Switch with `VITE_BACKEND=supabase`; everything behaves identically |
| **6** | **Real payments (test mode):** Razorpay Checkout + signature verify + webhook; Stripe Payment Element + webhook; provider chosen by region; payment failure and retry UX | Real UPI and card test payments, with fake mode still the default for tests |
| **7** | **Production launch:** Firebase Hosting deploy (`quickbite-xxx.web.app`), secrets, security headers and CSP, App Check, rate limits, Sentry, performance and accessibility pass, SEO meta, deploy guide and runbook | A live, hardened app on web.app |
| **8** | **International (later):** a second region (for example the UK, with GBP and Stripe), translated strings, region-based taxes and fees | Same codebase, new country |

---

## 11. Things you'll need later (not for local development)

- **Firebase:** Cloud Functions need the **Blaze (pay-as-you-go) plan**, because they call
  Razorpay and Stripe. It has a free monthly allowance, and you can set a budget alert.
- **Razorpay:** test mode is free. Live mode needs business KYC.
- **Stripe:** test mode is free.
- **Supabase:** the free tier is fine to start with.
- **Before taking real money in India:**
  - FSSAI details shown for each restaurant.
  - GST invoices.
  - A privacy policy that meets India's DPDP Act, and a delete-my-account flow.

---

## Verification (how we'll know it works)

1. `pnpm install && pnpm dev:firebase` opens `localhost:5173`. Sign in through the
   emulator's magic link, order with coupon `WELCOME50`, pay with the fake provider, and
   watch the status reach "delivered".
2. `pnpm dev:supabase` runs the same journey with the Supabase backend.
3. `pnpm test && pnpm test:rules && pnpm test:contract && pnpm test:e2e` passes for both backends.
4. Security spot checks (automated in the rules tests), each of which must be rejected:
   - Writing an order directly from the browser console.
   - Reading another user's order.
   - Sending a webhook with a bad signature.
   - Sending a webhook whose amount differs from the order total.
5. Lighthouse mobile performance is at least 90, and axe reports no serious issues, on Home,
   Restaurant and Checkout.
