/**
 * Per-screen focus state. Each screen in the stack stays mounted (so Home
 * keeps its scroll position under Details) but only the top one is active.
 * A screen remembers the key of its last focused element; when it becomes
 * active again (after Back) focus returns there. Screens can also move
 * focus on purpose with `focus(key)` (Back on Home returns to the hero).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface FocusTarget {
  /** null: whichever element on the screen has `autoFocus`. */
  key: string | null;
  nonce: number;
}

export interface ScreenFocusValue {
  screenId: string;
  active: boolean;
  target: FocusTarget;
  focus(key: string | null): void;
  noteFocused(key: string): void;
  lastFocused(): string | null;
}

const ScreenFocusContext = createContext<ScreenFocusValue>({
  screenId: 'root',
  active: true,
  target: { key: null, nonce: 0 },
  focus: () => undefined,
  noteFocused: () => undefined,
  lastFocused: () => null,
});

export function useScreenFocus(): ScreenFocusValue {
  return useContext(ScreenFocusContext);
}

/**
 * Whether the focusable with this key (and autoFocus flag) should take focus
 * now. Pure, so it is unit tested.
 */
export function shouldTakeFocus(active: boolean, target: FocusTarget, focusKey: string | undefined, autoFocus: boolean): boolean {
  if (!active) return false;
  if (target.key === null) return autoFocus;
  return focusKey !== undefined && target.key === focusKey;
}

export function ScreenFocusProvider({ screenId, active, children }: { screenId: string; active: boolean; children: ReactNode }) {
  const last = useRef<string | null>(null);
  const [target, setTarget] = useState<FocusTarget>({ key: null, nonce: 0 });
  const wasActive = useRef(active);

  useEffect(() => {
    if (active && !wasActive.current) {
      // Coming back to this screen: restore the last focused element.
      setTarget((t) => ({ key: last.current, nonce: t.nonce + 1 }));
    }
    wasActive.current = active;
  }, [active]);

  const focus = useCallback((key: string | null) => setTarget((t) => ({ key, nonce: t.nonce + 1 })), []);
  const noteFocused = useCallback((key: string) => {
    last.current = key;
  }, []);
  const lastFocused = useCallback(() => last.current, []);

  const value = useMemo(
    () => ({ screenId, active, target, focus, noteFocused, lastFocused }),
    [screenId, active, target, focus, noteFocused, lastFocused],
  );
  return <ScreenFocusContext.Provider value={value}>{children}</ScreenFocusContext.Provider>;
}
