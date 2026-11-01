import { order } from '../test/fixtures';
import { formatOrderDate, itemCountLabel, trackingCopy } from './tracking';

describe('trackingCopy', () => {
  it('names the restaurant while the food is being made', () => {
    expect(trackingCopy(order('confirmed'))).toEqual({
      title: 'Order confirmed',
      subtitle: 'Saffron Courtyard has accepted your order',
      etaMinutes: 12,
    });
    expect(trackingCopy(order('preparing')).subtitle).toBe('Saffron Courtyard is cooking it fresh');
    expect(trackingCopy(order('picked_up')).title).toBe('Rider has your order');
  });

  it('counts down with the live ETA once the rider is moving', () => {
    expect(trackingCopy(order('on_the_way'))).toEqual({ title: 'Arriving in 12 mins', subtitle: 'Arjun is on the way to you', etaMinutes: 12 });
    expect(trackingCopy(order('on_the_way'), 1).title).toBe('Arriving in 1 min');
    expect(trackingCopy(order('on_the_way'), 0).etaMinutes).toBe(1);
  });

  it('stops counting when delivered or cancelled', () => {
    expect(trackingCopy(order('delivered'))).toMatchObject({ title: 'Order delivered', etaMinutes: null });
    expect(trackingCopy(order('cancelled'))).toMatchObject({ title: 'Order cancelled', etaMinutes: null });
  });
});

describe('dates', () => {
  it('says Today and Yesterday for recent orders', () => {
    const now = new Date(2026, 10, 1, 21, 0).getTime();
    expect(formatOrderDate(new Date(2026, 10, 1, 20, 15).toISOString(), now)).toMatch(/^Today, 8:15 pm$/);
    expect(formatOrderDate(new Date(2026, 9, 31, 9, 5).toISOString(), now)).toMatch(/^Yesterday, 9:05 am$/);
    expect(formatOrderDate(new Date(2026, 9, 28, 13, 0).toISOString(), now)).toMatch(/^28 Oct, 1:00 pm$/);
  });

  it('pluralises item counts', () => {
    expect(itemCountLabel(1)).toBe('1 item');
    expect(itemCountLabel(3)).toBe('3 items');
  });
});
