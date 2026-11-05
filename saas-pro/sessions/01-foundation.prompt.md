Read CLAUDE.md, docs/PRD.md and docs/DESIGN.md. This session builds the
first half of the shared foundation that all four products will use, and
the Billora app shell to prove it works. Build it in this order, checking
each step before moving on:

1. The npm workspace: a root package.json with workspaces apps/* and
   packages/*, shared TypeScript and ESLint config, root scripts
   (`typecheck`, `lint`, `test`, `check` = all three, `db:migrate`,
   `db:seed`, `dev:billora`), a docker-compose.yml with PostgreSQL 16, and
   `.env.example` files. Use the current versions of every package.

2. packages/core, part one:
   - Drizzle schema and migrations for users, sessions and the other tables
     Better Auth needs, workspaces (name, slug, time zone, billing
     country, billing state, GSTIN, logo), memberships with roles (owner,
     admin, member), invitations (token hash, expiry), and an audit log.
   - Better Auth configured for email and password (with email
     verification), magic links, and Google sign-in that is simply hidden
     when no Google keys are set.
   - The workspace-scoping helpers every product will use: get the current
     user's workspace from the session (never from the browser), require a
     role, and a typed `scoped(db, workspaceId)` style API so product
     queries can't forget the workspace filter.
   - Teams: invite by email, accept, change role, remove, transfer
     ownership, with the rules from the PRD.
   - A test harness that creates a fresh PostgreSQL database per test run
     (the `saas` role can create databases) and drops it afterwards, and
     tests for the scoping helpers (one workspace can never read another's
     data), roles and invitations.
   - For now, emails (verification, magic link, invite) go to an outbox
     table; a dev-only `/dev/mail` page in the app lists them so links can
     be clicked. (Real sending comes next session.)

3. packages/ui: Tailwind CSS 4 with theme roles as CSS variables for the
   four brands, light and dark; the components from docs/DESIGN.md that
   these screens need (buttons, inputs with labels and errors, select,
   checkbox, dialog, dropdown menu, toast, badge, avatar, card, data table,
   empty state, skeleton), and the app shell (sidebar with workspace
   switcher, top bar with user menu, mobile drawer).

4. apps/billora as a Next.js 16 app using both packages with the Billora
   brand: sign up, sign in (password and magic link), verify email, forgot
   and reset password, onboarding (create the first workspace with name,
   state and optional GSTIN), an empty dashboard inside the app shell,
   settings pages for profile, workspace and team (invite, roles, remove,
   transfer, leave), the invite acceptance page, and `/dev/mail`. A simple
   placeholder home page is enough; the marketing site comes later.

5. Seed data: a fictional demo owner (riya@billora.example, password
   `demo-password-2026`), a second member, and a second workspace owned by
   someone else, for testing isolation.

Verify visually: run the app against the local database, open every
screen in headless Chromium at 1440x900 and at 390x844, look at each
screenshot and fix anything unpolished (alignment, spacing, overflow,
contrast, empty and error states). Save final screenshots to
apps/billora/screenshots/ named by screen (01-sign-in.png, ...), desktop
and mobile.

Finish with typecheck, lint and tests passing for the whole workspace, and
a summary: what you built, how scoping and roles are enforced, any choice
where you departed from these instructions and why, and anything left
undone. Keep the work focused so it fits in one session of about an hour
and a half; leave billing, real email, admin and marketing for the next
session.
