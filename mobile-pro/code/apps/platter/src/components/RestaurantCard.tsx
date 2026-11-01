import type { RestaurantSummary } from '@pro/api';
import { Art, GradientFill, Icon, PressableScale, RatingPill, Skeleton, Text, formatINR, useTheme } from '@pro/ui';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

export interface RestaurantCardProps {
  restaurant: RestaurantSummary;
  onPress: (id: string) => void;
}

/** "22-29 mins". */
export function deliveryWindow(r: Pick<RestaurantSummary, 'deliveryTime'>): string {
  return `${r.deliveryTime.min}-${r.deliveryTime.max} mins`;
}

/** Home list card: art banner with offer, name, rating, time, cost for two. */
export const RestaurantCard = memo(function RestaurantCard({ restaurant: r, onPress }: RestaurantCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const label = [
    r.name,
    `rated ${r.rating}`,
    deliveryWindow(r),
    `${formatINR(r.costForTwo)} for two`,
    r.offer,
    r.isOpen ? null : 'closed now',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <PressableScale
      onPress={() => onPress(r.id)}
      accessibilityLabel={label}
      accessibilityHint="Opens the menu"
      scaleTo={0.98}
      style={[styles.card, { backgroundColor: colors.surface }, theme.shadow('md')]}
    >
      <View style={styles.banner}>
        <GradientFill colors={theme.tone(r.tone)} />
        <View style={[styles.art, !r.isOpen && styles.closedArt]}>
          <Art name={r.art} size={150} decorative />
        </View>
        {r.isPromoted ? (
          <View style={[styles.promoted, { backgroundColor: colors.overlay }]}>
            <Text variant="caption" weight={600} color="textInverse" style={styles.small}>
              Promoted
            </Text>
          </View>
        ) : null}
        {r.isPureVeg ? (
          <View style={[styles.veg, { backgroundColor: colors.surface }]}>
            <Icon set="mci" name="leaf" size={12} color="veg" />
            <Text variant="caption" weight={700} color="veg" style={styles.small}>
              PURE VEG
            </Text>
          </View>
        ) : null}
        {r.offer ? (
          <View style={styles.offer}>
            <GradientFill colors={[colors.primary, colors.primary]} opacities={[1, 0]} direction="horizontal" />
            <Text variant="subhead" weight={800} color="onPrimary" numberOfLines={1} style={styles.offerText}>
              {r.offer.toUpperCase()}
            </Text>
          </View>
        ) : null}
        {!r.isOpen ? (
          <View style={[styles.closed, { backgroundColor: colors.overlay }]}>
            <Text variant="headline" weight={700} color="textInverse">
              Closed now
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="title3" numberOfLines={1} style={styles.flex}>
            {r.name}
          </Text>
          <RatingPill rating={r.rating} />
        </View>
        <View style={styles.metaRow}>
          <Icon name="time" size={14} color="accent" />
          <Text variant="footnote" weight={600} color="text">
            {deliveryWindow(r)}
          </Text>
          <Text variant="footnote" color="textMuted">
            {`• ${r.distanceKm} km • ${formatINR(r.costForTwo)} for two`}
          </Text>
        </View>
        <Text variant="footnote" color="textMuted" numberOfLines={1}>
          {`${r.cuisines.join(', ')} • ${r.locality}`}
        </Text>
      </View>
    </PressableScale>
  );
});

export function RestaurantCardSkeleton() {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]}>
      <Skeleton height={176} radius={0} />
      <View style={[styles.body, styles.skeletonBody]}>
        <Skeleton width="62%" height={20} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: 'hidden', marginHorizontal: 16, marginBottom: 20 },
  banner: { height: 176, overflow: 'hidden', alignItems: 'flex-end', justifyContent: 'center' },
  art: { marginRight: 20, transform: [{ rotate: '-6deg' }] },
  closedArt: { opacity: 0.5 },
  promoted: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  veg: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  small: { fontSize: 11 },
  offer: { position: 'absolute', left: 0, bottom: 0, right: '30%', paddingHorizontal: 12, paddingVertical: 8 },
  offerText: { letterSpacing: 0.2 },
  closed: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 4 },
  skeletonBody: { gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
});
