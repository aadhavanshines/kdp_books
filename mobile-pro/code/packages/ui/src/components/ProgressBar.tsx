import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import type { ColorToken } from './Text';

export interface ProgressBarProps {
  /** 0 to 1 (clamped). */
  value: number;
  height?: number;
  /** Fill color token. Defaults to `primary`. */
  color?: ColorToken;
  /** Track color token. Defaults to `surfaceMuted`. */
  trackColor?: ColorToken;
  /** Spoken label, e.g. "72% claimed". */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** A thin horizontal bar: deal stock claimed, rating share, upload progress. */
export function ProgressBar({ value, height = 6, color = 'primary', trackColor = 'surfaceMuted', accessibilityLabel, style, testID }: ProgressBarProps) {
  const { colors } = useTheme();
  const v = clampProgress(value);
  return (
    <View
      testID={testID}
      accessible={!!accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors[trackColor] }, style]}
    >
      <View style={{ width: `${v * 100}%`, height, borderRadius: height / 2, backgroundColor: colors[color] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', borderRadius: radii.pill, alignSelf: 'stretch' },
});
