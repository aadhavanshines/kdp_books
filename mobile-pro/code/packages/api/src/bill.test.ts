import { billLines } from './bill';
import type { Bill } from './types';

const base: Bill = {
  itemTotal: 500,
  mrpTotal: 500,
  deliveryFee: 37,
  deliveryFeeWaived: 0,
  platformFee: 6,
  handlingFee: 0,
  smallCartFee: 0,
  taxes: 25,
  couponDiscount: 0,
  tip: 0,
  total: 568,
  savings: 0,
};

describe('billLines', () => {
  it('lists Platter rows in order and leaves out zero fees', () => {
    const lines = billLines(base, 'platter');
    expect(lines.map((l) => l.label)).toEqual([
      'Item total',
      'Delivery partner fee',
      'Platform fee',
      'GST and restaurant charges',
      'To pay',
    ]);
    expect(lines.at(-1)).toMatchObject({ key: 'grandTotal', amount: 568, tone: 'total' });
    expect(lines.find((l) => l.key === 'taxes')?.note).toBe('GST on food at 5%');
  });

  it('shows a coupon as a negative discount with its code, and the tip', () => {
    const lines = billLines({ ...base, couponDiscount: 100, tip: 30, total: 498 }, 'platter', { couponCode: 'WELCOME50' });
    expect(lines.find((l) => l.key === 'couponDiscount')).toEqual({
      key: 'couponDiscount',
      label: 'Coupon (WELCOME50)',
      amount: -100,
      tone: 'discount',
    });
    expect(lines.find((l) => l.key === 'tip')?.amount).toBe(30);
  });

  it('keeps a waived delivery fee visible as a strike-through', () => {
    const lines = billLines({ ...base, deliveryFee: 0, deliveryFeeWaived: 37 }, 'platter');
    expect(lines.find((l) => l.key === 'deliveryFee')).toMatchObject({ amount: 0, waivedAmount: 37 });
  });

  it('strikes the MRP total on the item row when items are discounted', () => {
    const lines = billLines({ ...base, mrpTotal: 620 }, 'minutely');
    expect(lines[0]).toMatchObject({ amount: 500, waivedAmount: 620 });
    expect(lines.find((l) => l.key === 'deliveryFee')?.label).toBe('Delivery fee');
  });

  it('shows only the item total and total for an empty bill', () => {
    const empty: Bill = { ...base, itemTotal: 0, deliveryFee: 0, platformFee: 0, taxes: 0, total: 0 };
    expect(billLines(empty, 'cartly').map((l) => l.key)).toEqual(['itemTotal', 'grandTotal']);
  });
});
