import type { Bill, OrderLine } from '@pro/api';
import { shortDate } from '@pro/ui';

import { deliveryLine, matchesFilter, statusTone } from './orders';
import { paymentChoices, paymentLabel, paymentOption } from './payment';
import { priceDetails } from './price';
import { canSubmitReturn, refundTotal, toggleId } from './returns';

const bill: Bill = {
  itemTotal: 21498,
  mrpTotal: 31998,
  deliveryFee: 0,
  deliveryFeeWaived: 40,
  platformFee: 0,
  handlingFee: 0,
  smallCartFee: 0,
  taxes: 0,
  couponDiscount: 500,
  tip: 0,
  total: 20998,
  savings: 11040,
};

describe('price details', () => {
  it('shows MRP, discount, coupon, free delivery and total', () => {
    expect(priceDetails(bill, 2, 'CARTLY10')).toEqual([
      { key: 'mrp', label: 'Price (2 items)', amount: 31998 },
      { key: 'discount', label: 'Discount', amount: -10500, tone: 'discount' },
      { key: 'coupon', label: 'Coupon (CARTLY10)', amount: -500, tone: 'discount' },
      { key: 'delivery', label: 'Delivery charges', amount: 0, waivedAmount: 40 },
      { key: 'total', label: 'Total amount', amount: 20998, tone: 'total' },
    ]);
  });

  it('charges delivery on small orders and skips empty discounts', () => {
    const small = { ...bill, itemTotal: 299, mrpTotal: 299, couponDiscount: 0, deliveryFee: 40, deliveryFeeWaived: 0, total: 339 };
    expect(priceDetails(small, 1).map((r) => [r.label, r.amount, r.waivedAmount])).toEqual([
      ['Price (1 item)', 299, undefined],
      ['Delivery charges', 40, undefined],
      ['Total amount', 339, undefined],
    ]);
  });
});

describe('payment', () => {
  it('turns off pay on delivery where it is not offered', () => {
    expect(paymentChoices(true).find((p) => p.id === 'cod')?.disabled).toBeUndefined();
    const cod = paymentChoices(false).find((p) => p.id === 'cod');
    expect(cod?.disabled).toBe(true);
    expect(cod?.subtitle).toBe('Not available for this pincode');
  });

  it('labels the chosen method', () => {
    expect(paymentLabel(paymentOption('upi'))).toBe('UPI · riya@okaxis.example');
    expect(paymentLabel(paymentOption('cod'))).toBe('Pay on delivery');
    expect(paymentOption('nope').id).toBe('upi');
  });
});

describe('returns', () => {
  const line = (id: string, lineTotal: number): OrderLine => ({
    id,
    productId: id,
    name: id,
    art: 'package',
    quantity: 1,
    unitPrice: lineTotal,
    lineTotal,
    optionsLabel: null,
    isVeg: null,
  });

  it('sums the refund for the chosen lines', () => {
    expect(refundTotal({ items: [line('l1', 999), line('l2', 1499)] }, ['l2'])).toBe(1499);
    expect(refundTotal({ items: [line('l1', 999)] }, [])).toBe(0);
  });

  it('needs at least one item and a reason', () => {
    expect(canSubmitReturn(['l1'], 'Size or fit is not right')).toBe(true);
    expect(canSubmitReturn([], 'Size or fit is not right')).toBe(false);
    expect(canSubmitReturn(['l1'], null)).toBe(false);
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('orders', () => {
  it('colors statuses', () => {
    expect(statusTone('delivered')).toBe('success');
    expect(statusTone('cancelled')).toBe('danger');
    expect(statusTone('shipped')).toBe('info');
    expect(statusTone('confirmed')).toBe('warning');
  });

  it('describes delivery', () => {
    const placedAt = '2026-10-20T06:00:00.000Z';
    expect(deliveryLine({ status: 'delivered', placedAt, deliveredAt: '2026-10-25T06:00:00.000Z' })).toBe(`Delivered on ${shortDate('2026-10-25T06:00:00.000Z')}`);
    expect(deliveryLine({ status: 'cancelled', placedAt, deliveredAt: null })).toBe(`Cancelled on ${shortDate(placedAt)}`);
    expect(deliveryLine({ status: 'out_for_delivery', placedAt, deliveredAt: null })).toBe('Out for delivery: arriving today');
    expect(deliveryLine({ status: 'shipped', placedAt, deliveredAt: null, etaAt: '2026-11-04T06:00:00.000Z' })).toBe(`Arriving by ${shortDate('2026-11-04T06:00:00.000Z')}`);
    expect(deliveryLine({ status: 'confirmed', placedAt, deliveredAt: null })).toBe(`Ordered on ${shortDate(placedAt)}`);
    expect(deliveryLine({ status: 'packed', statusLabel: 'Packed', placedAt, deliveredAt: null })).toBe('Packed · arriving soon');
  });
});

describe('order filters', () => {
  it('groups orders by state', () => {
    expect(matchesFilter({ status: 'shipped' }, 'active')).toBe(true);
    expect(matchesFilter({ status: 'delivered' }, 'active')).toBe(false);
    expect(matchesFilter({ status: 'delivered' }, 'delivered')).toBe(true);
    expect(matchesFilter({ status: 'cancelled' }, 'all')).toBe(true);
  });
});
