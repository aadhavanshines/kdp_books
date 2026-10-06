export function computeBill(i: any) {
  if (!i.cart.length) throw new Error('EMPTY_CART');
  const byId = new Map(i.menu.map((m: any) => [m.id, m]));
  let itemTotal = 0; const rs = new Set();
  for (const l of i.cart) {
    const m: any = byId.get(l.itemId);
    if (!m) throw new Error('UNKNOWN_ITEM');
    if (!m.available) throw new Error('ITEM_UNAVAILABLE');
    if (!Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > 20) throw new Error('BAD_QUANTITY');
    rs.add(m.restaurantId); itemTotal += m.pricePaise * l.quantity;
  }
  if (rs.size > 1) throw new Error('MIXED_RESTAURANTS');
  const d = i.distanceKm; if (d > 7) throw new Error('TOO_FAR');
  let deliveryFee = itemTotal >= 49900 ? 0 : d <= 3 ? 2500 : 2500 + 800 * Math.ceil(d - 3);
  const smallOrderFee = itemTotal < 14900 ? 2000 : 0;
  const code = (i.couponCode ?? '').trim().toUpperCase(); let discount = 0; let couponError;
  if (code === 'WELCOME50') { if (!i.isFirstOrder) couponError = 'NOT_ELIGIBLE'; else if (itemTotal < 14900) couponError = 'MIN_ORDER'; else discount = Math.min(Math.floor(itemTotal / 2), 10000); }
  else if (code === 'FLAT75') { if (itemTotal < 39900) couponError = 'MIN_ORDER'; else discount = Math.min(7500, itemTotal); }
  else if (code === 'FREEDEL') { if (itemTotal < 19900) couponError = 'MIN_ORDER'; else deliveryFee = 0; }
  else if (code) couponError = 'INVALID_CODE';
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(i.orderTime));
  const lateNightFee = h >= 23 || h <= 5 ? 1500 : 0;
  const gstOnFood = Math.floor(((itemTotal - discount) * 5 + 50) / 100);
  const gstOnFees = Math.floor(((deliveryFee + smallOrderFee + lateNightFee) * 18 + 50) / 100);
  const grandTotal = itemTotal - discount + deliveryFee + smallOrderFee + lateNightFee + gstOnFood + gstOnFees;
  return { itemTotal, discount, deliveryFee, smallOrderFee, lateNightFee, gstOnFood, gstOnFees, grandTotal, ...(couponError ? { couponError } : {}) };
}
