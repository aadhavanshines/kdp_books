import { StyleSheet, View } from 'react-native';

import { s } from '../theme/scale';
import { colors, radii } from '../theme/tokens';
import { Text } from './Text';

/** Red LIVE pill with a dot. */
export function LiveBadge({ small }: { small?: boolean }) {
  return (
    <View style={[styles.live, small && styles.liveSmall]} accessible accessibilityLabel="Live">
      <View style={styles.dot} />
      <Text variant={small ? 'overline' : 'label'} color="onLive" style={{ letterSpacing: s(2) }}>
        LIVE
      </Text>
    </View>
  );
}

/** Outlined maturity rating ("U/A 13+"). */
export function RatingBadge({ label }: { label: string }) {
  return (
    <View style={styles.rating} accessible accessibilityLabel={`Rated ${label}`}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    </View>
  );
}

/** Small brand chip ("ORIGINAL", "NEW"). */
export function Tag({ label, tone = 'primary' }: { label: string; tone?: 'primary' | 'accent' }) {
  return (
    <View style={[styles.tag, { backgroundColor: tone === 'primary' ? colors.primary : colors.accent }]}>
      <Text variant="overline" color={tone === 'primary' ? 'onPrimary' : 'onAccent'} style={{ fontSize: s(16), lineHeight: s(20) }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.live,
    paddingHorizontal: s(14),
    paddingVertical: s(4),
    borderRadius: radii.sm,
  },
  liveSmall: { paddingHorizontal: s(10), paddingVertical: s(2) },
  dot: { width: s(10), height: s(10), borderRadius: s(5), backgroundColor: colors.onLive, marginRight: s(8) },
  rating: {
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderRadius: s(6),
    paddingHorizontal: s(10),
    paddingVertical: s(1),
  },
  tag: { paddingHorizontal: s(10), paddingVertical: s(3), borderRadius: s(6), alignSelf: 'flex-start' },
});
