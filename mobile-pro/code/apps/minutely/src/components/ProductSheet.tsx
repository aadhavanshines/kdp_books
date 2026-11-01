import { useGrocery } from '@pro/api';
import { ArtTile, Badge, BottomSheet, Button, formatINR, Icon, Price, QuantityStepper, Skeleton, Text, useTheme } from '@pro/ui';
import { ScrollView, StyleSheet, View } from 'react-native';

import { discountLabel } from '../lib/catalog';
import { ProductCard } from './ProductCard';
import { useShop } from './ShopProvider';

export interface ProductSheetProps {
  productId: string | null;
  onClose: () => void;
}

/** Product details over the current screen: art, price, highlights, similar items, ADD. */
export function ProductSheet({ productId, onClose }: ProductSheetProps) {
  const { colors } = useTheme();
  const { quantityOf, change, etaMinutes } = useShop();
  const { data: item, isError, refetch } = useGrocery(productId ?? undefined);
  const shown = item && item.id === productId ? item : undefined;
  const qty = shown ? quantityOf(shown.id) : 0;

  const footer = shown ? (
    <View style={styles.footer}>
      <View style={styles.flex}>
        <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
          {shown.unit}
        </Text>
        <Price amount={shown.price} mrp={shown.mrp} size="md" showDiscount={false} />
        <Text variant="caption" weight={400} color="textMuted">
          Inclusive of all taxes
        </Text>
      </View>
      {!shown.inStock ? (
        <Button title="Out of stock" disabled size="lg" />
      ) : qty > 0 ? (
        <QuantityStepper value={qty} max={shown.maxPerOrder} itemName={shown.name} variant="filled" onChange={(n) => change(shown, n)} style={styles.bigStepper} />
      ) : (
        <Button title="Add to cart" size="lg" onPress={() => change(shown, 1)} testID="sheet-add" />
      )}
    </View>
  ) : undefined;

  return (
    <BottomSheet visible={!!productId} onClose={onClose} footer={footer} maxHeightRatio={0.88} testID="product-sheet">
      {!shown ? (
        isError ? (
          <View style={styles.center}>
            <Text variant="subhead">Could not load this product.</Text>
            <Button title="Try again" variant="secondary" onPress={() => void refetch()} />
          </View>
        ) : (
          <View style={styles.body}>
            <Skeleton height={220} radius={20} />
            <Skeleton width="70%" height={24} />
            <Skeleton width="40%" height={16} />
          </View>
        )
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <ArtTile art={shown.art} tone={shown.tone} size={200} artScale={0.7} decorative />
          </View>
          <View style={styles.tags}>
            <View style={[styles.eta, { backgroundColor: colors.surfaceMuted }]}>
              <Icon name="timer-outline" size={12} color="textSecondary" />
              <Text variant="caption" weight={700} color="textSecondary">
                {`${etaMinutes} MINS`}
              </Text>
            </View>
            {discountLabel(shown) ? <Badge label={discountLabel(shown)!} tone="info" variant="solid" /> : null}
            {shown.tags.slice(0, 2).map((t) => (
              <Badge key={t} label={t} tone="success" variant="soft" />
            ))}
          </View>
          <View style={styles.titleBlock}>
            <Text variant="caption" weight={600} color="primary">
              {shown.brand}
            </Text>
            <Text variant="title3" accessibilityRole="header">
              {shown.name}
            </Text>
            <Text variant="footnote" color="textMuted">
              {shown.unit}
            </Text>
          </View>
          {shown.mrp > shown.price ? (
            <View style={[styles.save, { backgroundColor: colors.successSoft }]}>
              <Icon name="pricetag" size={14} color="success" />
              <Text variant="footnote" weight={700} color="success">
                {`You save ${formatINR(shown.mrp - shown.price)} on MRP`}
              </Text>
            </View>
          ) : null}

          <View style={[styles.card, { backgroundColor: colors.surfaceMuted }]}>
            <Text variant="headline">Product details</Text>
            <Text variant="footnote" color="textSecondary">
              {shown.description}
            </Text>
            {shown.highlights.map((h) => (
              <View key={h.label} style={styles.highlight}>
                <Text variant="footnote" weight={600} color="textMuted" style={styles.hLabel}>
                  {h.label}
                </Text>
                <Text variant="footnote" style={styles.flex}>
                  {h.value}
                </Text>
              </View>
            ))}
          </View>

          {shown.similar.length ? (
            <View style={styles.similar}>
              <Text variant="headline">Similar products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
                {shown.similar.map((s) => (
                  <ProductCard key={s.id} item={s} width={128} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', gap: 12, padding: 24 },
  body: { gap: 14, paddingBottom: 8 },
  hero: { alignItems: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  titleBlock: { gap: 2 },
  save: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  card: { borderRadius: 16, padding: 14, gap: 8 },
  highlight: { flexDirection: 'row', gap: 8 },
  hLabel: { width: 96 },
  similar: { gap: 10 },
  rail: { gap: 12, paddingRight: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bigStepper: { minWidth: 120 },
});
