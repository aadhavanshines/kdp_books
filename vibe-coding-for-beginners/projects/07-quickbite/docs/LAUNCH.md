# QuickBite launch checklist

Goal: QuickBite live at `https://<your-project>.web.app`, taking real Razorpay payments.
Do the steps in order and tick them off. Steps 1 to 9 use **test mode only**: no real money
moves until step 12.

What you need before you start: a Google account, a GitHub repository for this code, an Indian
business or sole-proprietor identity with a bank account (Razorpay's KYC), and Node 22 + pnpm
on your computer.

> The app is verified locally without any Firebase project: `pnpm test:hosting` runs the routes,
> headers, caching, the whole Firebase end-to-end suite and the payment stand-ins in a browser on
> the Firebase Hosting emulator with the real `firebase.json`. What it cannot prove is anything
> that needs your accounts (Razorpay's review, Secret Manager, the first deploy), so those are the
> steps below.

---

## Part A: before Razorpay will activate your account

### 1. Put your real business details on the site

Razorpay reviews your website and compares it with your KYC papers. Edit
`apps/web/src/config/business.ts` and replace every `[bracketed]` value: registered business
name, registered address, support email, support phone, grievance officer.

- [ ] `pnpm launch:check` prints "Business details are filled in."
- [ ] Read the six pages once (`pnpm dev`, then the footer links: About, Contact, Terms,
      Privacy, Refunds & cancellations, Shipping & delivery). They are written as a sensible
      starting draft, **not legal advice**: have a lawyer or your CA review them, and change
      anything that doesn't match how you really operate (refund timing, delivery areas, fees).
- [ ] The refund policy promises manual refunds from support. Refunds are **not automated** in
      this version: you issue them from the Razorpay dashboard (Transactions → the payment →
      Refund). Be ready to do that within the time the policy states.

### 2. Create the Firebase project

1. <https://console.firebase.google.com> → **Add project** → name it (the project id becomes the
   address, e.g. `quickbite-in` gives `https://quickbite-in.web.app`). Note the **project id**.
2. **Upgrade to the Blaze plan** (pay as you go). Cloud Functions and Secret Manager need it. It
   has a free allowance; set a budget alert in Google Cloud Billing (for example ₹500).
3. Build → **Firestore Database** → Create database → **production mode**, location
   `asia-south1` (Mumbai). Pick the same region for the functions (already set in the code).
4. Build → **Authentication** → Get started → Sign-in method → enable **Email link
   (passwordless)**. Settings → Authorized domains: `<project-id>.web.app` is there already; add
   your own domain later.
5. Build → **Storage** → Get started (the rules in `firebase/storage.rules` are deployed later).
6. Project settings → General → **Your apps** → add a **Web app**. Copy `apiKey` and `appId`
   from the config it shows (they are public identifiers, not secrets).
7. Build → **Hosting** → Get started (just click through; the deploy does the real work).

- [ ] Project id, web `apiKey` and `appId` written down

### 3. Put the project id in the repo

```bash
pnpm install
pnpm exec firebase login
pnpm exec firebase use --add     # choose your project, give it the alias "default"
```

This rewrites `.firebaserc`; commit it.

- [ ] `.firebaserc` points at your project (not `demo-quickbite`)

### 4. Connect GitHub (service account and variables)

The workflow `.github/workflows/deploy.yml` deploys previews and the live site.

1. Google Cloud console → IAM & Admin → **Service accounts** → Create, e.g.
   `github-deploy`. Give it these roles: **Firebase Admin**, **Cloud Functions Admin**,
   **Service Account User**, **Secret Manager Viewer**, **Cloud Scheduler Admin**,
   **Artifact Registry Writer**. Keys tab → Add key → JSON. (Firebase Admin alone is not enough
   for the first functions deploy.)
2. GitHub repository → Settings → Secrets and variables → Actions:
   - **Secret** `FIREBASE_SERVICE_ACCOUNT`: paste the whole JSON file. Then delete the file from
     your computer.
   - **Variables** `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_APP_ID` (from step 2).
   - **Variable** `PAYMENTS_LIVE` = `false` for now.
3. Settings → Environments → **New environment** named `production`. Add yourself as a required
   reviewer so every live deploy waits for your click.

Until the variables exist the workflow skips the deploy (with a warning) and CI still runs.

- [ ] Secret and four variables set; `production` environment created

### 5. Razorpay: create the account and get TEST keys

1. <https://dashboard.razorpay.com> → sign up and verify email and phone.
2. Stay in **Test mode** (toggle at the top). Account & Settings → **API Keys** → Generate Test
   Key. You get a **Key Id** (`rzp_test_…`) and a **Key Secret**: copy the secret now, it is shown
   once.
3. Submit your business details and KYC to get the account activated. Razorpay will ask for your
   website: use `https://<project-id>.web.app` (after step 7) and expect them to look at the
   six pages from step 1.

- [ ] Test Key Id and Key Secret in hand; KYC submitted

### 6. Put the secrets in Secret Manager

Secrets never go in the repo, GitHub or `.env` files. They live in Google Secret Manager and
Firebase attaches them to the functions that list them (`firebase/functions/src/secrets.ts`).

```bash
pnpm exec firebase functions:secrets:set RAZORPAY_KEY_ID          # paste rzp_test_…
pnpm exec firebase functions:secrets:set RAZORPAY_KEY_SECRET      # paste the key secret
pnpm exec firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET  # make one up: 20+ random chars
```

Keep the webhook secret handy: you paste the same value into Razorpay in step 8. A
password manager's generator is fine. The deploy fails fast if any of the three is missing.

- [ ] Three secrets created (`pnpm exec firebase functions:secrets:get RAZORPAY_KEY_ID` shows it exists)

### 7. First deploy (test mode)

Either push to `main` (the workflow runs, you approve the `production` environment), or from
your computer:

```bash
printf 'PAYMENTS_MODE=real\nPAYMENTS_LIVE=false\n' > firebase/functions/.env.<project-id>
VITE_BACKEND=firebase VITE_FIREBASE_PROJECT_ID=<project-id> VITE_FIREBASE_API_KEY=<key> \
VITE_FIREBASE_APP_ID=<appId> VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com \
VITE_FIREBASE_FUNCTIONS_VIA_HOSTING=true VITE_PAYMENTS_MODE=test pnpm build
pnpm exec firebase deploy --only functions,firestore,storage,hosting
```

Then load the regions, areas, restaurants, menus and coupons into Firestore. They are not part
of the deploy. Use a service-account key (a temporary download from step 4's account, kept
outside the repo and deleted afterwards). The script refuses a real project unless you say so:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json GCLOUD_PROJECT=<project-id> \
  pnpm exec tsx packages/seed/scripts/load-firestore.ts --allow-production
```

- [ ] `https://<project-id>.web.app` opens, shows the "Test mode" banner and restaurants
- [ ] Footer pages open: `/about /contact /terms /privacy /refunds /shipping`
- [ ] Reload `https://<project-id>.web.app/orders/x` (a deep link): the app opens, not a 404

### 8. Razorpay webhook

Razorpay → Account & Settings → **Webhooks** → Add new webhook (in Test mode):

- URL: `https://<project-id>.web.app/webhooks/razorpay`
- Secret: the `RAZORPAY_WEBHOOK_SECRET` from step 6
- Events: `payment.captured`, `payment.failed`, `order.paid`

- [ ] Webhook saved and "Active"

### 9. Test a real test-mode payment

On the live address: sign in (the email link arrives by email: check spam), add dishes, add an
address, **Proceed to pay**. Use Razorpay's [test card and UPI details](https://razorpay.com/docs/payments/payments/test-card-details/)
(e.g. UPI `success@razorpay`).

- [ ] The order goes to "Order placed" and the amount matches
- [ ] Razorpay dashboard (Test mode) shows the payment as Captured and the webhook delivery as 200
- [ ] A failed payment shows the reason and lets you pay again
- [ ] Browser dev tools → Console shows **no** "Content Security Policy" errors on the checkout

If a payment method fails to open and the console reports a blocked address, add that address to
the matching directive in `firebase.json`, run `pnpm test:hosting` and deploy again. Razorpay
Checkout may need hosts beyond the ones listed if you enable extra methods (wallets, EMI).

---

## Part B: going live

Do these only after Razorpay has activated your account (live keys are available once KYC passes).

### 10. Live keys and webhook

1. Razorpay → switch to **Live mode** → API Keys → Generate Live Key (`rzp_live_…`).
2. Add a second webhook in Live mode: same URL, a **new** secret, same events.
3. Replace the three secrets (this creates new versions):

```bash
pnpm exec firebase functions:secrets:set RAZORPAY_KEY_ID          # rzp_live_…
pnpm exec firebase functions:secrets:set RAZORPAY_KEY_SECRET
pnpm exec firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET  # the live webhook's secret
```

The server refuses live keys unless `PAYMENTS_LIVE=true`, and refuses test keys once it is, so a
mix-up fails loudly instead of charging the wrong way.

- [ ] Live key id starts `rzp_live_`; live webhook active

### 11. Before flipping the switch

- [ ] `pnpm launch:check` passes (real business details)
- [ ] Menus, prices, restaurant names and images in Firestore are real. The seed data is a demo
      (fictional restaurants). Replace them or you are selling food that doesn't exist.
- [ ] **Order fulfilment is a demo simulator**: `advanceDemoOrders` moves any paid order through
      "accepted → preparing → delivered" on a timer. There is no restaurant or rider app yet. Do
      not take real money until a real process (restaurants receiving orders, delivery) exists and
      the simulator is switched off (delete `advanceDemoOrders` from `firebase/functions/src/index.ts`).
- [ ] Decide who handles refunds and support mail daily, per your own policies
- [ ] Firestore → Usage and Billing: budget alert set
- [ ] Authentication → Settings → **User actions**: leave "Email enumeration protection" on

### 12. Flip to live

1. GitHub → Settings → Variables: `PAYMENTS_LIVE` = `true`.
2. Push any commit to `main` (or re-run the Deploy workflow) and approve the `production`
   environment. The workflow sets `PAYMENTS_LIVE=true` on the functions and removes the "Test
   mode" banner.
3. Place one real order for a small amount (Razorpay minimum ₹1) with your own card or UPI,
   check it in the Razorpay dashboard, then refund it from there.

- [ ] Real ₹ order paid, webhook 200, order placed, refund issued from the dashboard

### 13. After launch

- [ ] Add a custom domain: Firebase console → Hosting → Add custom domain. Add it to
      Authentication → Authorized domains, change the URLs in the Razorpay webhook and on the
      Razorpay website field.
- [ ] Watch Cloud Functions logs (Firebase console → Functions → Logs) for "Rejected webhook".
- [ ] Rotate secrets if anyone who had them leaves: `firebase functions:secrets:set …` then redeploy.

---

## How pull request previews work

Opening a pull request publishes `https://<project-id>--pr<number>-<branch>-<hash>.web.app`, linked
in a PR comment, for 7 days. Each new push updates the same link.

- A preview is the **same Firebase project's backend**: it uses the same functions and database,
  and (because it is built with the test banner) shows "Test mode". While you are in test mode
  that is fine. Once the live site takes real money, a preview could place a real order. Either
  create a second Firebase project, `quickbite-staging`, with its own test keys and set the
  repository variables `PREVIEW_FIREBASE_PROJECT_ID`, `PREVIEW_FIREBASE_API_KEY`,
  `PREVIEW_FIREBASE_APP_ID` and the secret `PREVIEW_FIREBASE_SERVICE_ACCOUNT` (the workflow
  uses them for previews automatically), or turn previews off.
- Sign-in links from a preview address need that address in Authentication → Authorized domains.
  Authorized domains do not accept wildcards, so test sign-in on the live address, or add
  that one preview domain by hand.
- Pull requests from forks get no preview (they have no access to your secrets).

## What is configured where

| Thing                                                               | Where                                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Routing, `/api/*` and `/webhooks/*` rewrites, headers, CSP, caching | `firebase.json` → `hosting`                                                           |
| Razorpay keys and webhook secret                                    | Google Secret Manager, named in `firebase/functions/src/secrets.ts`                   |
| `PAYMENTS_MODE`, `PAYMENTS_LIVE`                                    | written by the deploy workflow into `firebase/functions/.env.<project>` (not secrets) |
| Firebase web config (`apiKey`, `appId`)                             | GitHub Actions variables (public identifiers)                                         |
| Business name, address, contact                                     | `apps/web/src/config/business.ts`                                                     |
| Service account key                                                 | GitHub secret `FIREBASE_SERVICE_ACCOUNT` only                                         |

### Reading the Content-Security-Policy

`firebase.json` allows scripts only from this site, `checkout.razorpay.com` and `js.stripe.com`;
frames only from Razorpay and Stripe; network calls only to this site (functions are reached at
`/api/…`), Firebase Auth and Firestore, and Razorpay and Stripe's APIs. No `eval`, no inline
scripts, no framing of the site. Images: this site plus the single address `https://www.google.com/images/cleardot.gif`, which Firestore's connection pings after a channel error. `style-src` keeps `'unsafe-inline'` because Razorpay Checkout
and Stripe inject inline styles into the page; scripts stay strict. Stripe's hosts are included
for the planned international launch and are unused until Stripe is switched on. Use the
Supabase backend instead and you must add its project URL to `connect-src`.

### Known limits

- A stale browser tab asking for a JavaScript file from an older deploy gets the app page
  instead of a 404 (single-page-app fallback); a refresh fixes it.
- `/api/fakePay` is routed but answers "Test payments are turned off" in real mode.
- Firebase App Check (bot protection for the callables) is not enabled; it needs the reCAPTCHA
  script added to the CSP. Consider it before heavy traffic.
- Refunds, restaurant and rider apps, and cash on delivery are out of scope (docs/PLAN.md).
