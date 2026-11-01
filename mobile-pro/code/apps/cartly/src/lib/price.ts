import type { Bill } from '@pro/api';
import type { BillRow } from '@pro/ui';

/**
 * Cartly's "Price details": MRP total for the items, the product discount,
 * coupon, delivery (struck through when free) and the total.
 */
export function priceDetails(bill: Bill, itemCount: number, couponCode?: string | null): BillRow[] {
  const rows: BillRow[] = [
    { key: 'mrp', label: `Price (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`, amount: bill.mrpTotal },
  ];
  const discount = Math.round((bill.mrpTotal - bill.itemTotal) * 100) / 100;
  if (discount > 0) rows.push({ key: 'discount', label: 'Discount', amount: -discount, tone: 'discount' });
  if (bill.couponDiscount > 0) {
    rows.push({ key: 'coupon', label: couponCode ? `Coupon (${couponCode})` : 'Coupon discount', amount: -bill.couponDiscount, tone: 'discount' });
  }
  const waived = bill.deliveryFee === 0 ? bill.deliveryFeeWaived : 0;
  rows.push({ key: 'delivery', label: 'Delivery charges', amount: bill.deliveryFee, waivedAmount: waived || undefined });
  if (bill.platformFee > 0) rows.push({ key: 'platform', label: 'Platform fee', amount: bill.platformFee });
  if (bill.taxes > 0) rows.push({ key: 'taxes', label: 'Taxes', amount: bill.taxes });
  rows.push({ key: 'total', label: 'Total amount', amount: bill.total, tone: 'total' });
  return rows;
}
