import { View, type StyleProp, type ViewStyle } from 'react-native';

import { s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';

export function ProgressBar({ value, height = 6, color = colors.primary, style }: { value: number; height?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[{ height: s(height), borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' }, style]}
    >
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: radii.pill }} />
    </View>
  );
}
