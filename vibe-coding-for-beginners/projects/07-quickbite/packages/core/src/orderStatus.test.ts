import { describe, expect, it } from 'vitest';
import { canTransition, nextTrackingStatus } from './orderStatus';

describe('order status machine', () => {
  it('allows the happy path', () => {
    expect(canTransition('pending_payment', 'placed')).toBe(true);
    expect(nextTrackingStatus('placed')).toBe('accepted');
    expect(nextTrackingStatus('out_for_delivery')).toBe('delivered');
    expect(nextTrackingStatus('delivered')).toBeNull();
  });

  it('blocks skipping steps and reviving finished orders', () => {
    expect(canTransition('pending_payment', 'delivered')).toBe(false);
    expect(canTransition('delivered', 'placed')).toBe(false);
    expect(canTransition('expired', 'placed')).toBe(false);
  });
});
