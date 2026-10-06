# Chapter 23: Project 7: Planning a Production App

Every project so far has been small enough to build in an afternoon. Real products are different. A food delivery app like Swiggy or Zomato, or a store like Amazon, handles accounts, payments, and data that customers trust you with, and it has to look and feel polished enough that people choose it over the alternatives. In the next five chapters, you'll follow **QuickBite**, a food delivery web app, from the first prompt to launch: planning, a production-quality interface, two different backends, real payment providers, and hosting. This chapter is about the most important step, the plan.

## What "Production Ready" Means

A demo works when you show it. A **production** app works when you're not there: for thousands of strangers, on cheap phones and slow connections, when someone tries to cheat, and at 3 a.m. when something fails. In practice, that means:

- **It looks and feels professional**: fast, consistent, and pleasant on phones and desktops.
- **It's secure**: users can see only their own data, and nobody can change prices or mark an unpaid order as paid.
- **Money is exact**: no rounding errors, and every rupee or dollar is accounted for.
- **It's tested at every level**, from single functions to full journeys in a real browser.
- **It can be operated**: deployed safely, monitored, and fixed without drama.

None of these can be added at the end. They have to be in the plan.

## The Planning Prompt

For a project of this size, the planning session deserves the strongest model and extra thinking (Chapter 22), so QuickBite was planned with Opus at high effort, in plan mode:

```
claude --model opus --effort high --permission-mode plan
```

Here's the prompt. It's long, because it's doing the job of a product brief:

```
I want to build QuickBite, a food delivery web app, and I want it
to be production quality: it should look and feel like the apps
people use every day, such as Swiggy, Zomato, or Amazon, not like
a school project. It will run first in India, so prices are in
rupees, and later in other countries.

Customers can:
- Sign in with email (magic link or one-time code is fine).
- Browse restaurants near a chosen area, with photos, ratings,
  delivery time, cost for two, cuisines, and offers.
- Search dishes and restaurants, and filter (rating 4+, pure veg,
  fast delivery, offers).
- Open a restaurant menu with veg/non-veg markers, add items, and
  change quantities from a cart that follows them around.
- Check out with a delivery address, a coupon, and a clear bill
  (item total, delivery fee, taxes, discount).
- Pay online with Razorpay (UPI, cards) in India, or Stripe for
  international cards.
- See the order status update from "placed" to "delivered".

Technical requirements:
- React, TypeScript, Vite, and Tailwind CSS, mobile first, and
  great on desktop too.
- Two interchangeable backends behind one interface, chosen with
  an environment variable: Supabase (Postgres, Auth, Row Level
  Security) and Firebase (Auth, Firestore, security rules, Cloud
  Functions).
- Payments must be safe: the server calculates every price, the
  client never decides what it pays, and orders are marked paid
  only after verifying the provider's signature (payment
  signature or webhook). No secret keys in the browser.
- Hosted on Firebase Hosting (a web.app address).
- Tests at every level, and everything must run and be testable
  locally without real accounts: Firebase emulators, a fake
  payment mode, and seed data.

I'm a beginner, so explain your choices simply. Make a plan
first: the architecture, the data model, the security rules, the
payment flow, the folder structure, the design system, the
testing approach, and the build phases (each phase should leave
the app working). Don't write code yet.
```

Look at how much of the prompt is about *quality* rather than features. "Not like a school project" sets the bar. "The client never decides what it pays" states the most important security rule in plain words. "Testable locally without real accounts" means you can build and test everything before you sign up for any service.

## The Plan

Claude worked for about four and a half minutes and wrote a 450-line plan to a file. Its summary (shortened):

```
Claude's reply:
How it fits together
- Two backends, one interface: the app talks to a single
  TypeScript interface, and VITE_BACKEND=firebase|supabase
  decides which backend sits behind it. A third, in-memory
  option serves sample data, so the app runs before any backend
  exists and component tests run instantly.
- Logic written once: prices, coupons and order statuses live in
  one shared package. That means the bill can't come out
  differently on the two backends.
- Money is stored as whole paise (₹249 is stored as 24900),
  never as decimals.

Payment safety
- The browser only sends dish IDs and quantities, never a price.
- An order is marked paid only after the provider's signature
  checks out and the amount paid matches the order total. Both
  steps happen in one database transaction, and a repeated
  payment message has no effect.
- Fake payment mode pretends to be the payment provider: it sends
  a signed message to the same code that checks real payments.
  Local runs and tests therefore use the real security checks.

Assumptions to confirm before I start:
1. No restaurant, rider or admin apps in version 1. Order status
   moves through a demo simulator, so there's something to watch.
2. One restaurant per cart. Adding a dish from another restaurant
   asks "Replace cart?", like Swiggy.
3. No cash on delivery, refunds, written reviews or map pin-drop
   at first.
4. Firebase is built first, because the site is hosted there.
5. The live demo on web.app can run in fake-payment mode, with a
   "no real money" banner, until you have Razorpay KYC.

Before going live: Cloud Functions need Firebase's pay-as-you-go
plan. The GST rates are configurable defaults; have an
accountant confirm them.
```

![The architecture in QuickBite's plan. The browser talks to one interface; either backend sits behind it; the order and payment logic is written once and shared.](images/quickbite-architecture.png)

Several ideas in this plan are worth learning, because they apply to almost every serious app.

**Money as whole numbers.** Computers store decimals approximately: in JavaScript, `0.1 + 0.2` is `0.30000000000000004`. Storing ₹249.00 as the whole number 24900 (paise) avoids the problem entirely. Razorpay and Stripe use the same convention.

**The server is the source of truth.** Anything that runs in the browser can be changed by the user with the browser's developer tools. So the browser sends only *what* the customer wants (dish IDs and quantities), and the server looks up the prices, applies the coupon, and calculates the total.

**Verify, then trust.** A payment provider tells your server that a payment succeeded by sending a message signed with a secret only you and the provider know. The server checks the signature, checks that the amount matches the order, and only then marks the order paid. A message that arrives twice changes nothing, a property called **idempotency**.

**One interface, many implementations.** The screens never talk to Firebase or Supabase directly; they talk to a small interface with methods like `listRestaurants` and `createOrder`. That makes the backend swappable, and it lets the screens be tested with an in-memory fake.

**Deny by default.** The security rules start from "nobody can do anything" and then allow only what each kind of user needs. The plan's table for this:

| Data | Signed out | Signed-in owner | Server only |
| --- | --- | --- | --- |
| Restaurants, menus, public coupons | read | read | write |
| Profile, addresses | none | read and write own | none |
| Orders | none | read own | create and update |
| Private coupons, payments, webhook events | none | none | all |

**Phases that each leave the app working.** The plan split the work into nine phases: foundation, browsing, cart and bill, Firebase sign-in and data, server-side orders with fake payments, Supabase, real Razorpay and Stripe, launch on web.app, and other countries. After every phase, the app runs and every test passes.

## Answer the Assumptions

The plan ended with assumptions to confirm. This is where you, not the AI, make product decisions. All five were reasonable for a first version, so the reply was short:

```
Go. Your assumptions are all right. Save the plan in the repo as
docs/PLAN.md, then build phases 0, 1 and 2, committing after each
phase.
```

Saving the plan in the repository matters for a project this size. Later sessions start fresh, to keep the context small and the costs down (Chapter 30), and each one begins by reading `docs/PLAN.md`. The plan becomes the project's shared memory.

> **Note:** Version 1 of QuickBite is the customer app. Real delivery businesses also need apps for restaurants, delivery riders, and administrators, plus customer support, refunds, and fraud checks. The plan names these as out of scope rather than ignoring them, which is exactly what a good plan should do.

## Best Practices for Planning a Production App

- **Write a product brief, not just a feature list**: who it's for, the quality bar, and the non-negotiable rules.
- **Plan with the strongest model and high effort**, in plan mode.
- **Ask for the architecture, data model, security rules, payment flow, design system, tests, and phases** explicitly. Anything you don't ask for may be left vague.
- **Read the assumptions and answer them.** They're product decisions, and they're yours.
- **Insist on phases that each leave the app working**, and commit after each one.
- **Save the plan in the repository** and start later sessions by reading it.
- **Keep secrets and money on the server**, and say so in the brief.
- **Plan for testing without real accounts**, with emulators, fakes, and seed data, so you can build before you pay for anything.
- **Name what's out of scope**, so nobody mistakes the first version for the finished product.

> **Try It:** Write a product brief for an app you'd like to build, using the QuickBite prompt as a template: who it's for, what users can do, the quality bar, the technical and security requirements, and how it will be tested. Run it in plan mode and read the assumptions Claude lists. Which ones would you change?

## Key Takeaways

- Production quality means professional design, security, exact money, testing at every level, and an app you can operate.
- A long, careful planning prompt is worth it for a large project; plan with a strong model at high effort.
- Core ideas from QuickBite's plan: money as whole numbers, the server as the source of truth, verify-then-trust payments, one interface with swappable backends, and deny-by-default security.
- Answer the plan's assumptions yourself, and save the plan in the repository for later sessions.
