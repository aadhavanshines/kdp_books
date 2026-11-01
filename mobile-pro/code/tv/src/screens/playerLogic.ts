/** Pure player rules, kept apart from the screen so they are unit tested. */

/** The Next episode card appears this many seconds before the end. */
export const NEXT_CARD_SEC = 30;
/** Mock trailer length. */
export const TRAILER_SEC = 150;

/** Skip by `delta` seconds, clamped to the programme. */
export function seekBy(position: number, delta: number, duration: number): number {
  return Math.max(0, Math.min(duration, position + delta));
}

/** Controls hide only while playing, with no menu open, after a quiet spell. */
export function controlsShouldHide({
  playing,
  menuOpen,
  idleMs,
  hideAfterMs,
}: {
  playing: boolean;
  menuOpen: boolean;
  idleMs: number;
  hideAfterMs: number;
}): boolean {
  return playing && !menuOpen && idleMs >= hideAfterMs;
}
