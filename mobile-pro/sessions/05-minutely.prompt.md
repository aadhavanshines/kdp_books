Two jobs in this session.

1. A flaky test. `npm run check` failed once in
apps/cartly/src/test/screens/orders-returns.test.tsx ("Order details ›
tracks the shipment live and lets you cancel before it ships") while the
whole workspace's tests ran in parallel; run alone it passes. Find the real
cause (timing, fake timers, shared state, SSE) and fix it properly, without
skipping the test or just raising timeouts. Prove it with several runs of
the full `npm test` from the root.

2. Build Minutely, the 10-minute grocery app in docs/PRD.md section 4, as
apps/minutely: an Expo SDK 58 app with Expo Router, using @pro/ui (brand
"minutely") and @pro/api, following the structure of the other apps and
reusing the shared packages.

It should feel like the best quick-commerce apps: speed everywhere (a bold
"Delivery in 9 minutes" header, instant ADD steppers, a cart bar that's
always one tap away), bright category tiles, savings called out in green,
and a tracking screen with a countdown ring and the SVG map.

Screens: Login, Home (address, search, category grid, offer banners,
product rails with ADD steppers), Search, Category page (left category
rail, product grid, filters), Product sheet, Cart (savings banner,
delivery partner tip, bill), Checkout and payment, Tracking (countdown ring,
SVG map, status steps, partner card), Orders, Account. Tabs: Home,
Categories, Orders, Account.

As before: plan first, add missing shared pieces with tests, check each
screen in headless Chromium at 393x852 CSS pixels with device scale 3 and
fix anything unpolished, add logic and screen tests, save final screenshots
of every screen to apps/minutely/screenshots/ (01-home.png, ...), with
tracking captured mid-delivery. Keep it focused enough for one session of
about an hour. Finish with typecheck, lint and tests passing for the whole
workspace, and a summary.
