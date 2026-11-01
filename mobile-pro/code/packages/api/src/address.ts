import type { Address, AddressInput } from './types';

/** "Flat 3B, Seabreeze Apartments, 12 Lake View Road". */
export function addressLine(a: Pick<Address, 'line1' | 'line2'>): string {
  return [a.line1, a.line2].filter(Boolean).join(', ');
}

/** The address as an update that makes it the default. */
export function asDefault(a: Address): AddressInput {
  return {
    label: a.label,
    recipient: a.recipient,
    line1: a.line1,
    line2: a.line2,
    landmark: a.landmark,
    locality: a.locality,
    pincode: a.pincode,
    isDefault: true,
  };
}

/** The default address, else the first one. */
export function defaultAddress(addresses: readonly Address[] | undefined): Address | undefined {
  return addresses?.find((a) => a.isDefault) ?? addresses?.[0];
}

/** "+91 98765 43210" from "9876543210". */
export function formatPhone(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`.trim();
}

/** A 10-digit Indian mobile number (starts with 6 to 9). */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** A 6-digit Indian pincode (does not start with 0). */
export function isValidPincode(pincode: string): boolean {
  return /^[1-9]\d{5}$/.test(pincode);
}
