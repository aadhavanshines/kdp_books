# Chapter 25: Backends: Firebase and Supabase

Every app so far either kept its data in the browser or ran its own small server. A production app needs more: user accounts, a database that many people share safely, server code for the things the browser must never decide, and live updates. Building all of that yourself is a big job. **Backend-as-a-service** platforms do most of it for you. In this chapter, QuickBite gets two of the most popular, **Firebase** and **Supabase**, behind one interface, so you can see how they compare and choose with confidence.

## The Two Platforms

| | Firebase (Google) | Supabase |
| --- | --- | --- |
| Database | Firestore: a document database (collections of JSON-like documents) | Postgres: a relational database (tables, rows, SQL) |
| Sign-in | Firebase Authentication | Supabase Auth |
| Who can read and write | Security rules, in Firebase's own rules language | Row Level Security (RLS) policies, in SQL |
| Server code | Cloud Functions (Node.js) | Edge Functions (Deno) |
| Live updates | Listeners on documents and queries | Realtime subscriptions |
| Local testing | The Emulator Suite | The Supabase CLI (`supabase start`), which runs in Docker |
| Free tier (October 2026) | Spark plan; Cloud Functions need the pay-as-you-go Blaze plan | 2 free projects, 500 MB database; inactive free projects pause after a week |

Both are excellent. As a rule of thumb, choose **Supabase** if your data is naturally tables and relationships (orders, items, customers), or you'd like to learn SQL, which is useful everywhere. Choose **Firebase** if you want the tightest integration with Google's other services, including Hosting, or you're building mobile apps with offline data. QuickBite's plan used both, behind one interface, so the rest of the app doesn't care which one is running.

> **Note:** Prices and free tiers change. Check firebase.google.com/pricing and supabase.com/pricing before you choose, and set budget alerts on any plan that bills by usage.

## The Most Important Idea: Rules That Run on the Server

With a backend-as-a-service, the browser talks *directly* to the database. That's what makes these platforms fast to build with, and it's also what makes them dangerous if you're careless. Anyone can open the browser's developer tools and send their own requests, so the only thing standing between your users' data and a curious stranger is the **rules** that the platform enforces on its servers.

QuickBite's rules follow the plan's principle: **deny by default, then allow only what each role needs.** Here's the heart of the Firebase version:

```
@include projects/07-quickbite/firebase/firestore.rules#L108-L116
```

Orders can be read by their owner and written by nobody. Only server code (Cloud Functions, using the Admin SDK) creates and updates orders, after calculating the price itself. Everything not explicitly allowed, such as payments and private coupons, is denied.

The Supabase version says the same thing in SQL. **Row Level Security** attaches a condition to every row: a user sees a row only if the condition is true for them.

```
@include projects/07-quickbite/supabase/migrations/20261006120100_security.sql#L86-L99
```

`auth.uid()` is the signed-in user's ID. The `orders` table has a policy for reading your own rows, and no policy at all for inserting or updating, so the database refuses those requests from browsers.

> **Warning:** In Supabase, a table without RLS enabled is readable and writable by anyone who has your public key, which is built into your app. Turn RLS on for every table, and test it. QuickBite's tests check that every table has RLS on.

## Prove the Rules Work

Rules are code, and code needs tests. The important tests are the ones that try to break in. For QuickBite, Claude wrote tests that sign in as user A, user B, and an anonymous visitor, and check what each can and can't do:

- Anonymous visitors can read only the menu catalog, active coupons, and search.
- Each user reads and edits only their own profile and addresses, and can't change who owns them.
- Each user reads only their own orders.
- Nobody can write orders, prices, payments, or coupon records directly.

And then it did something worth copying: it **checked that the tests can fail**. It ran the Firebase rules tests against deliberately wide-open rules, and 10 of the 12 tests failed, which shows they're really testing something. A security test that passes no matter what is worse than no test at all, because it gives false confidence.

## Testing Locally, Without Accounts

The plan required everything to run locally without real accounts. For Firebase, that's straightforward: the **Firebase Emulator Suite** runs Auth, Firestore, Cloud Functions, and Hosting on your own computer, and the sign-in emails appear in the emulator's interface instead of being sent. QuickBite's end-to-end test signs in with an email link read from the Auth emulator, orders, pays in fake mode, and watches the order move through every status to "Delivered", on a phone-sized and a desktop-sized screen.

For Supabase, the normal tool is `supabase start`, which runs the whole platform in Docker. The machine used for this book couldn't download Docker images, so Claude was asked to test as much as it could with a local PostgreSQL. Its reply showed real persistence, and real honesty:

```
Claude's reply:
Real on this machine: PostgreSQL 16, Supabase Auth (GoTrue, which
I built from its current source), Mailpit (the mail catcher
Supabase's CLI uses, also built from source), and Deno 2.9
running the real Edge Function files.

Not obtainable: PostgREST and Realtime. The release downloads,
container images, Stackage and a source build of PostgREST all
failed. For the full-stack runs I wrote two test-only stand-ins
and kept them in the scratchpad, out of the repo.

What still needs a real Supabase project (or supabase start)
1. Realtime. Live order updates are untested. On the harness the
   tracking page updated through its polling fallback.
2. PostgREST. My stand-in may not match its real behaviour.
3. Edge runtime and supabase functions serve.
```

On your own computer, with Docker installed, `supabase start` gives you the real thing, and those gaps close. The lesson is the same as in every chapter: read the "what I couldn't verify" list, and verify those parts yourself.

## The Contract Suite: One Test, Two Backends

How do you know two backends behave the same? QuickBite answers with a **contract test suite**: one set of 23 tests that describes how any backend must behave (listing restaurants, saving addresses, quoting a bill, placing an order, and so on), run unchanged against each implementation. The results at the end of phase 5:

| Suite | Result |
| --- | --- |
| Firestore security rules | 12 passed |
| Supabase Row Level Security | 24 passed |
| Contract suite: in-memory, Firebase, and Supabase | 23 passed on each |
| Order workflow on Postgres, including two checkouts at once | 11 passed |
| End-to-end on the Firebase emulators | 20 passed |
| End-to-end on the Supabase stand-in | 22 passed |

The end-to-end tests also caught a real bug that the faster tests had missed. On Firebase, the browser library sends a missing coupon as `null`, the server rejected it, and the bill never loaded at checkout. The contract suite, which ran in Node.js, sent the coupon differently and passed. Only a test in a real browser saw what customers would have seen.

## Decisions Worth Noticing

Claude made several judgment calls during these phases and reported them for review, which is exactly what you want from a collaborator:

- **The server works out an address's location from its area** and ignores coordinates sent by the browser, so a customer can't move their address closer to the restaurant to pay a smaller delivery fee.
- **Checkout requires sign-in.**
- **If a coupon stops applying between the quote and placing the order, the order is refused**, instead of charging a different total than the customer saw.
- **On Supabase, the order logic runs in the Edge Functions inside one database transaction**, reusing the same TypeScript code as Firebase, instead of being rewritten as SQL functions as the plan had suggested. Claude flagged this as a deviation from the plan and asked whether to change it.

## Best Practices for Backends

- **Choose by data shape and team skills**: Supabase for relational data and SQL, Firebase for Google integration and mobile offline data. Both are solid.
- **Deny by default.** Write rules that allow only what each role needs.
- **Turn on RLS for every Supabase table**, and never ship the service role key to the browser.
- **Never let the browser write prices, totals, or payment status.** Use server code for anything involving money.
- **Test your rules as an attacker**: anonymous, another user, and direct writes to protected data.
- **Check that your security tests can fail**, by running them against deliberately broken rules.
- **Develop against local emulators**, and keep a contract test suite if you support more than one backend.
- **Test the real browser path**; client libraries behave differently from server-side tests.
- **Watch the free-tier limits**, set budget alerts, and plan for paid tiers before launch.

> **Try It:** In your own project, ask Claude: "Write tests that try to break our security rules: as a signed-out visitor, as a second user, and by writing directly to protected data. Then run them against deliberately wide-open rules to prove the tests can fail." Did any test pass when it shouldn't have?

## Key Takeaways

- Backend-as-a-service platforms provide sign-in, a database, server code, and live updates, so you can focus on your app.
- Firebase uses Firestore and security rules; Supabase uses Postgres and Row Level Security. Both rely on rules that run on the server.
- Deny by default, keep money logic on the server, and test the rules as an attacker would, including checking that the tests can fail.
- A contract test suite proves that two backends behave the same; end-to-end tests in a real browser catch what faster tests miss.
- Read what Claude couldn't verify; here, Supabase Realtime needs a real project or `supabase start` to test.
