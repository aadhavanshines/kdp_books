import { addressLine, asDefault, type Banner, defaultAddress, type RestaurantSummary, useAddresses, useMe, usePlatterHome, useRestaurants, useSaveAddress } from '@pro/api';
import {
  AddressSheet,
  Art,
  ArtTile,
  Avatar,
  BottomSheet,
  Carousel,
  CartBar,
  Chip,
  ErrorState,
  GradientFill,
  Icon,
  OptionRow,
  PressableScale,
  SearchBar,
  Skeleton,
  Text,
  useTheme,
} from '@pro/ui';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RestaurantCard, RestaurantCardSkeleton } from '../../components/RestaurantCard';
import { bannerRoute, FILTERS, hasFilters, NO_FILTERS, SORTS, toggleFilter, toRestaurantQuery, type FilterState } from '../../lib/filters';
import { useCartSummary } from '../../lib/useCartSummary';

const HINTS = ['biryani', 'pizza', 'masala dosa', 'burgers', 'ice cream', 'momos'];

type Row =
  | { type: 'top' }
  | { type: 'filters' }
  | { type: 'restaurant'; restaurant: RestaurantSummary }
  | { type: 'skeleton'; key: string }
  | { type: 'empty' }
  | { type: 'error' };

function PromoSlide({ banner }: { banner: Banner }) {
  const theme = useTheme();
  const go = () => {
    const r = bannerRoute(banner.link);
    router.push({ pathname: r.pathname as never, params: r.params });
  };
  return (
    <PressableScale onPress={go} accessibilityLabel={`${banner.title}. ${banner.subtitle}. ${banner.cta}`} scaleTo={0.98} style={styles.promo}>
      <GradientFill colors={theme.tone(banner.tone)} />
      <View style={styles.promoText}>
        <Text variant="title3" color="textInverse" numberOfLines={2}>
          {banner.title}
        </Text>
        <Text variant="footnote" color="textInverse" numberOfLines={2} style={styles.promoSub}>
          {banner.subtitle}
        </Text>
        <View style={[styles.cta, { backgroundColor: theme.colors.surface }]}>
          <Text variant="caption" weight={800} color="text">
            {banner.cta}
          </Text>
          <Icon name="arrow-forward" size={12} color="text" />
        </View>
      </View>
      <Art name={banner.art} size={112} decorative style={styles.promoArt} />
    </PressableScale>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const home = usePlatterHome();
  const me = useMe();
  const addresses = useAddresses();
  const saveAddress = useSaveAddress();
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [addressOpen, setAddressOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filtered = hasFilters(filters);
  const list = useRestaurants(toRestaurantQuery(filters));
  const cartBar = useCartSummary();
  const address = defaultAddress(addresses.data);
  // Without filters the home payload already has the ranked list.
  const restaurants = filtered ? list.data : home.data?.restaurants;
  const loading = filtered ? list.isLoading : home.isLoading;

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [{ type: 'top' }, { type: 'filters' }];
    if (home.isError && !home.data) return [{ type: 'top' }, { type: 'error' }];
    if (loading || !restaurants) return [...out, ...['a', 'b', 'c'].map((key) => ({ type: 'skeleton' as const, key }))];
    if (restaurants.length === 0) return [...out, { type: 'empty' }];
    return [...out, ...restaurants.map((restaurant) => ({ type: 'restaurant' as const, restaurant }))];
  }, [home.isError, home.data, loading, restaurants]);

  const openRestaurant = useCallback((id: string) => router.push(`/restaurant/${id}`), []);
  const sortLabel = SORTS.find((s) => s.key === filters.sort)?.label;

  const renderRow = ({ item }: { item: Row }) => {
    switch (item.type) {
      case 'top':
        return (
          <View>
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
              <PressableScale
                onPress={() => setAddressOpen(true)}
                accessibilityLabel={address ? `Delivering to ${address.label}, ${addressLine(address)}. Change address` : 'Choose address'}
                scaleTo={0.98}
                style={styles.location}
              >
                <View style={styles.locationTop}>
                  <Icon name="location" size={20} color="primary" />
                  {address ? (
                    <Text variant="title3" numberOfLines={1}>
                      {address.label}
                    </Text>
                  ) : (
                    <Skeleton width={80} height={20} />
                  )}
                  <Icon name="chevron-down" size={16} color="text" />
                </View>
                <Text variant="footnote" color="textSecondary" numberOfLines={1} style={styles.locationLine}>
                  {address ? addressLine(address) : ' '}
                </Text>
              </PressableScale>
              <Avatar
                name={me.data?.name ?? 'Profile'}
                art={me.data?.avatar}
                size={40}
                onPress={() => router.push('/profile')}
                accessibilityHint="Opens your profile"
              />
            </View>
            <SearchBar
              onPress={() => router.push('/search')}
              rotatingHints={HINTS}
              placeholder="Search for dishes or restaurants"
              style={styles.search}
              trailing={<Icon name="mic-outline" size={20} color="primary" />}
            />
            {home.data ? (
              <Carousel
                data={home.data.banners}
                keyExtractor={(b) => b.id}
                renderItem={(b) => <PromoSlide banner={b} />}
                autoPlayMs={4500}
                gap={16}
                itemWidthRatio={0.86}
                style={styles.carousel}
              />
            ) : (
              <View style={styles.carousel}>
                <Skeleton height={148} radius={20} style={styles.hPad} width="86%" />
              </View>
            )}
            <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
              {"What's on your mind?"}
            </Text>
            <FlatList
              horizontal
              data={home.data?.cuisines ?? []}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cuisines}
              renderItem={({ item: c }) => (
                <ArtTile
                  art={c.art}
                  label={c.name}
                  size={68}
                  shape="circle"
                  onPress={() => router.push({ pathname: '/search', params: { cuisine: c.name } })}
                />
              )}
              ListEmptyComponent={
                <View style={styles.cuisineSkeletons}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} circle height={68} />
                  ))}
                </View>
              }
            />
            <Text variant="overline" color="textSecondary" style={styles.sectionTitle}>
              {restaurants ? `${restaurants.length} restaurants to explore` : 'Restaurants to explore'}
            </Text>
          </View>
        );
      case 'filters':
        return (
          <View style={[styles.filtersBar, { backgroundColor: colors.background }]}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
              data={['sort', ...FILTERS.map((f) => f.key)]}
              keyExtractor={(k) => k}
              renderItem={({ item: key }) => {
                if (key === 'sort') {
                  return (
                    <Chip
                      label={filters.sort === 'relevance' ? 'Sort' : (sortLabel ?? 'Sort')}
                      icon={{ name: 'swap-vertical' }}
                      dropdown
                      selected={filters.sort !== 'relevance'}
                      onPress={() => setSortOpen(true)}
                    />
                  );
                }
                const f = FILTERS.find((x) => x.key === key)!;
                return (
                  <Chip
                    label={f.label}
                    selected={filters.active.includes(f.key)}
                    removable
                    onPress={() => setFilters((s) => toggleFilter(s, f.key))}
                  />
                );
              }}
            />
          </View>
        );
      case 'restaurant':
        return <RestaurantCard restaurant={item.restaurant} onPress={openRestaurant} />;
      case 'skeleton':
        return <RestaurantCardSkeleton />;
      case 'empty':
        return (
          <View style={styles.empty}>
            <ArtTile art="compass" size={96} shape="circle" decorative />
            <Text variant="title3" align="center">
              No restaurants match
            </Text>
            <Text variant="footnote" color="textSecondary" align="center">
              Try removing a filter to see more places.
            </Text>
            <Chip label="Clear filters" icon={{ name: 'refresh' }} onPress={() => setFilters(NO_FILTERS)} />
          </View>
        );
      case 'error':
        return <ErrorState art="cooking" error={home.error} onRetry={() => void home.refetch()} />;
    }
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <FlatList
        data={rows}
        keyExtractor={(r, i) => (r.type === 'restaurant' ? r.restaurant.id : r.type === 'skeleton' ? r.key : `${r.type}${i}`)}
        renderItem={renderRow}
        stickyHeaderIndices={rows[1]?.type === 'filters' ? [1] : undefined}
        contentContainerStyle={{ paddingBottom: cartBar ? 96 : 24 }}
        refreshControl={
          <RefreshControl
            refreshing={home.isRefetching}
            onRefresh={() => void home.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        testID="home-list"
      />
      {cartBar ? <CartBar {...cartBar} style={styles.cartBar} testID="cart-bar" /> : null}

      <AddressSheet
        visible={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses.data}
        selectedId={address?.id}
        onSelect={(a) => {
          setAddressOpen(false);
          if (!a.isDefault) saveAddress.mutate({ id: a.id, input: asDefault(a) });
        }}
      />
      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort by" testID="sort-sheet">
        {SORTS.map((s) => (
          <OptionRow
            key={s.key}
            title={s.label}
            selected={filters.sort === s.key}
            onPress={() => {
              setFilters((f) => ({ ...f, sort: s.key }));
              setSortOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  location: { flex: 1 },
  locationTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationLine: { marginLeft: 24 },
  search: { marginHorizontal: 16, marginTop: 14 },
  carousel: { marginTop: 18 },
  hPad: { marginHorizontal: 16 },
  promo: { height: 148, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' },
  promoText: { flex: 1, padding: 18, gap: 4 },
  promoSub: { opacity: 0.92 },
  promoArt: { marginRight: 12 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  sectionTitle: { marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  cuisines: { paddingHorizontal: 16, gap: 14 },
  cuisineSkeletons: { flexDirection: 'row', gap: 14 },
  filtersBar: { paddingVertical: 10 },
  filters: { paddingHorizontal: 16, gap: 8 },
  empty: { alignItems: 'center', gap: 10, padding: 32 },
  cartBar: { position: 'absolute', left: 0, right: 0, bottom: 12 },
});
