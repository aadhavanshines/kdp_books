# QuickBite billing rules

Implement `computeBill` in `src/bill.ts`. All money is in **paise**
(1 rupee = 100 paise), as integers.

```ts
export type MenuItem = { id: string; restaurantId: string; pricePaise: number; available: boolean };
export type CartLine = { itemId: string; quantity: number };
export type BillInput = {
  cart: CartLine[];
  menu: MenuItem[];          // the source of truth for prices
  distanceKm: number;        // from restaurant to customer
  couponCode?: string;
  isFirstOrder: boolean;
  orderTime: Date;           // the moment the order is placed
};
export type Bill = {
  itemTotal: number; discount: number; deliveryFee: number;
  smallOrderFee: number; lateNightFee: number;
  gstOnFood: number; gstOnFees: number; grandTotal: number;
  couponError?: 'INVALID_CODE' | 'NOT_ELIGIBLE' | 'MIN_ORDER';
};
export function computeBill(input: BillInput): Bill;
```

1. **Items.** Item total is the sum of menu price x quantity. Throw
   `Error('UNKNOWN_ITEM')` for an item not on the menu,
   `Error('ITEM_UNAVAILABLE')` for an unavailable item,
   `Error('BAD_QUANTITY')` unless the quantity is a whole number from
   1 to 20, `Error('MIXED_RESTAURANTS')` if the cart has items from
   more than one restaurant, and `Error('EMPTY_CART')` for an empty
   cart. The same item may appear on several lines; add them up.
2. **Delivery fee.** Up to and including 3 km: Rs 25. Over 3 km and up
   to and including 7 km: Rs 25 plus Rs 8 for every started kilometre
   beyond 3 (so 3.2 km costs Rs 33). Over 7 km: throw
   `Error('TOO_FAR')`. Delivery is free when the item total (before
   any discount) is Rs 499 or more.
3. **Small order fee.** Rs 20 when the item total is below Rs 149.
4. **Coupons.** Codes ignore case and surrounding spaces.
   - `WELCOME50`: 50% off the item total, at most Rs 100; first order
     only (otherwise `NOT_ELIGIBLE`); item total at least Rs 149
     (otherwise `MIN_ORDER`).
   - `FLAT75`: Rs 75 off; item total at least Rs 399 (`MIN_ORDER`).
   - `FREEDEL`: the delivery fee becomes 0; item total at least
     Rs 199 (`MIN_ORDER`).
   - Any other non-empty code: `INVALID_CODE`.
   A coupon that fails gives no benefit and sets `couponError`; the
   bill is still calculated. The discount never exceeds the item total.
   50% discounts round down to a whole paisa.
5. **Late-night fee.** Rs 15 when the order time, in India time
   (Asia/Kolkata), is from 23:00 up to and including 05:59.
6. **Taxes.** GST on food is 5% of (item total - discount). GST on fees
   is 18% of (delivery fee + small order fee + late-night fee). Round
   each tax to the nearest paisa, halves rounding up.
7. **Grand total** = item total - discount + delivery fee + small order
   fee + late-night fee + GST on food + GST on fees.
