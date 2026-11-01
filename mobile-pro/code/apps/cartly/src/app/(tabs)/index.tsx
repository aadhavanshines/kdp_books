import {
  asDefault,
  defaultAddress,
  unreadCount,
  useAddresses,
  useCartlyHome,
  useNotifications,
  useSaveAddress,
  type ProductCategory,
} from '@pro/api';
import {
  AddressSheet,
  ArtTile,
  Carousel,
  CountdownTimer,
  ErrorState,
  GradientFill,
  Icon,
  IconButton,
  PressableScale,
  SearchBar,
  SectionHeader,
  Skeleton,
  Text,
  useTheme,
  type IoniconName,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroBanner } from '../../components/HeroBanner';
import { DealCard, ProductCard, ProductCardSkeleton } from '../../components/ProductCard';

const HINTS = ['wireless earbuds', 'running shoes', 'smartwatch', 'air fryer', 'backpack', 'kurta'];

const PROMISES: { icon: IoniconName; title: string; sub: string }[] = [
  { icon: 'car-outline', title: 'Free delivery', sub: 'Above ₹499' },
  { icon: 'refresh-circle-outline', title: 'Easy returns', sub: '7 to 10 days' },
  { icon: 'shield-checkmark-outline', title: 'Secure pay', sub: 'UPI, cards, COD' },
];

function CategoryStrip({ categories }: { categories: ProductCategory[] | undefined }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cats}>
      {categories
        ? categories.map((c) => (
            <ArtTile
              key={c.id}
              art={c.art}
              tone={c.tone}
              label={c.name}
              size={60}
              shape="rounded"
              onPress={() => router.push({ pathname: '/products', params: { category: c.id } })}
            />
          ))
        : [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} width={60} height={60} radius={14} />)}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const home = useCartlyHome();
  const addresses = useAddresses();
  const saveAddress = useSaveAddress();
  const notifications = useNotifications('cartly');
  const [addressOpen, setAddressOpen] = useState(false);
  const address = defaultAddress(addresses.data);
  const unread = unreadCount(notifications.data);
  const cardWidth = (Math.min(width, 600) - 16 * 2 - 12) / 2;
  const data = home.data;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView
        testID="home-scroll"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={home.isRefetching} onRefresh={() => void home.refetch()} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <GradientFill colors={colors.gradient} direction="vertical" />
          <View style={styles.brandRow}>
            <View style={styles.wordmark} accessible accessibilityRole="header" accessibilityLabel="Cartly">
              <Icon name="bag-handle" size={26} color="accent" />
              <Text variant="title2" weight={800} color="onPrimary">
                cartly
              </Text>
            </View>
            <IconButton
              name={unread ? 'notifications' : 'notifications-outline'}
              label="Notifications"
              badge={unread || undefined}
              color="onPrimary"
              onPress={() => router.push('/notifications')}
            />
          </View>
          <SearchBar
            onPress={() => router.push('/search')}
            rotatingHints={HINTS}
            placeholder="Search for products, brands and more"
            trailing={<Icon name="mic-outline" size={20} color="primary" />}
            testID="home-search"
          />
          <PressableScale
            onPress={() => setAddressOpen(true)}
            accessibilityLabel={address ? `Deliver to ${address.recipient}, ${address.locality} ${address.pincode}. Change address` : 'Choose a delivery address'}
            scaleTo={0.99}
            style={styles.deliverTo}
          >
            <Icon name="location-outline" size={16} color="onPrimary" />
            <Text variant="footnote" color="onPrimary" numberOfLines={1} style={styles.shrink}>
              {address ? (
                <>
                  {'Deliver to '}
                  <Text variant="footnote" weight={700} color="onPrimary">
                    {`${address.recipient.split(' ')[0]} · ${address.locality} ${address.pincode}`}
                  </Text>
                </>
              ) : (
                'Choose a delivery address'
              )}
            </Text>
            <Icon name="chevron-down" size={14} color="onPrimary" />
          </PressableScale>
        </View>

        <View style={[styles.catsCard, { backgroundColor: colors.surface }]}>
          <CategoryStrip categories={data?.categories} />
        </View>

        {home.isError && !data ? (
          <ErrorState error={home.error} onRetry={() => void home.refetch()} art="shopping-bags" />
        ) : null}

        {data ? (
          <Carousel
            data={data.banners}
            keyExtractor={(b) => b.id}
            renderItem={(b) => <HeroBanner banner={b} />}
            autoPlayMs={5000}
            gap={16}
            itemWidthRatio={0.9}
            style={styles.section}
            testID="banners"
          />
        ) : !home.isError ? (
          <Skeleton height={164} radius={18} width="90%" style={[styles.section, styles.hPad]} />
        ) : null}

        <View style={[styles.promises, styles.hPad, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
          {PROMISES.map((p) => (
            <View key={p.title} style={styles.promise} accessible accessibilityLabel={`${p.title}, ${p.sub}`}>
              <Icon name={p.icon} size={22} color="primary" />
              <View style={styles.shrink}>
                <Text variant="caption" weight={700} numberOfLines={1}>
                  {p.title}
                </Text>
                <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
                  {p.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {data?.deals.length ? (
          <View style={[styles.deals, { backgroundColor: colors.accentSoft }]}>
            <SectionHeader
              title="Deals of the day"
              accessory={<CountdownTimer endsAt={data.dealsEndAt} variant="boxes" testID="deals-countdown" />}
              subtitle="Fresh prices every midnight, while stocks last"
              onAction={() => router.push({ pathname: '/products', params: { title: 'Deals of the day', minDiscount: '40', sort: 'discount' } })}
              style={styles.hPad}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {data.deals.map((d) => (
                <DealCard key={d.product.id} deal={d} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <SectionHeader title="Top picks for you" subtitle="Bestsellers loved by shoppers in Northbay" style={[styles.section, styles.hPad]} onAction={() => router.push({ pathname: '/products', params: { sort: 'rating', title: 'Top picks for you' } })} />
        <View style={[styles.grid, styles.hPad]}>
          {data
            ? data.topPicks.map((p) => <ProductCard key={p.id} product={p} width={cardWidth} />)
            : [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} width={cardWidth} />)}
        </View>

        {data?.recentlyViewed.length ? (
          <>
            <SectionHeader title="Recently viewed" subtitle="Pick up where you left off" style={[styles.section, styles.hPad]} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {data.recentlyViewed.map((p) => (
                <ProductCard key={p.id} product={p} variant="rail" width={148} />
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      <AddressSheet
        visible={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses.data}
        selectedId={address?.id}
        showPincode
        onSelect={(a) => {
          setAddressOpen(false);
          if (!a.isDefault) saveAddress.mutate({ id: a.id, input: asDefault(a) });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingBottom: 14, gap: 12, overflow: 'hidden' },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deliverTo: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 28 },
  shrink: { flexShrink: 1 },
  catsCard: { paddingVertical: 12 },
  cats: { paddingHorizontal: 12, gap: 10 },
  hPad: { marginHorizontal: 16 },
  section: { marginTop: 20 },
  promises: { marginTop: 18, flexDirection: 'row', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 10, gap: 8 },
  promise: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  deals: { marginTop: 20, paddingTop: 16, paddingBottom: 16, gap: 12 },
  rail: { paddingHorizontal: 16, gap: 12 },
  grid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
