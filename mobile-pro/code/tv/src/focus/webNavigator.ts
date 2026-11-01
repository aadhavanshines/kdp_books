/**
 * Web only: makes a browser behave like a TV remote. Arrow keys move focus
 * between `data-tv-focusable` elements with the same spatial rules the TV
 * focus engine uses (spatial.ts), Enter presses (react-native-web's
 * Pressable already handles Enter), and Escape / Backspace act as Back.
 *
 * Rules on top of plain geometry:
 * - only visible elements count (screens under the top one are display:none);
 * - an open `data-tv-trap` (a menu) keeps focus inside it;
 * - `data-tv-group` rows remember their last focused card.
 */
import { chooseCandidate, directionForKey, type Candidate, type Direction } from './spatial';

const FOCUSABLE = '[data-tv-focusable="true"]';
const BACK_KEYS = new Set(['Escape', 'Backspace', 'GoBack', 'BrowserBack']);

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function groupOf(el: Element): string | null {
  return el.closest('[data-tv-group]')?.getAttribute('data-tv-group') ?? null;
}

function scopeRoot(): ParentNode {
  const traps = Array.from(document.querySelectorAll('[data-tv-trap="true"]')).filter(isVisible);
  return traps[traps.length - 1] ?? document;
}

function focusables(): HTMLElement[] {
  return Array.from(scopeRoot().querySelectorAll<HTMLElement>(FOCUSABLE)).filter(isVisible);
}

const memory = new Map<string, HTMLElement>();

function focusEl(el: HTMLElement) {
  el.focus({ preventScroll: true });
}

/** Focus something sensible when nothing is focused: the screen's autofocus element, else the first focusable. */
function focusFirst(elements: HTMLElement[]) {
  const preferred = elements.find((el) => el.getAttribute('data-tv-autofocus') === 'true') ?? elements[0];
  if (preferred) focusEl(preferred);
}

export function moveFocus(dir: Direction): boolean {
  const elements = focusables();
  const active = document.activeElement?.closest<HTMLElement>(FOCUSABLE) ?? null;
  if (!active || !elements.includes(active)) {
    focusFirst(elements);
    return true;
  }
  const others = elements.filter((el) => el !== active);
  const candidates: Candidate[] = others.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      group: groupOf(el),
      isGroupDefault: el.getAttribute('data-tv-default') === 'true',
    };
  });
  const remembered: Record<string, number | undefined> = {};
  memory.forEach((el, group) => {
    const i = others.indexOf(el);
    if (i >= 0) remembered[group] = i;
  });
  const r = active.getBoundingClientRect();
  const trapped = (active.closest('[data-tv-group]')?.getAttribute('data-tv-trap-dirs') ?? '').split(' ').filter(Boolean) as Direction[];
  const index = chooseCandidate(
    { x: r.left, y: r.top, width: r.width, height: r.height },
    groupOf(active),
    candidates,
    dir,
    remembered,
    trapped,
  );
  if (index < 0) return false;
  focusEl(others[index]!);
  return true;
}

export interface WebNavigatorOptions {
  onBack: () => void;
  /** Every key press (for auto-hiding player controls and the like). */
  onKey?: (key: string) => void;
}

export function installWebNavigator({ onBack, onKey }: WebNavigatorOptions): () => void {
  const onFocusIn = (e: FocusEvent) => {
    const el = (e.target as Element | null)?.closest<HTMLElement>(FOCUSABLE);
    const group = el ? groupOf(el) : null;
    if (el && group) memory.set(group, el);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    onKey?.(e.key);
    const dir = directionForKey(e.key);
    if (dir) {
      e.preventDefault();
      moveFocus(dir);
      return;
    }
    if (BACK_KEYS.has(e.key)) {
      e.preventDefault();
      onBack();
      return;
    }
    if (e.key === 'Enter' && !document.activeElement?.closest(FOCUSABLE)) {
      e.preventDefault();
      focusFirst(focusables());
    }
  };
  document.addEventListener('focusin', onFocusIn);
  window.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('focusin', onFocusIn);
    window.removeEventListener('keydown', onKeyDown);
  };
}
