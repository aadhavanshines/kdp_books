import { useCallback, useRef } from 'react';

/**
 * Tells a double tap from a single one by timing. `tap(now)` returns true on
 * the second tap within `delayMs` of the first; a third tap starts over.
 */
export function createTapDetector(delayMs = 280) {
  let last = -Infinity;
  return {
    tap(now: number): boolean {
      if (now - last <= delayMs) {
        last = -Infinity;
        return true;
      }
      last = now;
      return false;
    },
  };
}

/** A press handler that calls `onDouble` on a double tap (and `onSingle`, if given, right away on the others). */
export function useDoubleTap(onDouble: () => void, onSingle?: () => void, delayMs = 280) {
  const detector = useRef(createTapDetector(delayMs));
  return useCallback(() => {
    if (detector.current.tap(Date.now())) onDouble();
    else onSingle?.();
  }, [onDouble, onSingle]);
}
