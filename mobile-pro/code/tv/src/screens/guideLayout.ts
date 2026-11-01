/** Guide grid geometry: where a programme cell sits on the timeline (canvas units). */
export interface GuideGeometry {
  /** Minutes after midnight at the left edge. */
  start: number;
  /** Minutes shown. */
  span: number;
  /** Width of the timeline area. */
  width: number;
  /** Gap between adjacent cells. */
  gap: number;
}

export function pxPerMinute(g: GuideGeometry): number {
  return g.width / g.span;
}

/** x and width of a cell covering [from, to), clipped to the window. Width 0 when outside. */
export function cellFrame(g: GuideGeometry, from: number, to: number): { x: number; width: number } {
  const a = Math.max(g.start, from);
  const b = Math.min(g.start + g.span, to);
  if (b <= a) return { x: 0, width: 0 };
  const ppm = pxPerMinute(g);
  return { x: (a - g.start) * ppm, width: Math.max(0, (b - a) * ppm - g.gap) };
}

/** x of a moment on the timeline (the now line). */
export function timeX(g: GuideGeometry, minute: number): number {
  return (minute - g.start) * pxPerMinute(g);
}
