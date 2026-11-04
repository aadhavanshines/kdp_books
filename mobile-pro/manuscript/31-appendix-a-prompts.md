# Appendix A: The Prompt Library

Every prompt in this book, in one place. The session prompts are the exact text given to Claude Code to build the apps; the production prompts are starting points for your own app. Adapt the names, paths and details to your project, and keep the habits they share: say what to build, say how to check it, and ask for an honest summary of what's left.

## The Session Prompts

These prompts built everything in this book, in order. Each ran in a fresh session with the repository's `CLAUDE.md` loaded.

### Session 1: The Foundation

```text
@include sessions/01-foundation.prompt.md
```

### Session 2: Platter

```text
@include sessions/02-platter.prompt.md
```

### Session 3: Cartly

```text
@include sessions/03-cartly.prompt.md
```

### Session 4: Lumo

```text
@include sessions/04-lumo.prompt.md
```

### Session 5: A Flaky Test, and Minutely

```text
@include sessions/05-minutely.prompt.md
```

### Session 6: Reelhouse TV

```text
@include sessions/06-reelhouse-tv.prompt.md
```

### Session 6b: Reelhouse Fixes

```text
@include sessions/06b-reelhouse-fixes.prompt.md
```

## Production Prompts

### Chapter 20: Performance: Lists, Images, Startup and Smooth Animation

```text
Lumo's feed and Cartly's product list will hold thousands of items in
production. Move both to FlashList (the version bundled with our Expo
SDK), keep every existing test passing, make sure post and product rows
are memoized with stable props, and tell me anything that behaves
differently, such as scroll restoration or the sticky header.
```

```text
Review this app for performance problems a user would feel on a
mid-range Android phone. Look for: lists that re-render whole rows,
lists nested in scroll views, images loaded at full size, work done at
startup that could wait, animations driven from JavaScript, and anything
that blocks a press handler. Rank what you find by how much a user would
notice it, explain each in one sentence, and don't change any code yet.
```

### Chapter 21: Accessibility and Localization

```text
Audit apps/platter for accessibility. For every screen, check: each
touchable has a role and a clear label; related text is grouped into one
announcement; status changes are announced; decorative art is hidden;
targets are at least 44x44; layout survives the largest text size; and
nothing is shown by color alone. Write the findings as a table (screen,
problem, fix), fix them, add or update a test for each fix using the
accessible names, and run the checks.
```

```text
Prepare Minutely for Hindi. Move every user-visible string into
en.json and hi.json files using i18next and expo-localization, keep
prices and dates formatted with Intl for the current locale, use plural
rules for counts, and leave the Hindi values as English placeholders
marked TODO for a translator. Add a test that renders Home in each
language. Don't translate anything yourself.
```

### Chapter 22: Testing: Unit, Component, API and End to End

```text
Add Maestro flows for Platter's three critical journeys (sign in and
order, pay and track, rate a delivered order) in flows/platter/, using
the accessibility labels the screen tests already use. Then list any
screen where a label a flow needs is missing, and add it with a test.
```

### Chapter 23: Payments for Real: Razorpay, Stripe, Apple Pay, Google Pay and UPI

```text
Replace Platter's demo payment with Razorpay in test mode. The server
creates a Razorpay order for the server-calculated total, stores its ID
on our order, and verifies both the checkout signature and the
payment.captured webhook (HMAC-SHA256, timing-safe, raw body), checking
amount and currency, and processing each event once. The app opens
Razorpay checkout with react-native-razorpay in a development build,
then waits for the order's event stream to say "paid". Test the server
logic offline with known good, tampered and replayed messages. Never use
live keys. Finish by listing what can only be verified with real test
keys on a device, and anything in Razorpay's rules you're unsure about.
```

### Chapter 24: Push Notifications, Deep Links and Analytics

```text
Add push notifications to Platter for order updates only: ask for
permission after the first order is placed, with a one-line explanation;
store the Expo push token on the server against the user; send a push on
each order status change from the simulator; and open the order screen
when a notification is tapped, after sign-in if needed. Add an
"Order updates" switch in Profile. Then add an analytics module with a
track() function that logs to the console in development, and call it
for the seven events in docs/EVENTS.md, with no personal data in any
event. Test the server side and the routing logic.
```

### Chapter 25: Security and Privacy

```text
Store the session token with expo-secure-store instead of AsyncStorage
in all four apps, through the existing TokenStorage interface, keeping
the web build on localStorage. Add a test for the adapter, and make sure
a token stored by the old version is moved over once and then deleted.
```

```text
Do a security and privacy review of this repository before release.
Check for: secrets in the app or in git history; tokens in unencrypted
storage; anything the client decides that the server should; endpoints
without authentication, authorization checks or validation; missing
rate limits on login and OTP; CORS and HTTP settings; permissions asked
without need; personal data in logs or analytics; and account deletion.
Rank findings by severity with file and line, and explain how each could
be exploited in one sentence. Don't change code yet.
```

### Chapter 26: Builds and Releases With EAS

```text
Set up EAS for apps/platter: eas.json with development, preview and
production profiles, remote app versions with auto-increment, channels
for updates, and the fingerprint runtime version policy. Replace the
.example bundle IDs with com.mycompany.platter. Add an EAS workflow that
runs npm run check on pull requests and builds both platforms on tags
starting with v. Explain each setting in a short comment in the PR.
Don't run any build.
```

### Chapter 27: Shipping to Google Play

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

### Chapter 28: Shipping to the App Store

```text
Prepare Lumo for App Review guideline 1.2 (user-generated content).
Add Report to every post, comment, story and message (with reasons),
Block and Unblock on profiles (hiding blocked users everywhere), a
server route to record reports with a simple admin list, and terms
acceptance at sign-up. Add server and screen tests, and list anything
the guideline asks for that this doesn't yet cover.
```

### Chapter 29: After Launch: Crashes, Reviews, Updates and Experiments

```text
Here is a crash report from Sentry for Platter 1.2.0 (stack trace
below, personal data removed). Find the cause in the code, write a test
that reproduces it, fix it, and tell me whether the fix can ship as an
EAS update or needs a store build. Then look for the same mistake
anywhere else in the apps.
```

```text
Here are last month's 300 Play Store reviews for Minutely (exported CSV,
names removed). Group them into themes with a count and two short
example quotes each, separate bugs from feature requests, and suggest
the three changes that would most improve the rating. Don't invent
themes with fewer than five reviews.
```

```text
Upgrade this monorepo from Expo SDK 58 to the next SDK, following Expo's
upgrade guide for that version. Upgrade one package at a time, run the
checks after each, and keep a log of every breaking change you had to
handle and how. Then rebuild the web exports, retake the screenshots,
and compare them with the old ones; list every visual difference.
```

### Chapter 30: Reelhouse: Building for Android TV, With a Look at Apple TV

```text
Add real video playback to Reelhouse's player with expo-video, if it
supports Android TV in our SDK (check the docs and tell me), playing a
public HLS test stream. Keep the existing controls, auto-hide, seek and
Next episode behavior and their tests; wire play, pause and seek to the
real player; and report what you could and couldn't verify without a TV.
```

## Patterns Worth Reusing

- **Plan first.** "Write a plan to PLAN.md before any code" catches misunderstandings while they're cheap.
- **Name the patterns, not the adjectives.** "Instant ADD steppers and a cart bar one tap away" gives Claude something to check; "modern and fast" doesn't.
- **Ask for visual proof.** "Check each screen in headless Chromium at 393x852 and fix anything unpolished" made every session review its own screenshots.
- **Make checks the definition of done.** "Finish with typecheck, lint and tests passing for the whole workspace."
- **Size the session.** "Keep it focused enough for one session of about an hour."
- **Ask for the gaps.** "Finish with a summary of what's left undone" turns a confident report into a useful one.
- **Review before change.** For audits, "rank the findings and don't change code yet" keeps you in charge of priorities.
