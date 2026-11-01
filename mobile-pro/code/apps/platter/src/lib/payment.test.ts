import { PAYMENT_OPTIONS, paymentLabel, paymentOption } from './payment';

describe('payment', () => {
  it('labels each method for the pay bar', () => {
    expect(PAYMENT_OPTIONS.map((p) => paymentLabel(p))).toEqual([
      'UPI · riya@okaxis.example',
      'Credit card · Northbay Bank •••• 4242',
      'Cash on delivery',
    ]);
    expect(paymentOption('card').input).toEqual({ kind: 'card', cardLast4: '4242' });
    expect(paymentOption('unknown').id).toBe('upi');
  });
});
