import {
  defaultAddress,
  useAddresses,
  useCart,
  useProduct,
  useProducts,
  useSetCartItem,
  type CartLine,
  type Product,
} from '@pro/api';
import {
  Art,
  Badge,
  BottomBar,
  Button,
  Carousel,
  Divider,
  ErrorState,
  GradientFill,
  Icon,
  IconButton,
  PressableScale,
  RatingBreakdown,
  ScreenHeader,
  SectionHeader,
  Skeleton,
  Stars,
  Text,
  formatINR,
  formatNumber,
  useTheme,
  useToast,
  type IoniconName,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ScrollView, Share, StyleSheet, View, type LayoutChangeEvent, type ScrollViewInstance } from 'react-native';

import { CartButton } from '../../components/CartButton';
import { badgeTone, ProductCard, useWishToggle } from '../../components/ProductCard';
import { PincodeCheck, ReviewCard, VariantPicker } from '../../components/ProductParts';
import { defaultSelection, isSelectionAvailable, selectionLabel, selectionPrice, toVariantInput, type Selection } from '../../lib/variants';

function Block({ children, title, onLayout }: { children: ReactNode; title?: string; onLayout?: (e: LayoutChangeEvent) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.block, { backgroundColor: colors.surface }]} onLayout={onLayout}>
      {title ? (
        <Text variant="title3" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** The cart line for this product with exactly these variant picks. */
function lineFor(lines: readonly CartLine[] | undefined, productId: string, sel: Selection): CartLine | undefined {
  return lines?.find((l) => l.productId === productId && l.options.every((o) => sel[o.groupId as keyof Selection] === o.optionId));
}

function Gallery({ product: p }: { product: Product }) {
  const theme = useTheme();
  const toggleWish = useWishToggle();
  const toast = useToast();
  const slides = p.gallery.length ? p.gallery : [{ art: p.art, tone: p.tone }];
  const share = async () => {
    try {
      await Share.share({ message: `${p.title} for ${formatINR(p.price)} on Cartly: https://cartly.example/p/${p.id}` });
    } catch {
      toast.show('Link copied: cartly.example/p/' + p.id);
    }
  };
  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Carousel
        data={slides}
        keyExtractor={(s, i) => `${s.art}-${i}`}
        itemWidthRatio={1}
        gap={0}
        testID="gallery"
        renderItem={(s, i) => (
          <View style={styles.slide} accessible accessibilityRole="image" accessibilityLabel={`${p.title}, image ${i + 1} of ${slides.length}`}>
            <GradientFill colors={theme.tone(s.tone)} />
            <Art name={s.art} size={210} decorative />
          </View>
        )}
      />
      {p.badge ? <Badge label={p.badge} tone={badgeTone(p.badge)} variant="solid" size="md" style={styles.galleryBadge} /> : null}
      <View style={styles.galleryActions}>
        <IconButton
          name={p.isWishlisted ? 'heart' : 'heart-outline'}
          label={p.isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          selected={p.isWishlisted}
          variant="surface"
          color={p.isWishlisted ? 'like' : 'text'}
          onPress={() => toggleWish(p)}
          testID="pdp-wish"
        />
        <IconButton name="share-social-outline" label="Share" variant="surface" onPress={() => void share()} />
      </View>
    </View>
  );
}

export default function ProductScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useProduct(id);
  const p = query.data;
  const cart = useCart('cartly');
  const addresses = useAddresses();
  const setItem = useSetCartItem('cartly');
  const address = defaultAddress(addresses.data);
  const [picked, setPicked] = useState<Selection | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const scroller = useRef<ScrollViewInstance>(null);
  const [reviewsY, setReviewsY] = useState(0);
  const similar = useProducts({ category: p?.categoryId, pageSize: 10 });
  const sel = picked ?? (p ? defaultSelection(p.variants) : {});
  const line = p ? lineFor(cart.data?.items, p.id, sel) : undefined;
  const others = useMemo(() => similar.data?.pages[0]?.items.filter((x) => x.id !== id).slice(0, 8) ?? [], [similar.data, id]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const header = (
    <ScreenHeader
      onBack={back}
      right={
        <>
          <IconButton name="search" label="Search" onPress={() => router.push('/search')} />
          <CartButton />
        </>
      }
    />
  );

  if (query.isError && !p) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState error={query.error} onRetry={() => void query.refetch()} art="package" />
      </View>
    );
  }
  if (!p) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <Skeleton height={320} radius={0} />
        <View style={styles.skel}>
          <Skeleton width="30%" />
          <Skeleton height={20} />
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={32} />
        </View>
      </View>
    );
  }

  const { price, mrp } = selectionPrice(p, p.variants, sel);
  const off = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const available = p.stock > 0 && isSelectionAvailable(p.variants, sel);
  const label = selectionLabel(p.variants, sel);

  const add = (then?: () => void) => {
    if (line) return then?.();
    setItem.mutate(
      { productId: p.id, quantity: 1, variant: toVariantInput(p.variants, sel) },
      {
        onSuccess: () => {
          if (then) then();
          else toast.show({ message: 'Added to cart', tone: 'success', icon: { name: 'cart' }, actionLabel: 'VIEW CART', onAction: () => router.push('/cart') });
        },
        onError: (e) => toast.show({ message: e.message, tone: 'danger' }),
      },
    );
  };

  const promises: { icon: IoniconName; title: string }[] = [
    { icon: 'refresh-circle-outline', title: `${p.returnDays}-day returns` },
    { icon: 'shield-checkmark-outline', title: p.warranty ? p.warranty.replace(' manufacturer', '') : 'Genuine product' },
    { icon: 'lock-closed-outline', title: 'Secure payment' },
  ];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <ScrollView ref={scroller} contentContainerStyle={styles.content} testID="pdp-scroll">
        <Gallery product={p} />

        <Block>
          <PressableScale
            onPress={() => router.push({ pathname: '/products', params: { brand: p.brand } })}
            accessibilityRole="link"
            accessibilityLabel={`Visit the ${p.brand} store`}
            style={styles.brandLink}
          >
            <Text variant="subhead" weight={700} color="primary">
              {`Visit the ${p.brand} store`}
            </Text>
          </PressableScale>
          <Text variant="headline" weight={500} accessibilityRole="header">
            {p.title}
          </Text>
          <PressableScale
            onPress={() => scroller.current?.scrollTo({ y: reviewsY - 8, animated: true })}
            accessibilityLabel={`Rated ${p.rating.toFixed(1)} out of 5 from ${formatNumber(p.ratingCount)} ratings. Go to reviews`}
            style={styles.ratingRow}
          >
            <Text variant="subhead" weight={700} tabular>
              {p.rating.toFixed(1)}
            </Text>
            <Stars rating={p.rating} size={15} />
            <Text variant="subhead" color="primary">
              {`${formatNumber(p.ratingCount)} ratings`}
            </Text>
          </PressableScale>

          <Divider />
          <View style={styles.priceRow} accessible accessibilityLabel={`${off ? `${off}% off. ` : ''}Price ${formatINR(price)}${off ? `, MRP ${formatINR(mrp)}` : ''}`}>
            {off ? (
              <Text variant="title2" weight={400} color="danger" tabular>
                {`-${off}%`}
              </Text>
            ) : null}
            <Text variant="title1" tabular>
              {formatINR(price)}
            </Text>
          </View>
          {off ? (
            <Text variant="footnote" color="textMuted">
              {'MRP '}
              <Text variant="footnote" color="textMuted" strike tabular>
                {formatINR(mrp)}
              </Text>
              {'  ·  Inclusive of all taxes'}
            </Text>
          ) : (
            <Text variant="footnote" color="textMuted">
              Inclusive of all taxes
            </Text>
          )}
          {p.stock > 0 && p.stock <= 10 ? (
            <Text variant="subhead" weight={700} color="danger">
              {`Hurry, only ${p.stock} left in stock`}
            </Text>
          ) : null}
        </Block>

        {p.offers.length ? (
          <Block title="Offers for you">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offers}>
              {p.offers.map((o, i) => (
                <View key={i} style={[styles.offer, { borderColor: colors.border }]}>
                  <View style={styles.offerHead}>
                    <Icon name="pricetag" size={14} color="success" />
                    <Text variant="subhead" weight={700}>
                      {o.title}
                    </Text>
                  </View>
                  <Text variant="caption" weight={400} color="textSecondary" numberOfLines={3}>
                    {o.description}
                  </Text>
                  {o.code ? (
                    <View style={[styles.code, { borderColor: colors.primary }]}>
                      <Text variant="caption" weight={800} color="primary">
                        {o.code}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </Block>
        ) : null}

        {p.variants.length ? (
          <Block>
            <VariantPicker groups={p.variants} value={sel} onChange={setPicked} />
          </Block>
        ) : null}

        <Block title="Delivery">
          <PincodeCheck productId={p.id} initialPincode={address?.pincode} recipient={address?.recipient.split(' ')[0]} />
          <View style={styles.promises}>
            {promises.map((x) => (
              <View key={x.title} style={styles.promise} accessible accessibilityLabel={x.title}>
                <View style={[styles.promiseIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={x.icon} size={20} color="primary" />
                </View>
                <Text variant="caption" align="center" numberOfLines={2}>
                  {x.title}
                </Text>
              </View>
            ))}
          </View>
          <Text variant="footnote" color="textSecondary">
            {'Sold by '}
            <Text variant="footnote" weight={700} color="primary">
              {p.seller}
            </Text>
          </Text>
        </Block>

        <Block title="Highlights">
          {p.highlights.map((h) => (
            <View key={h} style={styles.bullet}>
              <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
              <Text variant="footnote" style={styles.flex}>
                {h}
              </Text>
            </View>
          ))}
          <Text variant="footnote" color="textSecondary" style={styles.desc}>
            {p.description}
          </Text>
        </Block>

        {p.specs.length ? (
          <Block title="Specifications">
            <View style={[styles.specs, { borderColor: colors.divider }]}>
              {(showAllSpecs ? p.specs : p.specs.slice(0, 4)).map((s, i) => (
                <View key={s.label} style={[styles.spec, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text variant="footnote" color="textMuted" style={styles.specLabel}>
                    {s.label}
                  </Text>
                  <Text variant="footnote" style={styles.flex}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>
            {p.specs.length > 4 ? (
              <Button title={showAllSpecs ? 'Show less' : `Show all ${p.specs.length} specifications`} variant="ghost" size="sm" onPress={() => setShowAllSpecs((v) => !v)} />
            ) : null}
          </Block>
        ) : null}

        <Block title="Ratings and reviews" onLayout={(e) => setReviewsY(e.nativeEvent.layout.y)}>
          <RatingBreakdown average={p.ratingSummary.average} count={p.ratingSummary.count} breakdown={p.ratingSummary.breakdown} />
          {p.topReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
          <Button title="See all reviews" variant="secondary" fullWidth iconRight={{ name: 'chevron-forward' }} onPress={() => router.push(`/reviews/${p.id}`)} />
        </Block>

        {others.length ? (
          <View style={styles.similar}>
            <SectionHeader title="Similar products" style={styles.hPad} onAction={() => router.push({ pathname: '/products', params: { category: p.categoryId } })} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {others.map((x) => (
                <ProductCard key={x.id} product={x} variant="rail" width={148} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <BottomBar testID="buy-bar">
        {available ? (
          <>
            <Button
              title={line ? 'Go to cart' : 'Add to cart'}
              variant="secondary"
              size="lg"
              icon={{ name: line ? 'arrow-forward' : 'cart-outline' }}
              loading={setItem.isPending && !line}
              onPress={() => (line ? router.push('/cart') : add())}
              style={styles.flex}
              accessibilityHint={label ? `Adds ${label}` : undefined}
              testID="add-to-cart"
            />
            <Button title="Buy now" variant="accent" size="lg" icon={{ name: 'flash' }} onPress={() => add(() => router.push('/checkout'))} style={styles.flex} testID="buy-now" />
          </>
        ) : (
          <Button title="Currently unavailable" size="lg" disabled fullWidth style={styles.flex} />
        )}
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingBottom: 16, gap: 8 },
  skel: { padding: 16, gap: 10 },
  slide: { height: 320, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  galleryBadge: { position: 'absolute', top: 12, left: 12 },
  galleryActions: { position: 'absolute', top: 12, right: 12, gap: 10 },
  block: { padding: 16, gap: 10 },
  brandLink: { alignSelf: 'flex-start', minHeight: 24, justifyContent: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  offers: { gap: 10 },
  offer: { width: 200, borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  offerHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  code: { alignSelf: 'flex-start', borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  promises: { flexDirection: 'row', gap: 8, marginTop: 4 },
  promise: { flex: 1, alignItems: 'center', gap: 6 },
  promiseIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 8 },
  desc: { marginTop: 4 },
  specs: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, overflow: 'hidden' },
  spec: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 12 },
  specLabel: { width: 110 },
  similar: { paddingVertical: 16, gap: 12 },
  hPad: { marginHorizontal: 16 },
  rail: { paddingHorizontal: 16, gap: 12 },
});
