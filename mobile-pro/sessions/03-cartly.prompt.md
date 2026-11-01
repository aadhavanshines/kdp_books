Build Cartly, the e-commerce store in docs/PRD.md section 2, as
apps/cartly: an Expo SDK 58 app with Expo Router, using @pro/ui (brand
"cartly") and @pro/api. Look at apps/platter first and follow the same
structure and conventions (tests in src/test, export:web script,
screenshots folder), and reuse the shared components instead of copying.

It should feel like the best shopping apps: information-dense product
cards with ratings, MRP strike-through and discount badges, deals with live
countdowns, fast search with suggestions, filter and sort sheets, a
product page with an image gallery and a sticky buy bar, and a checkout
that builds trust (delivery date, offers, secure payment note).

Screens: Home, Search with suggestions, Product listing with
filters/sort, Product detail (gallery, variants, pincode delivery
check, offers, highlights, reviews), Cart (save for later), Checkout
(address, payment sheet), Order confirmation, Orders and Order details with
shipment tracking steps, Return request flow, Wishlist, Notifications,
Account. Tabs: Home, Categories, Wishlist, Cart (with count badge), Account.

As before: plan first and add missing shared pieces to @pro/ui or @pro/api
with tests; build screen by screen and check each one in headless Chromium
at 393x852 CSS pixels, device scale 3, against the PRD, fixing anything
unpolished; add logic and screen tests; save final screenshots of every
screen to apps/cartly/screenshots/ (01-home.png, ...). Finish with
typecheck, lint and tests passing for the whole workspace, and a summary.
