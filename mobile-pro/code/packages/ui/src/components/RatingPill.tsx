import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ratingColor } from '../theme/createTheme';
import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { formatCompact, formatNumber } from '../utils/format';
import { Icon } from './Icon';
import { Text } from './Text';

export interface RatingPillProps {
  rating: number;
  /** Number of ratings, shown after the pill ("12K ratings"). */
  count?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

/** A green / amber / red pill with the rating and a star. */
export function RatingPill({ rating, count, size = 'sm', style }: RatingPillProps) {
  const { colors } = useTheme();
  const value = rating.toFixed(1);
  const label =
    count != null ? `Rated ${value} out of 5 from ${formatNumber(count)} ratings` : `Rated ${value} out of 5`;
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={[styles.row, style]}>
      <View
        style={[
          styles.pill,
          size === 'md' ? styles.md : styles.sm,
          { backgroundColor: ratingColor(rating, colors) },
        ]}
      >
        <Text variant={size === 'md' ? 'subhead' : 'caption'} weight={700} color="textInverse" tabular>
          {value}
        </Text>
        <Icon name="star" size={size === 'md' ? 12 : 10} color="textInverse" />
      </View>
      {count != null ? (
        <Text variant="caption" color="textMuted">
          ({formatCompact(count)})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: radii.sm - 2 },
  sm: { paddingHorizontal: 5, paddingVertical: 1 },
  md: { paddingHorizontal: 7, paddingVertical: 3 },
});
