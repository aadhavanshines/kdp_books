# Product Requirements: Four SaaS Products on One Foundation

All four products are original, fictional businesses built for the book
*Vibe Coding a SaaS*. They share one foundation (accounts, workspaces, teams,
billing, email, admin) and one design system. All people, businesses,
customers and data are fictional; every email and URL uses `.example`
domains. Prices are in Indian rupees, stored as integer paise.

## 0. The Shared Foundation (`packages/core`, `packages/ui`)

Every product gets these, built once:

1. **Accounts**: sign up and sign in with email and password, a magic link
   by email, and Google sign-in (configured but optional when no keys).
   Email verification, password reset, sign out everywhere, delete account
   (with all owned data, after confirmation).
2. **Workspaces (multi-tenancy)**: every user belongs to one or more
   workspaces; all product data belongs to a workspace. A workspace switcher
   in the app shell. Every query that reads or writes product data is scoped
   to the current workspace through one helper, and a test proves that one
   workspace can never read another's data.
3. **Teams and roles**: owner, admin, member. Invite by email (expiring
   link), accept, change role, remove member, transfer ownership. Members
   can't manage billing; only the owner can delete the workspace.
4. **Plans and billing**: each product defines Free, Pro and Business plans
   with limits (entitlements), monthly and yearly prices. Checkout through
   Razorpay (India) or Stripe (international), chosen by the workspace's
   billing country. Subscriptions are activated, renewed, failed (grace
   period, then downgrade), upgraded, downgraded and cancelled through
   verified webhooks, processed exactly once. A billing page shows the plan,
   usage against limits, the next renewal and past invoices. Upgrade prompts
   appear when a limit is reached. With no provider keys configured, a
   built-in fake provider simulates checkout and signs webhooks with the
   same algorithms, so everything works and is testable offline.
5. **Email**: transactional emails (verify, magic link, invite, receipts,
   product emails) built as React components, sent through an outbox table
   and a sender (Resend when a key exists; otherwise stored and viewable at
   a dev-only `/dev/mail` page). Never send real email in development.
6. **Onboarding**: after sign-up, a short guided setup (workspace name,
   the product's key setup step) and a checklist on the dashboard.
7. **Settings**: profile, workspace (name, logo, billing details including
   GSTIN for Indian businesses), team, billing, notifications, danger zone.
8. **Admin**: a protected `/admin` area for the operator (users,
   workspaces, subscriptions, a read-only audit log, impersonation is NOT
   allowed). Admins are set by an environment variable list of emails.
9. **Audit log**: important actions (sign-in, role change, plan change,
   deletions, exports) recorded with who, what and when.
10. **Marketing site**: landing page, pricing page (from the plan
    definitions), FAQ, and legal pages (terms, privacy, refund and
    cancellation policy, contact) with placeholder business details marked
    clearly for the reader to replace.
11. **Security basics**: rate limits on sign-in, sign-up, magic links and
    public form/booking endpoints; security headers; CSRF protection on
    mutations; input validation with Zod on every server entry point.

## 1. Billora: Invoicing and Getting Paid (`apps/billora`)

For freelancers and small Indian businesses.

- **Clients**: name, email, billing address, state, optional GSTIN
  (validated format), notes. Search and list.
- **Items**: a catalogue of products/services with HSN/SAC code, unit
  price and GST rate (0, 5, 12, 18, 28 percent).
- **Invoices**: numbered per workspace per financial year (e.g.
  INV/2026-27/0007), dates, due date, line items, discounts, notes, terms.
  GST is calculated per line: CGST + SGST when the place of supply is in
  the business's state, IGST otherwise; totals rounded correctly in paise.
  Statuses: draft, sent, viewed, partially paid, paid, overdue, void.
- **Send and get paid**: send by email with a PDF and a public link; the
  public invoice page shows the invoice and a Pay button (Razorpay/Stripe or
  the fake provider). Payments recorded only from verified webhooks;
  partial and manual payments (bank transfer, cash) can be recorded too.
- **Reminders**: automatic polite reminders before and after the due date
  (configurable), never more than one per day.
- **Recurring invoices**: monthly/quarterly templates that create and
  optionally send invoices on schedule.
- **Dashboard**: outstanding, overdue, collected this month, a chart of
  monthly collections, recent activity.
- **Reports**: GST summary by month (taxable value, CGST, SGST, IGST),
  CSV export. A note that e-invoicing (IRN) applies above ₹5 crore
  turnover and is out of scope.
- **Plans**: Free (5 invoices a month, 1 member), Pro (₹499/mo, unlimited
  invoices, reminders, recurring), Business (₹1,499/mo, 5 members, reports,
  custom branding).

## 2. Slotra: Online Booking (`apps/slotra`)

For salons, clinics, tutors and consultants.

- **Services**: name, duration, buffer time, price, optional deposit.
- **Staff and availability**: weekly hours per staff member, breaks, time
  off, and which services each person offers.
- **Public booking page** at `/b/<workspace-slug>`: choose service, staff
  (or "any"), date, then a time slot computed from availability, existing
  bookings and buffers, shown in the business's time zone (default
  Asia/Kolkata). Customer details, then pay the deposit (fake provider
  offline) or book without payment.
- **No double booking**: guaranteed in the database (a constraint or a
  transaction with locking), proven by a test that books the same slot
  concurrently.
- **Manage bookings**: calendar day and week views, list, statuses
  (confirmed, completed, cancelled, no-show), reschedule and cancel by
  staff, and by the customer through a signed link before a cutoff.
- **Reminders**: email confirmation and a reminder 24 hours before.
- **Dashboard**: today's appointments, this week's bookings and revenue,
  busiest hours.
- **Plans**: Free (1 staff, 30 bookings a month), Pro (₹699/mo, 5 staff,
  deposits, reminders), Business (₹1,999/mo, 20 staff, custom booking page
  branding).

## 3. Wordloom: AI Writing Assistant (`apps/wordloom`)

For marketers and small teams.

- **Templates**: blog post outline, blog post, product description,
  marketing email, social posts, rewrite/improve, each with its own fields.
- **Brand voice**: per workspace (tone, audience, words to use and avoid,
  sample text) applied to every generation.
- **Documents**: generate into a document; edit in a rich-text editor;
  autosave; version history with restore; folders; share with the team.
- **Generation**: streams the response as it is written, through the
  Anthropic API (model from configuration, default `claude-sonnet-5-5`);
  cancellable; with no API key, a deterministic fake model streams
  realistic sample text so the product works offline.
- **Usage metering**: words generated count against the plan's monthly
  limit, recorded per generation; the limit is enforced on the server
  before calling the model; usage shown in the app.
- **Safety and cost control**: per-user rate limits, maximum input size,
  a system prompt that treats document text as content, never
  instructions; errors and refusals shown clearly.
- **Plans**: Free (5,000 words a month), Pro (₹799/mo, 100,000 words,
  brand voice), Business (₹2,499/mo, 500,000 words, 5 members, shared
  brand voices).

## 4. Formora: Forms and Surveys (`apps/formora`)

For anyone collecting information.

- **Builder**: add, reorder and configure fields (short text, long text,
  email, phone, number, single choice, multiple choice, dropdown, date,
  rating, file upload metadata only, consent checkbox); required and
  validation rules; conditional logic (show a field if an answer matches);
  a welcome and thank-you screen; live preview.
- **Publish and share**: a public link `/f/<id>`, open/closed state, an
  optional response limit and closing date.
- **Public form**: one question per screen or all on one page, keyboard
  friendly, accessible, validated on the server, spam protection (honeypot
  and rate limit).
- **Responses**: table with filters, a single response view, analytics
  (counts, choice charts, averages, completion rate), CSV export, delete.
- **Notifications and webhooks**: email on new response; an outgoing
  webhook (signed with HMAC-SHA256, retried with backoff) to connect other
  tools.
- **Plans**: Free (3 forms, 100 responses a month), Pro (₹399/mo,
  unlimited forms, 5,000 responses, logic, webhooks), Business (₹1,299/mo,
  50,000 responses, 5 members, custom branding).
