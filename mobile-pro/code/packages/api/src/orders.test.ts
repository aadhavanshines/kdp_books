import { orderProgress, returnableLines, returnForLine, unreadCount } from './orders';
import type { OrderLine, OrderStatus, OrderStep, ReturnRequest } from './types';

const statuses: OrderStatus[] = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered'];
function timeline(doneCount: number, extra: OrderStep[] = []): OrderStep[] {
  return [
    ...statuses.map((status, i) => ({ status, label: status, description: '', at: i < doneCount ? 'x' : null, done: i < doneCount })),
    ...extra,
  ];
}

describe('orderProgress', () => {
  it('points at the current status while the order is live', () => {
    expect(orderProgress({ status: 'preparing', timeline: timeline(2) })).toEqual({
      current: 1,
      isActive: true,
      isDelivered: false,
      isCancelled: false,
      isMoving: false,
    });
  });

  it('marks the rider as moving once on the way', () => {
    const p = orderProgress({ status: 'on_the_way', timeline: timeline(4) });
    expect(p.current).toBe(3);
    expect(p.isMoving).toBe(true);
  });

  it('completes every step once delivered', () => {
    const p = orderProgress({ status: 'delivered', timeline: timeline(5) });
    expect(p).toMatchObject({ current: 5, isActive: false, isDelivered: true });
  });

  it('stops at the last done step when cancelled', () => {
    const cancelled: OrderStep = { status: 'cancelled', label: 'Cancelled', description: '', at: 'x', done: true };
    const p = orderProgress({ status: 'cancelled', timeline: timeline(2, [cancelled]) });
    expect(p).toMatchObject({ current: 2, isActive: false, isCancelled: true, isMoving: false });
  });
});

describe('returns and notifications', () => {
  const line = (id: string): OrderLine => ({
    id,
    productId: `p-${id}`,
    name: `Item ${id}`,
    art: 'package',
    quantity: 1,
    unitPrice: 100,
    lineTotal: 100,
    optionsLabel: null,
    isVeg: null,
  });
  const ret: ReturnRequest = {
    id: 'ret1',
    lineIds: ['l2'],
    reason: 'Size too small',
    comment: null,
    status: 'pickup_scheduled',
    refundAmount: 100,
    pickupDate: '2026-11-02T10:00:00.000Z',
    createdAt: '2026-11-01T10:00:00.000Z',
  };

  it('lists the lines that can still be returned', () => {
    const order = { items: [line('l1'), line('l2'), line('l3')], returns: [ret] };
    expect(returnableLines(order).map((l) => l.id)).toEqual(['l1', 'l3']);
    expect(returnableLines({ items: [line('l2')], returns: [ret] })).toEqual([]);
  });

  it('finds the return that covers a line', () => {
    expect(returnForLine({ returns: [ret] }, 'l2')?.id).toBe('ret1');
    expect(returnForLine({ returns: [ret] }, 'l1')).toBeUndefined();
  });

  it('counts unread notifications', () => {
    expect(unreadCount([{ isRead: false }, { isRead: true }, { isRead: false }])).toBe(2);
    expect(unreadCount(undefined)).toBe(0);
  });
});
