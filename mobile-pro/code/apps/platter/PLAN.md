# Platter: build plan

Food delivery app from `docs/PRD.md` section 1. Brand `platter` in `@pro/ui`,
data from `@pro/api` (every endpoint and hook it needs already exists).

## Routes (Expo Router, `src/app`)

| Route | Screen | Data |
| --- | --- | --- |
| `_layout` | Providers (theme, safe area, API, toasts), fonts, auth gate | token in AsyncStorage, `useMe` |
| `login` | Phone, then 6-digit OTP | `useRequestOtp`, `useVerifyOtp` |
| `(tabs)/_layout` | Home, Search, Orders, Profile tab bar | `useCart` (badge) |
| `(tabs)/index` | Home: address header, search button, promo carousel, cuisine row, filter chips, restaurant cards, cart bar | `usePlatterHome`, `useRestaurants(filters)`, `useAddresses`, `useCart` |
| `(tabs)/search` | Search box, cuisine suggestions, restaurant + dish results, filter chips from banner links (`?cuisine=`, `?offers=1`) | `usePlatterSearch`, `useRestaurants` |
| `(tabs)/orders` | Active and past orders, reorder/rate/track | `useOrders('platter')` |
| `(tabs)/profile` | User card, addresses, payments, help, log out | `useMe`, `useAddresses`, `useSignOut` |
| `restaurant/[id]` | Header, rating card, offers strip, veg filter, menu by category (ADD steppers), customization sheet, replace-cart sheet, cart bar | `useRestaurant`, `useCart`, `useSetCartItem` |
| `cart` | Lines, coupons sheet, tip, bill details, address and payment sheets, Place order | `useCart`, `useCoupons`, `useApplyCoupon`, `useRemoveCoupon`, `useSetTip`, `useAddresses`, `usePlaceOrder` |
| `order/[id]` | Tracking: SVG map with moving rider, ETA, status timeline, rider card, call/support, bill | `useOrderStream` (SSE) |
| `rate/[id]` | Stars, quick tags, comment | `useOrder`, `useRateOrder` |

## App components (`src/components`)
RestaurantCard (+ skeleton), PromoCarousel slide, MenuItemRow, CustomizeSheet,
ReplaceCartSheet, CouponSheet, AddressSheet, PaymentSheet, RiderCard,
OrderCard, QueryError (error state with retry).

## App logic (`src/lib`, unit tested)
- `customize.ts`: default selections, validation (required / max), unit price.
- `filters.ts`: home filter chips to `RestaurantQuery`; banner links to routes.
- `tracking.ts`: headline / ETA copy for each order status.
- `payment.ts`: payment options and labels.

## Missing from the shared packages (add there, with tests)
`@pro/ui`
- `CartBar`: floating "N items | ₹total  View cart" bar (Minutely needs it too).
- `BillDetails`: label / amount rows with strike-through, discount and total.
- `TipSelector`: tip amount chips with a custom amount.
- `OtpInput`: 6-box code entry (every app logs in with OTP).
- `OptionRow`: radio / checkbox row for sheets (customizations, payment, address).
- `StarRatingInput`: tap-to-rate stars.
- `Carousel`: paging carousel with dots (Cartly gallery needs it too).
- `ScreenHeader`: back button, title, subtitle, trailing actions.

`@pro/api`
- `billLines(bill)`: which bill rows to show and how (shared by all commerce apps).
- `orderProgress(order)`: current timeline index, active / finished flags.
- Token persistence stays in the app (AsyncStorage), using `onTokenChange`.
