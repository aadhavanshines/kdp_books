/** Points on the Northbay map, in map units (the city is 1000 x 1000). */
export interface MapPoint {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MAP_SIZE = 1000;

const distance = (a: MapPoint, b: MapPoint) => Math.hypot(b.x - a.x, b.y - a.y);

export function routeLength(route: readonly MapPoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += distance(route[i - 1]!, route[i]!);
  return total;
}

/**
 * The point a fraction `progress` (0 to 1) of the way along a polyline,
 * measured by distance, with the heading in degrees (0 = east, 90 = south).
 */
export function pointAlongRoute(
  route: readonly MapPoint[],
  progress: number,
): MapPoint & { heading: number; segment: number } {
  if (route.length === 0) return { x: 0, y: 0, heading: 0, segment: 0 };
  if (route.length === 1) return { ...route[0]!, heading: 0, segment: 0 };
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const target = routeLength(route) * p;
  let walked = 0;
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]!;
    const b = route[i]!;
    const len = distance(a, b);
    const heading = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    if (walked + len >= target || i === route.length - 1) {
      const t = len === 0 ? 0 : Math.min(1, (target - walked) / len);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading, segment: i - 1 };
    }
    walked += len;
  }
  // Unreachable: the loop always returns on the last segment.
  return { ...route[route.length - 1]!, heading: 0, segment: route.length - 2 };
}

/** The route split at `progress`: the part already travelled and the rest. */
export function splitRoute(route: readonly MapPoint[], progress: number): [MapPoint[], MapPoint[]] {
  if (route.length < 2) return [[...route], [...route]];
  const at = pointAlongRoute(route, progress);
  const point = { x: at.x, y: at.y };
  const done = [...route.slice(0, at.segment + 1), point];
  const rest = [point, ...route.slice(at.segment + 1)];
  return [done, rest];
}

/**
 * A view box around `points` with `padding` map units, widened or heightened
 * to exactly match `aspect` (width / height), so map units scale linearly
 * to pixels in both directions.
 */
export function fitViewBox(points: readonly MapPoint[], aspect: number, padding = 60, minSize = 240): ViewBox {
  if (points.length === 0 || !(aspect > 0)) return { x: 0, y: 0, width: MAP_SIZE, height: MAP_SIZE };
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  let minX = Math.min(...xs) - padding;
  let maxX = Math.max(...xs) + padding;
  let minY = Math.min(...ys) - padding;
  let maxY = Math.max(...ys) + padding;
  // Never zoom in tighter than `minSize` map units.
  if (maxX - minX < minSize) {
    const c = (minX + maxX) / 2;
    minX = c - minSize / 2;
    maxX = c + minSize / 2;
  }
  if (maxY - minY < minSize) {
    const c = (minY + maxY) / 2;
    minY = c - minSize / 2;
    maxY = c + minSize / 2;
  }
  let width = maxX - minX;
  let height = maxY - minY;
  if (width / height > aspect) {
    const newHeight = width / aspect;
    minY -= (newHeight - height) / 2;
    height = newHeight;
  } else {
    const newWidth = height * aspect;
    minX -= (newWidth - width) / 2;
    width = newWidth;
  }
  return { x: minX, y: minY, width, height };
}

/** Map units to pixels inside a view of `size` showing `box`. */
export function toPixels(point: MapPoint, box: ViewBox, size: { width: number; height: number }): MapPoint {
  return {
    x: ((point.x - box.x) / box.width) * size.width,
    y: ((point.y - box.y) / box.height) * size.height,
  };
}
