import type { PaymentInput } from '@pro/api';
import type { PaymentChoice } from '@pro/ui';

export interface PaymentOption extends PaymentChoice {
  input: PaymentInput;
}

/** Demo payment methods (no real payment is taken). */
export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'upi',
    input: { kind: 'upi', upiId: 'riya@okaxis.example' },
    title: 'UPI',
    subtitle: 'riya@okaxis.example',
    icon: { set: 'mci', name: 'contactless-payment' },
    offer: 'Flat ₹25 cashback on UPI orders above ₹999',
  },
  {
    id: 'card',
    input: { kind: 'card', cardLast4: '4242' },
    title: 'Credit or debit card',
    subtitle: 'Northbay Bank •••• 4242',
    icon: { name: 'card-outline' },
    offer: '10% instant discount on Northbay Bank cards',
  },
  {
    id: 'wallet',
    input: { kind: 'wallet' },
    title: 'Northbay Wallet',
    subtitle: 'Balance ₹1,240',
    icon: { name: 'wallet-outline' },
  },
  {
    id: 'cod',
    input: { kind: 'cash' },
    title: 'Pay on delivery',
    subtitle: 'Cash or UPI at your door',
    icon: { name: 'cash-outline' },
  },
];

export function paymentOption(id: string): PaymentOption {
  return PAYMENT_OPTIONS.find((p) => p.id === id) ?? PAYMENT_OPTIONS[0]!;
}

/** The options with pay on delivery turned off where it is not offered. */
export function paymentChoices(cashOnDelivery: boolean): PaymentOption[] {
  return PAYMENT_OPTIONS.map((p) =>
    p.id === 'cod' && !cashOnDelivery ? { ...p, disabled: true, subtitle: 'Not available for this pincode' } : p,
  );
}

/** "UPI · riya@okaxis.example". */
export function paymentLabel(option: PaymentOption): string {
  return option.input.kind === 'cash' ? option.title : `${option.title} · ${option.subtitle}`;
}
