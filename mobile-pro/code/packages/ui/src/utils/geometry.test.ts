import { fitViewBox, pointAlongRoute, routeLength, splitRoute, toPixels } from './geometry';

const route = [
  { x: 100, y: 200 },
  { x: 100, y: 400 },
  { x: 300, y: 400 },
];

describe('route geometry', () => {
  it('measures a polyline', () => {
    expect(routeLength(route)).toBe(400);
  });

  it('finds points by distance along the route', () => {
    expect(pointAlongRoute(route, 0)).toMatchObject({ x: 100, y: 200, heading: 90 });
    expect(pointAlongRoute(route, 0.25)).toMatchObject({ x: 100, y: 300 });
    expect(pointAlongRoute(route, 0.75)).toMatchObject({ x: 200, y: 400, heading: 0, segment: 1 });
    expect(pointAlongRoute(route, 1)).toMatchObject({ x: 300, y: 400 });
  });

  it('clamps progress and tolerates tiny routes', () => {
    expect(pointAlongRoute(route, 2)).toMatchObject({ x: 300, y: 400 });
    expect(pointAlongRoute(route, -1)).toMatchObject({ x: 100, y: 200 });
    expect(pointAlongRoute(route, Number.NaN)).toMatchObject({ x: 100, y: 200 });
    expect(pointAlongRoute([], 0.5)).toMatchObject({ x: 0, y: 0 });
    expect(pointAlongRoute([{ x: 5, y: 6 }], 0.5)).toMatchObject({ x: 5, y: 6 });
  });

  it('splits the route at the rider', () => {
    const [done, rest] = splitRoute(route, 0.75);
    expect(done).toEqual([
      { x: 100, y: 200 },
      { x: 100, y: 400 },
      { x: 200, y: 400 },
    ]);
    expect(rest).toEqual([
      { x: 200, y: 400 },
      { x: 300, y: 400 },
    ]);
  });
});

describe('fitViewBox', () => {
  it('matches the requested aspect ratio and contains every point', () => {
    const box = fitViewBox(route, 2, 50);
    expect(box.width / box.height).toBeCloseTo(2);
    for (const p of route) {
      expect(p.x).toBeGreaterThanOrEqual(box.x);
      expect(p.x).toBeLessThanOrEqual(box.x + box.width);
      expect(p.y).toBeGreaterThanOrEqual(box.y);
      expect(p.y).toBeLessThanOrEqual(box.y + box.height);
    }
  });

  it('never zooms tighter than the minimum size', () => {
    const box = fitViewBox([{ x: 500, y: 500 }], 1, 0, 240);
    expect(box).toEqual({ x: 380, y: 380, width: 240, height: 240 });
  });

  it('maps map units to pixels linearly', () => {
    const box = { x: 0, y: 0, width: 200, height: 100 };
    expect(toPixels({ x: 100, y: 50 }, box, { width: 400, height: 200 })).toEqual({ x: 200, y: 100 });
  });
});
