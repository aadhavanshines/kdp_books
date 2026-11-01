import type { Bill, CommerceApp } from './types';

/** One row of a bill, ready for display. Amounts are rupees. */
export interface BillLine {
  key: keyof Bill | 'grandTotal';
  label: string;
  /** Signed: negative for discounts. */
  amount: number;
  /** A fee that was waived: show this struck through, then "FREE". */
  waivedAmount?: number;
  /** Small explanation under the label ("Restaurant GST at 5%"). */
  note?: string;
  tone?: 'default' | 'discount' | 'total';
}

export interface BillLinesOptions {
  /** The applied coupon code, shown in the discount row label. */
  couponCode?: string | null;
}

const FEE_NOTES: Partial<Record<CommerceApp, Partial<Record<keyof Bill, string>>>> = {
  platter: {
    deliveryFee: 'Based on distance from the restaurant',
    platformFee: 'Helps us run Platter',
    taxes: 'GST on food at 5%',
  },
  minutely: {
    handlingFee: 'For packing your order with care',
    smallCartFee: 'On orders under ₹99',
  },
};

/**
 * The rows of a bill in display order, as every commerce app shows it: item
 * total, then fees (only the ones that apply), discounts, tip and a total.
 * A waived delivery fee stays visible as a strike-through so the saving is
 * clear; zero-value fees are left out.
 */
export function billLines(bill: Bill, app: CommerceApp, options: BillLinesOptions = {}): BillLine[] {
  const notes = FEE_NOTES[app] ?? {};
  const lines: BillLine[] = [{ key: 'itemTotal', label: 'Item total', amount: bill.itemTotal }];
  const mrpSavings = Math.round((bill.mrpTotal - bill.itemTotal) * 100) / 100;
  if (mrpSavings > 0) lines[0]!.waivedAmount = bill.mrpTotal;

  if (bill.deliveryFee > 0 || bill.deliveryFeeWaived > 0) {
    lines.push({
      key: 'deliveryFee',
      label: app === 'platter' ? 'Delivery partner fee' : 'Delivery fee',
      amount: bill.deliveryFee,
      waivedAmount: bill.deliveryFee === 0 && bill.deliveryFeeWaived > 0 ? bill.deliveryFeeWaived : undefined,
      note: notes.deliveryFee,
    });
  }
  const fees: [keyof Bill, string][] = [
    ['platformFee', 'Platform fee'],
    ['handlingFee', 'Handling fee'],
    ['smallCartFee', 'Small cart fee'],
    ['taxes', app === 'platter' ? 'GST and restaurant charges' : 'Taxes'],
  ];
  for (const [key, label] of fees) {
    const amount = bill[key];
    if (amount > 0) lines.push({ key, label, amount, note: notes[key] });
  }
  if (bill.couponDiscount > 0) {
    lines.push({
      key: 'couponDiscount',
      label: options.couponCode ? `Coupon (${options.couponCode})` : 'Coupon discount',
      amount: -bill.couponDiscount,
      tone: 'discount',
    });
  }
  if (bill.tip > 0) lines.push({ key: 'tip', label: 'Delivery partner tip', amount: bill.tip });
  lines.push({ key: 'grandTotal', label: 'To pay', amount: bill.total, tone: 'total' });
  return lines;
}
