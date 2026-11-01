/**
 * A row or panel of focusables that remembers its last focused child, so
 * moving up/down into a row lands where you left it. Native: a
 * TVFocusGuideView with `autoFocus`; `destinations` (the rail's active item)
 * picks where focus lands the first time.
 */
import { type ReactNode } from 'react';
import { TVFocusGuideView, type HostInstance, type StyleProp, type ViewStyle } from 'react-native';

import type { Direction } from './spatial';

export interface FocusGroupProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Where focus goes when entering the group for the first time. */
  entry?: HostInstance | null;
  /** Directions focus may not leave the group by (the seek bar keeps Left/Right for scrubbing). */
  trap?: readonly Direction[];
}

export function FocusGroup({ style, children, entry, trap = [] }: FocusGroupProps) {
  return (
    <TVFocusGuideView
      autoFocus
      style={style}
      destinations={entry ? [entry] : undefined}
      trapFocusUp={trap.includes('up')}
      trapFocusDown={trap.includes('down')}
      trapFocusLeft={trap.includes('left')}
      trapFocusRight={trap.includes('right')}
    >
      {children}
    </TVFocusGuideView>
  );
}

/** Keeps focus inside (a menu or dialog) until it closes. */
export function FocusTrap({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <TVFocusGuideView autoFocus trapFocusUp trapFocusDown trapFocusLeft trapFocusRight style={style}>
      {children}
    </TVFocusGuideView>
  );
}
