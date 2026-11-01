/**
 * Moves focus to a component's host view. On Android TV and tvOS the host
 * ref has `requestTVFocus()` (react-native-tvos); on web it is a DOM node.
 * `preventScroll` because rows and pages scroll themselves (see scroll.ts).
 */
export interface FocusableHost {
  requestTVFocus?: () => void;
  focus?: (options?: { preventScroll?: boolean }) => void;
}

export function requestFocus(host: FocusableHost | null | undefined): boolean {
  if (!host) return false;
  if (typeof host.requestTVFocus === 'function') {
    host.requestTVFocus();
    return true;
  }
  if (typeof host.focus === 'function') {
    host.focus({ preventScroll: true });
    return true;
  }
  return false;
}
