import type { MapPoint } from '@pro/api/types';

/**
 * Northbay geometry, matching the map drawn by @pro/ui's MapView: the city
 * is 1000 x 1000 map units, streets run every 100 units, and the bay is
 * along the top (y < 200). 1000 units is 6 km.
 */
export const GRID = 100;
export const KM_PER_UNIT = 0.006;

export const LOCALITIES: Record<string, MapPoint & { pincode: string }> = {
  'Lake View': { x: 400, y: 500, pincode: '560101' },
  'Harbour Side': { x: 200, y: 200, pincode: '560102' },
  'Old Market': { x: 500, y: 300, pincode: '560103' },
  'Cedar Park': { x: 700, y: 500, pincode: '560104' },
  'Lighthouse Point': { x: 900, y: 200, pincode: '560105' },
  'Mill Road': { x: 300, y: 700, pincode: '560106' },
  Bayfront: { x: 600, y: 200, pincode: '560107' },
  Hillcrest: { x: 800, y: 800, pincode: '560108' },
  'Station Square': { x: 500, y: 800, pincode: '560109' },
  'Garden Colony': { x: 200, y: 900, pincode: '560110' },
};

export function snapToGrid(p: MapPoint): MapPoint {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  return { x: clamp(Math.round(p.x / GRID) * GRID, 100, 900), y: clamp(Math.round(p.y / GRID) * GRID, 200, 900) };
}

/**
 * A street route between two intersections: along the origin's avenue to a
 * cross street half way, across, then down the destination's avenue.
 */
export function streetRoute(from: MapPoint, to: MapPoint): MapPoint[] {
  const a = snapToGrid(from);
  const b = snapToGrid(to);
  const midY = Math.round((a.y + b.y) / 2 / GRID) * GRID;
  const points = [a, { x: a.x, y: midY }, { x: b.x, y: midY }, b];
  return points.filter((p, i) => i === 0 || p.x !== points[i - 1]!.x || p.y !== points[i - 1]!.y);
}

export function routeLength(route: readonly MapPoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += Math.hypot(route[i]!.x - route[i - 1]!.x, route[i]!.y - route[i - 1]!.y);
  return total;
}

export function distanceKm(from: MapPoint, to: MapPoint): number {
  return Math.round(routeLength(streetRoute(from, to)) * KM_PER_UNIT * 10) / 10;
}

/** Same as @pro/ui's pointAlongRoute: the point a fraction of the way along. */
export function pointAlong(route: readonly MapPoint[], progress: number): MapPoint {
  if (route.length === 0) return { x: 0, y: 0 };
  const p = Math.min(1, Math.max(0, progress));
  const target = routeLength(route) * p;
  let walked = 0;
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]!;
    const b = route[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (walked + len >= target) {
      const t = len === 0 ? 0 : (target - walked) / len;
      return { x: Math.round((a.x + (b.x - a.x) * t) * 10) / 10, y: Math.round((a.y + (b.y - a.y) * t) * 10) / 10 };
    }
    walked += len;
  }
  return { ...route[route.length - 1]! };
}

/** Delivery window for a restaurant at `km`: cooking time plus riding time. */
export function deliveryWindow(km: number, prepMinutes = 14): { min: number; max: number } {
  const min = Math.round(prepMinutes + km * 3.5);
  return { min, max: min + 5 + Math.round(km) };
}
