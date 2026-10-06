import type { Address } from '../../backend';

export function formatAddress(a: Address) {
  return [a.line1, a.line2, a.landmark && `Near ${a.landmark}`, a.pincode]
    .filter(Boolean)
    .join(', ');
}
