Read CLAUDE.md, docs/PRD.md and docs/DESIGN.md, and look at what the
previous session built in packages/core, packages/ui and apps/billora
(and its screenshots). This session completes the shared foundation.

1. Billing in packages/core:
   - Plan definitions per product (Free, Pro, Business; monthly and yearly
     prices in paise; limits as typed entitlements) for all four products
     from the PRD, and helpers to check a limit and record usage.
   - A provider interface with three implementations: Razorpay (orders for
     one-time payments, plans and subscriptions), Stripe (Checkout and
     subscriptions), and a fake provider used whenever keys are missing.
     The fake provider has its own hosted-checkout page in the app where
     you can choose "pay", "fail" or "cancel", and it sends webhooks signed
     with HMAC-SHA256 exactly like Razorpay's scheme, so the real
     verification code runs.
   - Webhook route handlers that verify signatures over the raw body,
     store every event id and process each exactly once, and move
     subscriptions through active, past due (with a grace period), then
     downgraded to Free, plus upgrades, downgrades and cancellation at the
     period end. The provider is chosen by the workspace's billing
     country: Razorpay for India, Stripe elsewhere.
   - A billing settings page in Billora: current plan, usage meters
     against limits, next renewal, change plan, cancel, past invoices
     (the workspace's own subscription invoices, with GST for Indian
     workspaces), and an upgrade prompt component the products can show
     when a limit is reached.
   - Tests for signature verification (good, tampered, replayed), the
     subscription state machine, entitlements, and idempotency.

2. Email: React Email templates in the brand style for verification,
   magic link, invitation, password reset, payment receipt and plan
   changes; a sender that drains the outbox through Resend when
   RESEND_API_KEY is set, and otherwise keeps them for /dev/mail; retries
   with backoff. A test that nothing is sent without a key.

3. Admin and audit: a protected /admin (emails listed in ADMIN_EMAILS)
   with users, workspaces, subscriptions and the audit log, read-only, no
   impersonation. Record audit events for sign-in, role changes, plan
   changes, deletions and exports.

4. Security basics: rate limits (in the database, so they work across
   instances) on sign-in, sign-up, magic links and password reset;
   security headers (CSP suitable for Next.js, HSTS, frame-ancestors,
   referrer policy) via next.config or proxy.ts; and delete-account and
   delete-workspace flows with confirmation.

5. Marketing for Billora: a landing page and pricing page from
   docs/DESIGN.md (hero with a real screenshot of the app, features,
   fictional testimonials clearly marked as examples, pricing table built
   from the plan definitions, FAQ, final call to action), and legal pages
   (terms, privacy, refund and cancellation policy, contact) with
   placeholder business details clearly marked "replace before launch".

6. Finish what the previous session left: the team-size limit from the
   plan, the sidebar's plan badge and usage meter from real data, logo
   upload (stored locally in development behind a small storage
   interface), sorting and pagination in the data table, and a light and
   dark theme toggle.

Verify visually at 1440x900 and 390x844 in headless Chromium: every new
screen, the fake checkout with a successful and a failed payment, the
billing page after an upgrade, the landing and pricing pages. Fix anything
unpolished. Save screenshots to apps/billora/screenshots/ continuing the
numbering. Finish with typecheck, lint and tests passing for the whole
workspace and a summary, including anything in the providers' rules you
are unsure about. Keep it to one session of about an hour and a half.
