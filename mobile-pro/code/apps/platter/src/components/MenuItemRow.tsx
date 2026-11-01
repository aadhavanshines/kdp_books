import type { MenuItem } from '@pro/api';
import { ArtTile, Badge, Icon, QuantityStepper, Skeleton, Text, VegMark, formatINR, useTheme } from '@pro/ui';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface MenuItemRowProps {
  item: MenuItem;
  quantity: number;
  onChange: (item: MenuItem, quantity: number) => void;
  /** Restaurant name, shown under dish search results. */
  restaurantName?: string;
  disabled?: boolean;
}

/** A menu dish: veg mark, bestseller, name, price, rating, description and an ADD stepper on the art. */
export const MenuItemRow = memo(function MenuItemRow({ item, quantity, onChange, restaurantName, disabled }: MenuItemRowProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const soldOut = !item.isAvailable;
  const customizable = item.customizations.length > 0;
  return (
    <View style={[styles.row, soldOut && styles.dim]}>
      <View style={styles.info}>
        <View style={styles.marks}>
          <VegMark veg={item.isVeg} />
          {item.isBestseller ? <Badge label="Bestseller" tone="warning" icon={{ name: 'star' }} /> : null}
          {item.spiceLevel > 0 ? (
            <View style={styles.spice} accessible accessibilityLabel={`Spice level ${item.spiceLevel} of 3`}>
              {Array.from({ length: item.spiceLevel }, (_, i) => (
                <Icon key={i} set="mci" name="chili-mild" size={14} color="danger" />
              ))}
            </View>
          ) : null}
        </View>
        <Text variant="headline" weight={700}>
          {item.name}
        </Text>
        {restaurantName ? (
          <Text variant="caption" weight={500} color="textMuted">
            {`From ${restaurantName}`}
          </Text>
        ) : null}
        <Text variant="subhead" weight={600} tabular>
          {formatINR(item.price)}
        </Text>
        {item.rating != null && item.ratingCount > 0 ? (
          <View style={styles.rating}>
            <Icon name="star" size={12} color={item.rating >= 4 ? 'ratingHigh' : 'ratingMid'} />
            <Text variant="caption" weight={700} color={item.rating >= 4 ? 'ratingHigh' : 'ratingMid'}>
              {item.rating.toFixed(1)}
            </Text>
            <Text variant="caption" weight={400} color="textMuted">
              {`(${item.ratingCount.toLocaleString('en-IN')})`}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : `Description: ${item.description}`}
        >
          <Text variant="footnote" color="textSecondary" numberOfLines={expanded ? undefined : 2}>
            {item.description}
          </Text>
        </Pressable>
      </View>
      <View style={[styles.media, { height: customizable ? 162 : 146 }]}>
        <ArtTile art={item.art} size={124} artScale={0.7} decorative />
        <View style={styles.stepper}>
          {soldOut ? (
            <View style={[styles.soldOut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="subhead" weight={700} color="textMuted">
                Sold out
              </Text>
            </View>
          ) : (
            <QuantityStepper
              value={quantity}
              onChange={(q) => onChange(item, q)}
              itemName={item.name}
              hint={customizable ? 'customisable' : undefined}
              disabled={disabled}
            />
          )}
        </View>
      </View>
    </View>
  );
});

export function MenuItemSkeleton() {
  return (
    <View style={styles.row}>
      <View style={[styles.info, styles.skeletonInfo]}>
        <Skeleton width={60} height={14} />
        <Skeleton width="70%" height={18} />
        <Skeleton width={60} height={14} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="80%" height={12} />
      </View>
      <Skeleton width={124} height={124} radius={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 28 },
  dim: { opacity: 0.55 },
  info: { flex: 1, gap: 4 },
  skeletonInfo: { gap: 8 },
  marks: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  spice: { flexDirection: 'row' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  media: { width: 124, alignItems: 'center' },
  stepper: { position: 'absolute', top: 104, alignItems: 'center' },
  soldOut: { height: 40, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, justifyContent: 'center' },
});
