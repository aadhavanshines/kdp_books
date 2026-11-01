# Minutely: build plan

10-minute grocery delivery from `docs/PRD.md` section 4. Brand `minutely` in
`@pro/ui`, data from `@pro/api` (the server already serves the grocery
catalog, home rails, carts, orders and the SSE order simulation:
confirmed, packing, on the way, delivered in about 75 seconds).

The feel: speed everywhere. A bold "Delivery in 9 minutes" header, ADD
steppers that move the instant they are tapped, a green cart bar always one
tap away, bright category tiles, savings called out in green.

## Routes (Expo Router, `src/app`)

| Route | Screen | Data |
| --- | --- | --- |
| `_layout` | Providers, fonts, auth gate, product sheet host | token in AsyncStorage |
| `login` | Phone, then OTP | `useRequestOtp`, `useVerifyOtp` |
| `(tabs)/_layout` | Home, Categories, Orders, Account | `useCart` (warm) |
| `(tabs)/index` | Home: ETA header + address, search, category grid, offer banners, product rails, cart bar | `useMinutelyHome`, `useAddresses`, `useCart` |
| `(tabs)/categories` | All categories with subcategories | `useGroceryCategories` |
| `(tabs)/orders` | Active and past orders | `useOrders('minutely')` |
| `(tabs)/account` | Profile, addresses, help, log out | `useMe`, `useAddresses`, `useSignOut` |
| `search` | Search box, trending, results grid | `useGroceries({ q })` |
| `category/[id]` | Left category rail, product grid, subcategory + sort filters, cart bar | `useGroceryCategories`, `useGroceries` |
| `cart` | Savings banner, free delivery nudge, lines, instant slot, coupon, tip, bill | `useCart`, `useCoupons`, `useSetTip` |
| `checkout` | Address, payment method, bill summary, Pay | `useAddresses`, `usePlaceOrder` |
| `order/[id]` | Tracking: countdown ring, SVG map, status steps, partner card | `useOrderStream` (SSE) |

The product sheet is a `BottomSheet` opened from any product card via a
context (`useProductSheet().open(id)`), not a route, so it slides over
whatever screen you are on.

## App components (`src/components`)
ProductCard (rail and grid sizes), ProductSheet (+ provider), MinutelyCartBar,
CategoryTile, OrderRow, useGroceryCart (instant steppers: the shown quantity
changes at once and the server's cart wins when it answers).

## App logic (`src/lib`, unit tested)
- `delivery.ts`: ETA headline, free-delivery nudge, savings copy.
- `links.ts`: banner links to routes.
- `catalog.ts`: sort options, discount label, search hints.
- `tracking.ts`: countdown window and headline per status.
- `payment.ts`: payment options and labels.

## Missing from the shared packages (added, with tests)
- `@pro/ui` `CountdownTimer`: `fillColor` / `trackColor` for the ring, so
  it can sit on a brand fill (the tracking hero).
- `@pro/ui` `CartBar`: `tone="primary"` (Minutely's bar is green, not the
  yellow accent).

## Done means
Each screen checked in headless Chromium (393x852, DPR 3); final screenshots
in `screenshots/`, tracking captured mid-delivery; `npm run check` green.
