import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ratingColor } from '../theme/createTheme';
import { useTheme } from '../theme/ThemeProvider';
import { formatCompact, formatNumber } from '../utils/format';
import { Icon } from './Icon';
import { Stars } from './Stars';
import { Text } from './Text';

export interface RatingBreakdownProps {
  average: number;
  count: number;
  /** Count per star value (any order). */
  breakdown: readonly { stars: number; count: number }[];
  /** Number of written reviews, shown under the count. */
  reviewCount?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shares of each star value, 5 down to 1, as 0..1 fractions of the total. */
export function ratingShares(breakdown: readonly { stars: number; count: number }[]): { stars: number; count: number; share: number }[] {
  const total = breakdown.reduce((s, b) => s + b.count, 0);
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = breakdown.find((b) => b.stars === stars)?.count ?? 0;
    return { stars, count, share: total > 0 ? count / total : 0 };
  });
}

/** The big average on the left and 5-to-1 star bars on the right. */
export function RatingBreakdown({ average, count, breakdown, reviewCount, style }: RatingBreakdownProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, style]}>
      <View
        style={styles.summary}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Rated ${average.toFixed(1)} out of 5 from ${formatNumber(count)} ratings`}
      >
        <View style={styles.avg}>
          <Text variant="title1" tabular>
            {average.toFixed(1)}
          </Text>
          <Icon name="star" size={20} color="star" />
        </View>
        <Stars rating={average} size={12} />
        <Text variant="caption" weight={400} color="textMuted" align="center">
          {`${formatCompact(count)} ratings`}
          {reviewCount != null ? `\n${formatCompact(reviewCount)} reviews` : ''}
        </Text>
      </View>
      <View style={styles.bars}>
        {ratingShares(breakdown).map((b) => (
          <View
            key={b.stars}
            style={styles.barRow}
            accessible
            accessibilityLabel={`${b.stars} star: ${formatNumber(b.count)} ratings`}
          >
            <Text variant="caption" color="textSecondary" style={styles.starLabel} tabular>
              {`${b.stars}`}
            </Text>
            <Icon name="star" size={10} color="textMuted" />
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
              <View style={[styles.fill, { width: `${b.share * 100}%`, backgroundColor: ratingColor(b.stars, colors) }]} />
            </View>
            <Text variant="caption" weight={400} color="textMuted" style={styles.count} tabular>
              {formatCompact(b.count)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summary: { alignItems: 'center', gap: 4, minWidth: 92 },
  avg: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bars: { flex: 1, gap: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starLabel: { width: 10 },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', marginHorizontal: 4 },
  fill: { height: 6, borderRadius: 3 },
  count: { width: 40, textAlign: 'right' },
});
