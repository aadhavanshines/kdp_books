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
  },
  {
    id: 'card',
    input: { kind: 'card', cardLast4: '4242' },
    title: 'Credit card',
    subtitle: 'Northbay Bank •••• 4242',
    icon: { name: 'card-outline' },
  },
  {
    id: 'cash',
    input: { kind: 'cash' },
    title: 'Cash on delivery',
    subtitle: 'Pay with cash or UPI at your door',
    icon: { name: 'cash-outline' },
  },
];

export function paymentOption(id: string): PaymentOption {
  return PAYMENT_OPTIONS.find((p) => p.id === id) ?? PAYMENT_OPTIONS[0]!;
}

/** Short label for the pay bar: "UPI · riya@okaxis.example". */
export function paymentLabel(option: PaymentOption): string {
  return option.input.kind === 'cash' ? 'Cash on delivery' : `${option.title} · ${option.subtitle}`;
}
