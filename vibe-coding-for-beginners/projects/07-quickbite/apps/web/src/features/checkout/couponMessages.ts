import type { CouponRejection } from '@quickbite/core';
import { formatPrice } from '../../lib/format';

/** Human explanation for why a coupon didn't apply. */
export function couponRejectionMessage(r: CouponRejection | { reason: 'NOT_FOUND' }): string {
  switch (r.reason) {
    case 'MIN_ORDER':
      return `Add items worth ${formatPrice(r.shortBy)} more to use this coupon.`;
    case 'EXPIRED':
      return 'This coupon has expired.';
    case 'NOT_STARTED':
      return 'This coupon isn’t active yet.';
    case 'INACTIVE':
      return 'This coupon is no longer available.';
    case 'WRONG_RESTAURANT':
      return 'This coupon isn’t valid at this restaurant.';
    case 'WRONG_REGION':
      return 'This coupon isn’t valid in your city.';
    case 'USAGE_LIMIT':
      return 'You’ve already used this coupon.';
    case 'NOT_FOUND':
      return 'That code doesn’t exist. Check for typos.';
  }
}
