/**
 * Scroll math for rows and pages, so the focused card is always in view.
 * Rows keep the focused card at a fixed "focus line" near the left edge
 * (the way TV rows move under a still focus position) until the row runs out
 * of content; then the last cards scroll in fully.
 */

export interface RowMetrics {
  /** Width of one card (canvas units). */
  itemWidth: number;
  /** Gap between cards. */
  gap: number;
  /** Number of cards. */
  count: number;
  /** Width of the visible part of the row. */
  viewportWidth: number;
  /** Padding before the first card and after the last. */
  inset: number;
}

/** Total scrollable content width of a row. */
export function rowContentWidth({ itemWidth, gap, count, inset }: RowMetrics): number {
  if (count <= 0) return inset * 2;
  return inset * 2 + count * itemWidth + (count - 1) * gap;
}

/** Horizontal scroll offset that shows card `index` at the row's focus line. */
export function rowOffsetForIndex(metrics: RowMetrics, index: number): number {
  const { itemWidth, gap, count, viewportWidth } = metrics;
  if (count <= 0) return 0;
  const i = Math.max(0, Math.min(count - 1, index));
  const maxOffset = Math.max(0, rowContentWidth(metrics) - viewportWidth);
  const offset = i * (itemWidth + gap);
  return Math.max(0, Math.min(maxOffset, offset));
}

/**
 * Horizontal layout of a row whose viewport starts at `clipLeft` (the rail's
 * edge) instead of the screen's left edge, so cards scrolled past the focus
 * line are clipped there rather than sliding under the rail. The clip never
 * passes the focus line. Cards still land at `inset` on screen, so the
 * offsets from rowOffsetForIndex (written in screen units) are unchanged.
 */
export function clippedRow(inset: number, clipLeft: number): { left: number; paddingStart: number } {
  const left = Math.max(0, Math.min(clipLeft, inset));
  return { left, paddingStart: inset - left };
}

/**
 * Vertical offset for a list of sections (rows on Home, the guide's
 * channels) that brings section `index` to the top of the viewport, without
 * scrolling past the end. `tops` are the sections' y positions.
 */
export function sectionOffset(tops: readonly number[], index: number, contentHeight: number, viewportHeight: number): number {
  if (tops.length === 0) return 0;
  const i = Math.max(0, Math.min(tops.length - 1, index));
  const maxOffset = Math.max(0, contentHeight - viewportHeight);
  return Math.max(0, Math.min(maxOffset, tops[i]!));
}

/**
 * Minimal scroll that makes [start, start + size) visible inside a viewport
 * currently scrolled to `current`, keeping `margin` clear at either end.
 * Used by grids, where jumping a whole row at a time would be disorienting.
 */
export function revealOffset(current: number, start: number, size: number, viewport: number, margin = 0): number {
  if (start - margin < current) return Math.max(0, start - margin);
  if (start + size + margin > current + viewport) return start + size + margin - viewport;
  return current;
}
