import { describe, expect, it } from 'vitest';

import { progressAt, scheduleFor, statusAt } from '../sim/schedule';
import { deliveryWindow, distanceKm, pointAlong, routeLength, snapToGrid, streetRoute } from './geo';

describe('Northbay geometry', () => {
  it('routes along streets with right-angle turns', () => {
    const route = streetRoute({ x: 200, y: 300 }, { x: 700, y: 800 });
    expect(route[0]).toEqual({ x: 200, y: 300 });
    expect(route[route.length - 1]).toEqual({ x: 700, y: 800 });
    for (let i = 1; i < route.length; i++) {
      const a = route[i - 1]!;
      const b = route[i]!;
      expect(a.x === b.x || a.y === b.y).toBe(true);
      expect(b.x % 100).toBe(0);
      expect(b.y % 100).toBe(0);
    }
    expect(routeLength(route)).toBe(1000);
    expect(distanceKm({ x: 200, y: 300 }, { x: 700, y: 800 })).toBe(6);
  });

  it('snaps points onto the street grid inside the city', () => {
    expect(snapToGrid({ x: 433, y: 40 })).toEqual({ x: 400, y: 200 });
  });

  it('walks a route by distance', () => {
    const route = [
      { x: 100, y: 200 },
      { x: 100, y: 400 },
      { x: 300, y: 400 },
    ];
    expect(pointAlong(route, 0.75)).toEqual({ x: 200, y: 400 });
    expect(pointAlong(route, 5)).toEqual({ x: 300, y: 400 });
  });

  it('estimates delivery windows from distance', () => {
    expect(deliveryWindow(2)).toEqual({ min: 21, max: 28 });
  });
});

describe('order schedule', () => {
  it('moves through every step and reaches delivered', () => {
    const s = scheduleFor('platter', 1);
    expect(statusAt(s, 0)).toBe('confirmed');
    expect(statusAt(s, 10_000)).toBe('preparing');
    expect(statusAt(s, 40_000)).toBe('on_the_way');
    expect(statusAt(s, 10 * 60_000)).toBe('delivered');
  });

  it('reports rider progress only while moving', () => {
    const s = scheduleFor('minutely', 1);
    expect(progressAt('minutely', s, 5_000)).toBeNull();
    expect(progressAt('minutely', s, 45_000)).toBe(0.5);
    expect(progressAt('minutely', s, 99_000)).toBe(1);
  });

  it('scales with SIM_SPEED', () => {
    expect(scheduleFor('cartly', 2).at(-1)!.offsetMs).toBe(scheduleFor('cartly', 1).at(-1)!.offsetMs / 2);
  });
});
