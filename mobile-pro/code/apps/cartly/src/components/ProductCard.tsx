import { useToggleWishlist, type Deal, type ProductSummary } from '@pro/api';
import {
  Art,
  Badge,
  GradientFill,
  Icon,
  IconButton,
  PressableScale,
  Price,
  ProgressBar,
  RatingPill,
  Skeleton,
  Text,
  formatINR,
  useTheme,
  useToast,
  type BadgeTone,
} from '@pro/ui';
import { router } from 'expo-router';
import { memo, useCallback } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** Flips the heart with a toast that links to the wishlist. */
export function useWishToggle() {
  const toggle = useToggleWishlist();
  const toast = useToast();
  return useCallback(
    (p: Pick<ProductSummary, 'id' | 'isWishlisted'>) => {
      const wished = !p.isWishlisted;
      toggle.mutate({ productId: p.id, wished });
      toast.show(
        wished
          ? { message: 'Saved to your wishlist', tone: 'success', icon: { name: 'heart' }, actionLabel: 'VIEW', onAction: () => router.push('/wishlist') }
          : { message: 'Removed from your wishlist', icon: { name: 'heart-dislike-outline' } },
      );
    },
    [toggle, toast],
  );
}

export function badgeTone(badge: string): BadgeTone {
  const b = badge.toLowerCase();
  if (b.includes('deal')) return 'danger';
  if (b.includes('best')) return 'accent';
  if (b.includes('new')) return 'info';
  return 'primary';
}

/** "Get it by tomorrow" for fast delivery, else the free-delivery threshold. */
export function deliveryHint(p: Pick<ProductSummary, 'fastDelivery' | 'price'>): { text: string; fast: boolean } {
  if (p.fastDelivery) return { text: 'Get it by tomorrow', fast: true };
  return { text: p.price >= 499 ? 'Free delivery' : `${formatINR(40)} delivery`, fast: false };
}

/** The title without a leading brand name (the card shows the brand above it). */
export function displayTitle(title: string, brand: string): string {
  return title.toLowerCase().startsWith(`${brand.toLowerCase()} `) ? title.slice(brand.length + 1) : title;
}

export interface ProductCardProps {
  product: ProductSummary;
  /** grid: two per row. rail: a fixed-width card in a horizontal row. */
  variant?: 'grid' | 'rail';
  width?: number;
  style?: StyleProp<ViewStyle>;
}

function ProductCardBase({ product: p, variant = 'grid', width, style }: ProductCardProps) {
  const theme = useTheme();
  const toggleWish = useWishToggle();
  const rail = variant === 'rail';
  const delivery = deliveryHint(p);
  const label = `${p.brand}, ${p.title}. ${formatINR(p.price)}${p.discountPercent > 0 ? `, ${p.discountPercent}% off` : ''}. Rated ${p.rating.toFixed(1)}`;
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, width }, theme.shadow('sm'), style]}>
      <PressableScale onPress={() => router.push(`/product/${p.id}`)} accessibilityLabel={label} scaleTo={0.98} style={styles.press}>
        <View style={[styles.media, rail && styles.mediaRail]}>
          <GradientFill colors={theme.tone(p.tone)} />
          <Art name={p.art} size={rail ? 92 : 112} decorative />
          {p.badge ? <Badge label={p.badge} tone={badgeTone(p.badge)} variant="solid" style={styles.badge} /> : null}
        </View>
        <View style={styles.body}>
          <Text variant="caption" weight={600} color="textMuted" numberOfLines={1}>
            {p.brand}
          </Text>
          <Text variant="footnote" numberOfLines={2} style={styles.title}>
            {displayTitle(p.title, p.brand)}
          </Text>
          <RatingPill rating={p.rating} count={p.ratingCount} />
          <Price amount={p.price} mrp={p.mrp} size={rail ? 'sm' : 'md'} />
          {!rail ? (
            <View style={styles.delivery}>
              <Icon name={delivery.fast ? 'flash' : 'car-outline'} size={12} color={delivery.fast ? 'success' : 'textMuted'} />
              <Text variant="caption" weight={delivery.fast ? 600 : 400} color={delivery.fast ? 'success' : 'textMuted'} numberOfLines={1}>
                {delivery.text}
              </Text>
            </View>
          ) : null}
        </View>
      </PressableScale>
      <IconButton
        name={p.isWishlisted ? 'heart' : 'heart-outline'}
        label={p.isWishlisted ? `Remove ${p.title} from wishlist` : `Save ${p.title} to wishlist`}
        selected={p.isWishlisted}
        color={p.isWishlisted ? 'like' : 'textSecondary'}
        variant="surface"
        size={32}
        iconSize={18}
        onPress={() => toggleWish(p)}
        style={styles.heart}
        testID={`wish-${p.id}`}
      />
    </View>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductCardSkeleton({ width, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, width }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton height={160} radius={0} />
      <View style={styles.body}>
        <Skeleton width="40%" height={12} />
        <Skeleton height={14} />
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={18} />
      </View>
    </View>
  );
}

/** A deal of the day: big discount flag, price and how much stock is gone. */
export function DealCard({ deal, width = 156 }: { deal: Deal; width?: number }) {
  const theme = useTheme();
  const p = deal.product;
  const hot = deal.claimedPercent >= 80;
  return (
    <PressableScale
      onPress={() => router.push(`/product/${p.id}`)}
      accessibilityLabel={`Deal: ${p.title}. ${formatINR(p.price)}, ${p.discountPercent}% off. ${deal.claimedPercent}% claimed`}
      scaleTo={0.98}
      style={[styles.card, { width, backgroundColor: theme.colors.surface }, theme.shadow('sm')]}
    >
      <View style={[styles.media, styles.mediaDeal]}>
        <GradientFill colors={theme.tone(p.tone)} />
        <Art name={p.art} size={88} decorative />
        <View style={[styles.dealFlag, { backgroundColor: theme.colors.accent }]}>
          <Text variant="caption" weight={800} color="onAccent" tabular>
            {`${p.discountPercent}% OFF`}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text variant="caption" numberOfLines={2} style={styles.dealTitle}>
          {p.title}
        </Text>
        <Price amount={p.price} mrp={p.mrp} size="sm" showDiscount={false} />
        <ProgressBar value={deal.claimedPercent / 100} height={5} color={hot ? 'danger' : 'primary'} />
        <Text variant="caption" weight={600} color={hot ? 'danger' : 'textMuted'} tabular>
          {hot ? `Almost gone: ${deal.claimedPercent}% claimed` : `${deal.claimedPercent}% claimed`}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, overflow: 'hidden' },
  press: { flex: 1 },
  media: { height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  mediaRail: { height: 124 },
  mediaDeal: { height: 116 },
  badge: { position: 'absolute', top: 8, left: 8 },
  heart: { position: 'absolute', top: 8, right: 8 },
  body: { padding: 10, gap: 4 },
  title: { minHeight: 40 },
  dealTitle: { minHeight: 32 },
  delivery: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dealFlag: { position: 'absolute', left: 0, bottom: 0, paddingHorizontal: 8, paddingVertical: 3, borderTopRightRadius: 8 },
});
