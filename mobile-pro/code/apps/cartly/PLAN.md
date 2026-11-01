# Cartly: build plan

E-commerce store from `docs/PRD.md` section 2. Brand `cartly` in `@pro/ui`
(cobalt #2453FF, deal yellow #FFC21A), data from `@pro/api` (every Cartly,
cart, order and notification endpoint already has a hook).

## Routes (Expo Router, `src/app`)

| Route | Screen | Data |
| --- | --- | --- |
| `_layout` | Providers (theme, safe area, session, toasts), fonts, auth gate | `SessionProvider` from `@pro/api` |
| `login` | Phone, then 6-digit OTP | `useRequestOtp`, `useVerifyOtp` |
| `(tabs)/_layout` | Home, Categories, Wishlist, Cart (count badge), Account | `useCart('cartly')` |
| `(tabs)/index` | Home: address strip, search button, category strip, hero banners, deals of the day with live countdown and claimed bars, "Top picks for you" grid, recently viewed rail | `useCartlyHome`, `useAddresses` |
| `(tabs)/categories` | Left category rail; right: hero tile, brand chips, top-rated products, "See all" | `useProductCategories`, `useBrands`, `useProducts` |
| `(tabs)/wishlist` | Saved products grid, move to cart, remove | `useWishlist`, `useToggleWishlist`, `useSetCartItem` |
| `(tabs)/cart` | Lines (variant, qty stepper, delivery date), save for later / move to cart, coupons, price details, sticky "Place order" | `useCart`, `useUpdateCartLine`, `useRemoveCartLine`, `useCoupons`, `useApplyCoupon` |
| `(tabs)/account` | User card, orders, wishlist, notifications, addresses, payments, help, log out | `useMe`, `useOrders`, `useAddresses`, `useSignOut` |
| `search` | Autofocused box, live suggestions (query, category, brand, product kinds, matched text bold), recent and trending searches | `useSearchSuggestions` (debounced) |
| `products` | Listing grid (2 columns, infinite scroll), result count, sticky Sort / Filter bar, quick chips, filter sheet (price range, brand, rating, discount) and sort sheet | `useProducts(query)` |
| `product/[id]` | Gallery with dots and wishlist/share, brand, title, rating summary, price with MRP and %, variant pickers (color swatches, size / storage), pincode delivery check, offers, highlights, specs, rating breakdown and top reviews, similar products, sticky Add to cart / Buy now | `useProduct`, `useDeliveryEstimate`, `useSetCartItem`, `useProducts` (similar) |
| `reviews/[id]` | All reviews with breakdown and sort | `useReviews` |
| `checkout` | Steps (Address, Order summary, Payment), address card + sheet, delivery date per item, offers and coupon, payment method sheet, price details, secure-payment and returns notes, "Place order" | `useCart`, `useAddresses`, `useCoupons`, `useDeliveryEstimate`, `usePlaceOrder` |
| `order-confirmed/[id]` | Success, order number, delivery date, items, "Track order" / "Continue shopping" | `useOrder` |
| `orders` | Orders list with status and delivery line | `useOrders('cartly')` |
| `order/[id]` | Shipment tracking steps (live over SSE), items, address, payment, price details, cancel, return, invoice note | `useOrderStream`, `useCancelOrder` |
| `return/[id]` | Return flow: pick items, reason, comment, refund to original payment, pickup date, confirmation | `useOrder`, `useRequestReturn` |
| `notifications` | Order, offer, price-drop and system notices, mark all read | `useNotifications('cartly')`, `useMarkNotificationsRead` |

## App components (`src/components`)
ProductCard (+ skeleton, grid and rail sizes, wishlist toggle), DealCard,
HeroBanner, ProductParts (VariantPicker, PincodeCheck, ReviewCard),
FilterSheets (FilterSheet, SortSheet), CartLineCard, CartButton, OrderCard,
Section (+ DeliverTo).

## App logic (`src/lib`, unit tested)
- `filters.ts`: filter state <-> `ProductQuery`, active filter count, chips,
  price buckets, sort labels; route params -> query.
- `links.ts`: banner / notification links to routes (`/sale`, `/gifts`,
  `/category/x`, `/orders/x`, `/wishlist`).
- `variants.ts`: default selection, price with deltas, labels, availability.
- `search.ts`: recent searches list (dedupe, cap), highlight match ranges.
- `returns.ts`: return reasons, refund amount for selected lines.
- `payment.ts`: Cartly payment options (UPI, card, wallet, pay on delivery).
- `orders.ts`: status tone, delivery line ("Arriving by Tue, 4 Nov"), order filters.
- `price.ts`: "Price details" rows (MRP total, discount, coupon, delivery, total).
- `dates.ts`: short dates, date-times and "3h ago".
- `useDeliveryAddress`, `useRecentSearches`: session address and recent searches.

## Shared pieces to add (with tests)
Moved out of Platter so both apps use one copy (Platter is updated):
- `@pro/api`: `SessionProvider` / `useSession` (token persistence with an
  injected storage), address helpers (`addressLine`, `defaultAddress`,
  `asDefault`), phone helpers (`formatPhone`, `isValidPhone`).
- `@pro/ui`: `ErrorState` (was Platter's QueryError), `AddressSheet`,
  `PaymentSheet` (options passed in), `CouponSheet` (coupons passed in),
  `useDebounced`.

New:
- `@pro/api`: `returnableLines(order)` (lines without a return yet),
  `unreadCount(notifications)`.
- `@pro/ui`: `ProgressBar` (deal claimed), `Stars` (read-only star row),
  `RatingBreakdown` (5 to 1 bars), `SectionHeader` (title, subtitle,
  "See all"), `BottomBar` (sticky footer with safe-area inset),
  `theme.onTone(tone)` (dark or light text over an art gradient, by contrast).

## Verification
Each screen in headless Chromium (393x852, DPR 3) against the PRD; final
screenshots in `screenshots/`; `npm run check` green for the workspace.
