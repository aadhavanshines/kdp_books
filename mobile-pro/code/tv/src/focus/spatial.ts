/**
 * Spatial navigation: given the focused element's rectangle and the
 * rectangles of every other focusable, pick the one an arrow key should move
 * to. Android TV and tvOS do this natively; the web build uses this module
 * (see webNavigator.ts) so arrow keys behave like a D-pad in a browser.
 *
 * The scoring follows Android's FocusFinder: a candidate must lie in the
 * direction of travel; candidates that overlap the focused element on the
 * other axis (in its "beam") beat those that do not; then the closest wins,
 * weighting distance along the direction of travel far above sideways drift.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Candidate {
  rect: Rect;
  /** The focus group (a row, the rail) the candidate belongs to, if any. */
  group?: string | null;
  /** Preferred entry point of its group when the group has no memory yet. */
  isGroupDefault?: boolean;
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** Arrow key name (KeyboardEvent.key) to direction, or null for other keys. */
export function directionForKey(key: string): Direction | null {
  return KEY_DIRECTIONS[key] ?? null;
}

const right = (r: Rect) => r.x + r.width;
const bottom = (r: Rect) => r.y + r.height;
const centerX = (r: Rect) => r.x + r.width / 2;
const centerY = (r: Rect) => r.y + r.height / 2;

/** Whether `to` lies in direction `dir` from `from` (focused cards may be scaled, so edges can overlap a little). */
export function isInDirection(from: Rect, to: Rect, dir: Direction): boolean {
  switch (dir) {
    case 'right':
      return centerX(to) > centerX(from) && right(to) > right(from);
    case 'left':
      return centerX(to) < centerX(from) && to.x < from.x;
    case 'down':
      return centerY(to) > centerY(from) && bottom(to) > bottom(from);
    case 'up':
      return centerY(to) < centerY(from) && to.y < from.y;
  }
}

/** Whether `to` overlaps `from` on the axis perpendicular to `dir`. */
export function isInBeam(from: Rect, to: Rect, dir: Direction): boolean {
  if (dir === 'left' || dir === 'right') return to.y < bottom(from) && bottom(to) > from.y;
  return to.x < right(from) && right(to) > from.x;
}

/** Lower is better. Infinity when `to` is not in direction `dir`. */
export function score(from: Rect, to: Rect, dir: Direction): number {
  if (!isInDirection(from, to, dir)) return Infinity;
  let major: number;
  let minor: number;
  switch (dir) {
    case 'right':
      major = Math.max(0, to.x - right(from));
      minor = Math.abs(centerY(to) - centerY(from));
      break;
    case 'left':
      major = Math.max(0, from.x - right(to));
      minor = Math.abs(centerY(to) - centerY(from));
      break;
    case 'down':
      major = Math.max(0, to.y - bottom(from));
      minor = Math.abs(centerX(to) - centerX(from));
      break;
    case 'up':
      major = Math.max(0, from.y - bottom(to));
      minor = Math.abs(centerX(to) - centerX(from));
      break;
  }
  const beamPenalty = isInBeam(from, to, dir) ? 0 : 1e9;
  return beamPenalty + 13 * major * major + minor * minor;
}

/** Index of the best candidate in direction `dir`, or -1 when there is none (focus stays put). */
export function findNext(from: Rect, candidates: readonly Rect[], dir: Direction): number {
  let best = -1;
  let bestScore = Infinity;
  candidates.forEach((rect, i) => {
    if (rect.width <= 0 || rect.height <= 0) return;
    const sc = score(from, rect, dir);
    if (sc < bestScore) {
      bestScore = sc;
      best = i;
    }
  });
  return best;
}

/**
 * Like findNext, plus focus-group rules: entering a group with a fixed entry
 * point (the rail's active item) lands there; otherwise a row returns to the
 * card last focused in it (what TVFocusGuideView's `autoFocus` does
 * natively); otherwise plain geometry. A group can also trap directions.
 *
 * `memory` maps a group id to the index (in `candidates`) of its last
 * focused element, when that element still exists.
 */
export function chooseCandidate(
  from: Rect,
  fromGroup: string | null | undefined,
  candidates: readonly Candidate[],
  dir: Direction,
  memory: Readonly<Record<string, number | undefined>> = {},
  /** Directions the focused element's group does not let focus leave by (TVFocusGuideView trapFocus*). */
  trapped: readonly Direction[] = [],
): number {
  const keepInside = !!fromGroup && trapped.includes(dir);
  const geometric = findNext(
    from,
    candidates.map((c) => (keepInside && c.group !== fromGroup ? { ...c.rect, width: 0, height: 0 } : c.rect)),
    dir,
  );
  if (geometric < 0) return -1;
  const targetGroup = candidates[geometric]!.group;
  if (!targetGroup || targetGroup === fromGroup) return geometric;
  // A fixed entry point (the rail's active section) wins, as TVFocusGuideView `destinations` do natively.
  const entry = candidates.findIndex((c) => c.group === targetGroup && c.isGroupDefault);
  if (entry >= 0) return entry;
  const remembered = memory[targetGroup];
  if (remembered !== undefined && candidates[remembered]?.group === targetGroup) return remembered;
  return geometric;
}
