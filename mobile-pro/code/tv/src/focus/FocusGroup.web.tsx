/**
 * Web version of FocusGroup / FocusTrap: plain Views tagged with data
 * attributes that the web navigator (webNavigator.ts) reads.
 */
import { type ReactNode } from 'react';
import { View, type HostInstance, type StyleProp, type ViewStyle } from 'react-native';

import { useScreenFocus } from './ScreenFocus';
import type { Direction } from './spatial';
import { webData } from './webData';

export interface FocusGroupProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Where focus goes when entering the group for the first time (web: the child marked isGroupDefault). */
  entry?: HostInstance | null;
  /** Directions focus may not leave the group by. */
  trap?: readonly Direction[];
}

export function FocusGroup({ id, style, children, trap }: FocusGroupProps) {
  const { screenId } = useScreenFocus();
  return (
    <View style={style} {...webData({ tvGroup: `${screenId}:${id}`, tvTrapDirs: trap?.join(' ') })}>
      {children}
    </View>
  );
}

export function FocusTrap({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <View style={style} {...webData({ tvTrap: 'true' })}>
      {children}
    </View>
  );
}
