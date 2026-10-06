export type MenuItem = { id: string; restaurantId: string; pricePaise: number; available: boolean };
export type CartLine = { itemId: string; quantity: number };
export type BillInput = {
  cart: CartLine[];
  menu: MenuItem[];
  distanceKm: number;
  couponCode?: string;
  isFirstOrder: boolean;
  orderTime: Date;
};
export type Bill = {
  itemTotal: number; discount: number; deliveryFee: number;
  smallOrderFee: number; lateNightFee: number;
  gstOnFood: number; gstOnFees: number; grandTotal: number;
  couponError?: 'INVALID_CODE' | 'NOT_ELIGIBLE' | 'MIN_ORDER';
};

const RUPEE = 100;

export function computeBill(input: BillInput): Bill {
  if (input.cart.length === 0) throw new Error('EMPTY_CART');

  let itemTotal = 0;
  const restaurants = new Set<string>();
  for (const line of input.cart) {
    const item = input.menu.find((m) => m.id === line.itemId);
    if (!item) throw new Error('UNKNOWN_ITEM');
    if (!item.available) throw new Error('ITEM_UNAVAILABLE');
    if (line.quantity < 1 || line.quantity > 20) throw new Error('BAD_QUANTITY');
    restaurants.add(item.restaurantId);
    itemTotal += item.pricePaise * line.quantity;
  }
  if (restaurants.size > 1) throw new Error('MIXED_RESTAURANTS');

  if (input.distanceKm > 7) throw new Error('TOO_FAR');
  let deliveryFee = 25 * RUPEE;
  if (input.distanceKm > 3) deliveryFee += 8 * RUPEE * Math.round(input.distanceKm - 3);

  const smallOrderFee = itemTotal < 149 * RUPEE ? 20 * RUPEE : 0;

  let discount = 0;
  let couponError: Bill['couponError'];
  const code = (input.couponCode ?? '').toUpperCase();
  if (code === 'WELCOME50') {
    if (!input.isFirstOrder) couponError = 'NOT_ELIGIBLE';
    else if (itemTotal < 149 * RUPEE) couponError = 'MIN_ORDER';
    else discount = Math.min(Math.round(itemTotal / 2), 100 * RUPEE);
  } else if (code === 'FLAT75') {
    if (itemTotal < 399 * RUPEE) couponError = 'MIN_ORDER';
    else discount = 75 * RUPEE;
  } else if (code === 'FREEDEL') {
    if (itemTotal < 199 * RUPEE) couponError = 'MIN_ORDER';
    else deliveryFee = 0;
  } else if (code !== '') {
    couponError = 'INVALID_CODE';
  }
  discount = Math.min(discount, itemTotal);

  if (itemTotal - discount >= 499 * RUPEE) deliveryFee = 0;

  const hour = input.orderTime.getHours();
  const lateNightFee = hour >= 23 || hour <= 5 ? 15 * RUPEE : 0;

  const gstOnFood = Math.floor((itemTotal - discount) * 0.05);
  const gstOnFees = Math.round((deliveryFee + smallOrderFee + lateNightFee) * 0.18);
  const grandTotal = itemTotal - discount + deliveryFee + smallOrderFee + lateNightFee + gstOnFood + gstOnFees;

  return {
    itemTotal, discount, deliveryFee, smallOrderFee, lateNightFee,
    gstOnFood, gstOnFees, grandTotal,
    ...(couponError ? { couponError } : {}),
  };
}
