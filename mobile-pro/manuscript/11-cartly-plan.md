# Part III: Cartly, E-Commerce

# Chapter 11: Planning a Store App

Shopping apps are information-dense in a way few other apps are. A single product card carries an image, a title, a rating with a count, a price, a struck-through maximum retail price, a discount percentage and sometimes a delivery promise, and a home screen stacks dozens of them under banners, categories and deals. The challenge is to make all that density easy to scan and to build trust at every step toward "Buy now". This part builds Cartly.

![Cartly: the home screen with categories, a sale banner and countdown deals; a product page with offers and a sticky buy bar; and an order's live shipment tracking.](images/cartly-opener.jpg)

## The Patterns Users Expect

The PRD's section on Cartly lists them, in the category's vocabulary:

- **A branded header** with search ("Search 'wireless earbuds'"), a microphone, and "Deliver to Riya · Lake View 560101": the delivery pincode is always visible because prices and dates depend on it.
- **A category strip** with illustrated tiles: Mobiles, Electronics, Fashion, Footwear, Home and Kitchen.
- **Hero banners** for sales, and trust badges: free delivery above a threshold, easy returns, secure payment.
- **Deals of the day** with a live countdown, "Fresh prices every midnight, while stocks last".
- **Product cards** with a discount badge, rating, price, MRP strike-through and a wishlist heart.
- **Search with suggestions** as you type, recent and trending searches, and highlighted matches.
- **Filter and sort sheets**: price, brand, rating, discount; relevance, price low to high, newest.
- **A product page** with a swipeable gallery, the brand store link, title, rating summary, price block, variant pickers, a pincode delivery check, offers, highlights, reviews, and a sticky "Add to cart" / "Buy now" bar.
- **Cart with "Save for later"**, checkout with address and payment, an order confirmation, order details with shipment steps, and returns.

## The Prompt

Session 3's prompt for Cartly:

```text
@include sessions/03-cartly.prompt.md
```

It's shorter than Platter's because the method was now established: "Look at apps/platter first and follow the same structure and conventions … and reuse the shared components instead of copying." The prompt spends its words on what's specific to shopping: density, deals with live countdowns, fast search, filter and sort sheets, the gallery, the sticky buy bar, and trust in checkout.

## When a Session Runs Out of Time

Session 3 is the book's lesson in what happens when a milestone is too big. The session built all of Cartly's screens and captured 24 screenshots, then ran past the two-hour limit of the job running it and was stopped before it reported back. When it stopped, it was halfway through a refactor: moving the address, coupon and payment sheets and the sign-in session out of Platter into the shared packages, so both apps could use one copy. Platter's files had been edited, some deleted, and nothing had been checked or committed.

This is exactly the situation the review loop exists for. The recovery took three steps:

1. **Look before acting.** `git status` and `git diff` showed precisely what the session had changed: Cartly's new folder, Platter's edited screens, and the moved components.
2. **Write a focused follow-up prompt** that explains the situation and asks for a finish, not a restart:

```text
@include sessions/03b-cartly-finish.prompt.md
```

3. **Verify independently.** The follow-up session was itself cut off, this time by Claude Code's five-hour usage limit, after 32 minutes. Its last message was simply the limit notice. So the work was verified directly: `npm run check` passed across the whole workspace, both apps built for the web, and the screenshots were current. Only then was it committed.

> **Tip:** Size sessions so they finish well within your limits, and commit after every successful session. A session that stops halfway leaves the working tree in an in-between state; with a clean commit behind it, you can always see exactly what changed and decide whether to finish it or throw it away with `git restore`.

## What Moved to the Shared Packages

The refactor is worth understanding, because it's what keeps a family of apps consistent. After session 3:

- `AddressSheet`, `CouponSheet` and `PaymentSheet` live in `@pro/ui`, used by Platter, Cartly and later Minutely.
- The signed-in session (token storage, sign-in state, sign-out) lives in `@pro/api` as `SessionProvider`, the provider you saw in Platter's root layout in Chapter 4.
- Phone number formatting, debouncing and the query error component moved too.

Each app now holds only what's unique to it. When you review an AI's work on a second or third app, check for this. The natural tendency, for people and for AI agents alike, is to copy what worked in the first app; the professional move is to share it.

## Key Takeaways

- Store apps are dense; scannability (consistent cards, clear price blocks) and trust (delivery pincode, badges, honest totals) are the design goals.
- Later app prompts can be shorter: point to the first app's conventions and spend words on what's new.
- When a session is cut off, look at `git status` and `git diff`, write a focused finishing prompt, and verify independently before committing.
- Move shared pieces into shared packages as soon as a second app needs them.
