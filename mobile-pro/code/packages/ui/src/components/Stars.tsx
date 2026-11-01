import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from './Icon';

export interface StarsProps {
  /** 0 to 5; halves round to a half star. */
  rating: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Full, half and empty stars for a rating, in display order. */
export function starShapes(rating: number): ('full' | 'half' | 'empty')[] {
  const r = Math.round(Math.min(5, Math.max(0, rating)) * 2) / 2;
  return [1, 2, 3, 4, 5].map((i) => (r >= i ? 'full' : r >= i - 0.5 ? 'half' : 'empty'));
}

/** A read-only row of five stars ("4.5 out of 5 stars"). */
export function Stars({ rating, size = 14, style }: StarsProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${Math.round(rating * 10) / 10} out of 5 stars`}
      style={[styles.row, style]}
    >
      {starShapes(rating).map((shape, i) => (
        <Icon
          key={i}
          name={shape === 'full' ? 'star' : shape === 'half' ? 'star-half' : 'star-outline'}
          size={size}
          color={shape === 'empty' ? 'border' : 'star'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 1 },
});
