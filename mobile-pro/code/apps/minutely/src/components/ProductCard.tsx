import type { GroceryItem } from '@pro/api';
import { ArtTile, formatINR, Icon, PressableScale, QuantityStepper, Text, useTheme } from '@pro/ui';
import { StyleSheet, View } from 'react-native';

import { discountLabel } from '../lib/catalog';
import { useShop } from './ShopProvider';

export interface ProductCardProps {
  item: GroceryItem;
  /** Card width; the art is square at this width. */
  width: number;
  testID?: string;
}

/** A grocery tile: art, discount ribbon, ETA tag, name, pack size, price and an ADD stepper. */
export function ProductCard({ item, width, testID }: ProductCardProps) {
  const { colors } = useTheme();
  const { quantityOf, change, openProduct, etaMinutes } = useShop();
  const off = discountLabel(item);
  const qty = quantityOf(item.id);
  const stacked = width < 136;
  return (
    <View style={[styles.card, { width }]} testID={testID}>
      <PressableScale
        onPress={() => openProduct(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.unit}, ${formatINR(item.price)}${off ? `, ${off}` : ''}${item.inStock ? '' : ', out of stock'}`}
        accessibilityHint="Opens product details"
        scaleTo={0.97}
      >
        <View style={[styles.artWrap, { borderColor: colors.divider }]}>
          <ArtTile art={item.art} tone={item.tone} size={width - 2} shape="rounded" artScale={0.66} decorative />
          {off ? (
            <View style={[styles.ribbon, { backgroundColor: colors.info }]}>
              <Text variant="caption" weight={800} color="textInverse" style={styles.ribbonText}>
                {off}
              </Text>
            </View>
          ) : null}
          {!item.inStock ? (
            <View style={[styles.soldOut, { backgroundColor: colors.overlay }]}>
              <Text variant="caption" weight={700} color="textInverse">
                Out of stock
              </Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.eta, { backgroundColor: colors.surfaceMuted }]}>
          <Icon name="timer-outline" size={11} color="textSecondary" />
          <Text variant="caption" weight={700} color="textSecondary" style={styles.etaText}>
            {`${etaMinutes} MINS`}
          </Text>
        </View>
        <Text variant="footnote" weight={600} numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
          {item.unit}
        </Text>
      </PressableScale>
      <View style={stacked ? styles.bottomStacked : styles.bottom}>
        <View style={stacked ? styles.pricesInline : styles.prices}>
          <Text variant="subhead" weight={700} tabular>
            {formatINR(item.price)}
          </Text>
          {item.mrp > item.price ? (
            <Text variant="caption" weight={400} color="textMuted" tabular style={styles.mrp}>
              {formatINR(item.mrp)}
            </Text>
          ) : null}
        </View>
        {item.inStock ? (
          <QuantityStepper
            size="sm"
            variant={qty > 0 ? 'filled' : 'outline'}
            value={qty}
            max={item.maxPerOrder}
            itemName={item.name}
            onChange={(n) => change(item, n)}
            style={stacked ? styles.stepperWide : styles.stepper}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  artWrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, overflow: 'hidden', marginBottom: 6 },
  ribbon: { position: 'absolute', top: 0, left: 8, paddingHorizontal: 6, paddingTop: 3, paddingBottom: 4, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  ribbonText: { fontSize: 10, lineHeight: 12 },
  soldOut: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 3, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  etaText: { fontSize: 10, lineHeight: 14 },
  name: { marginTop: 4, minHeight: 36 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 4 },
  prices: { flexShrink: 1 },
  bottomStacked: { marginTop: 6, gap: 6 },
  pricesInline: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  stepperWide: { alignSelf: 'flex-end' },
  mrp: { textDecorationLine: 'line-through' },
  stepper: { flexShrink: 0 },
});
