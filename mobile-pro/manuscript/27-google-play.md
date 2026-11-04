# Chapter 27: Shipping to Google Play

Google Play is the larger of the two stores by number of users, especially in India, and it's the first store most teams ship to. This chapter takes Platter from a signed build to a production release on Play, including the testing requirement that catches many new developers by surprise.

> **Warning:** Store requirements change several times a year. Everything here was checked against Google's documentation in October 2026; check the Play Console's current requirements before you submit.

## The Requirements in 2026

- **A Play Console developer account**: a one-time $25 registration fee, with identity verification. Organizations need a D-U-N-S number.
- **Target API level.** From 31 August 2026, new apps and updates must target Android 16 (API level 36). Android TV apps must target at least Android 14 (API level 34). Expo SDK 58 builds target the required level by default.
- **Android App Bundle (`.aab`)**, signed, with Google Play App Signing.
- **Testing for new personal accounts.** Personal developer accounts created after 13 November 2023 must run a **closed test with at least 12 testers who stay opted in for 14 days in a row** before they can apply for production access. Organization accounts are exempt.
- **Developer verification.** Google has begun requiring Android developers to register their apps. Registration became required for stores including Google Play in Brazil, Indonesia, Singapore and Thailand on 30 September 2026, with a global rollout planned for 2027. If you publish on Play with a verified account, you're largely covered; read the current Android developer verification pages.

## Step 1: Create the App

In the Play Console, create an app: its default language, name, whether it's an app or a game, and whether it's free or paid. A free app can never become paid later.

## Step 2: Set Up the Store Listing

The listing is your app's shop window:

- **App name** (up to 30 characters) and **short description** (up to 80).
- **Full description** (up to 4,000 characters): what the app does, its main features, written for people, not search engines.
- **App icon**: 512 by 512 pixels.
- **Feature graphic**: 1024 by 500 pixels, shown at the top of the listing.
- **Phone screenshots**: at least two; up to eight. Use the real app. This book's device-framed screenshots show how; the stores prefer plain screenshots or simple frames with short captions.
- **Category, contact email and privacy policy URL.**

Never use another company's name, logo or trademarks in your listing, and never claim features the app doesn't have.

## Step 3: Complete App Content

The **App content** section holds the declarations Google reviews. Each needs care:

- **Privacy policy**, matching what the app collects.
- **App access**: if parts of the app need a login, give reviewers instructions and a working test account. For an OTP login like the apps', provide a test phone number and fixed code that work only for reviewers, or a reviewer bypass.
- **Ads**: whether the app contains ads.
- **Content rating**: a questionnaire that produces ratings for each region.
- **Target audience and content**: the age groups the app is for. Apps aimed at children have extra rules.
- **Data safety**: what data the app and its SDKs collect and share, why, whether it's encrypted in transit, and whether users can ask for deletion. This must match the app (Chapter 25).
- **Account deletion**: if users can create accounts, a link where they can request deletion from the web, as well as in the app.
- **Financial features, health, government** and other declarations if they apply.

## Step 4: Internal Testing

Upload the first `.aab` by hand to the **internal testing** track and add up to 100 testers by email. Internal tests are available within minutes and are the quickest way to try the real store build on real phones. Install it, go through the release checklist (Appendix B), and fix anything you find.

## Step 5: Closed Testing (12 Testers for 14 Days)

For a personal developer account created after 13 November 2023, create a **closed testing** track, add at least 12 testers (an email list or a Google Group), and send them the opt-in link. They must stay opted in for 14 consecutive days. Use the time well:

- Ask testers to use the app for real tasks and send feedback, with a simple form or an email address.
- Watch the Play Console's crash and ANR reports (Chapter 29).
- Ship fixes to the closed track as new builds; the 14 days continue.

After 14 days, apply for production access in the Dashboard. Google asks about your testing, what you learned and your launch readiness; answer specifically. Review of the application can take some days.

## Step 6: Production With a Staged Rollout

Create a production release with your build and release notes, and choose a **staged rollout**: release to a small share of users first (for example 5 percent), watch crashes and reviews for a day or two, then increase to 20, 50 and 100 percent. If something goes wrong, halt the rollout; users who haven't updated stay on the old version.

The first review of a new app can take longer than later ones. Updates are usually reviewed within a day or two.

## Common Reasons for Rejection

- **Broken or blocked access**: reviewers couldn't log in. Test the reviewer account yourself the day you submit.
- **Data safety mismatch**: the form says no data is collected, but an SDK collects device IDs.
- **Misleading metadata**: screenshots or descriptions that don't match the app, or that use other brands.
- **Permissions without clear need**, especially location in the background, SMS and call logs, which have strict policies.
- **Payments policy**: selling digital goods without Google Play Billing (Chapter 23).
- **Minimal functionality**: an app that's just a website in a frame, or does too little.

When a rejection arrives, read it carefully, fix exactly what it says, explain the fix in the appeal or resubmission notes, and resubmit. Claude is useful here: paste the rejection (without personal details) and ask it to find the cause in the code and the listing.

## A Prompt for the Listing

```text
Draft the Google Play listing for Platter: a 30-character name, an
80-character short description, and a full description under 4,000
characters with the main features as short paragraphs. Use plain, honest
language; mention no other company or brand; claim nothing the app
doesn't do. Then draft the Data safety answers from the code (what we
collect, why, shared or not, encrypted in transit, deletion), listing
every SDK we use and what it collects, and flag anything you're unsure
about for me to check.
```

## Key Takeaways

- In 2026, Play requires a one-time $25 registration fee, target API 36 (API 34 for TV), signed App Bundles and, for personal accounts created after 13 November 2023, a 12-tester, 14-day closed test.
- Complete every App content declaration carefully; give reviewers working access.
- Test on the internal track first, use the closed test for real feedback, then release to production with a staged rollout.
- Most rejections come from access, data safety, metadata, permissions or payments; fix exactly what the reviewer reports.
