import { useCuisines, usePlatterSearch, useRestaurants, type DishResult, type RestaurantSummary } from '@pro/api';
import {
  ArtTile,
  CartBar,
  Chip,
  Divider,
  EmptyState,
  ErrorState,
  formatINR,
  Icon,
  PressableScale,
  RatingPill,
  SearchBar,
  SegmentedControl,
  Skeleton,
  Text,
  useDebounced,
  useTheme,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useItemAdder } from '../../components/ItemAdder';
import { MenuItemRow } from '../../components/MenuItemRow';
import { deliveryWindow } from '../../components/RestaurantCard';
import { useCartSummary } from '../../lib/useCartSummary';

const POPULAR = ['Biryani', 'Paneer tikka', 'Masala dosa', 'Pizza', 'Brownie', 'Momos'];

function RestaurantRow({ r }: { r: RestaurantSummary }) {
  return (
    <PressableScale
      onPress={() => router.push(`/restaurant/${r.id}`)}
      accessibilityLabel={`${r.name}, rated ${r.rating}, ${deliveryWindow(r)}`}
      scaleTo={0.98}
      style={styles.rRow}
    >
      <ArtTile art={r.art} tone={r.tone} size={76} decorative />
      <View style={styles.flex}>
        <Text variant="headline" weight={700} numberOfLines={1}>
          {r.name}
        </Text>
        <View style={styles.meta}>
          <RatingPill rating={r.rating} />
          <Text variant="footnote" weight={600}>
            {deliveryWindow(r)}
          </Text>
          <Text variant="footnote" color="textMuted">
            {`• ${formatINR(r.costForTwo)} for two`}
          </Text>
        </View>
        <Text variant="footnote" color="textMuted" numberOfLines={1}>
          {`${r.cuisines.join(', ')} • ${r.locality}`}
        </Text>
        {r.offer ? (
          <View style={styles.meta}>
            <Icon name="pricetag" size={12} color="primary" />
            <Text variant="caption" weight={700} color="primary">
              {r.offer}
            </Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

function ResultSkeleton() {
  return (
    <View style={styles.rRow}>
      <Skeleton width={76} height={76} radius={16} />
      <View style={[styles.flex, styles.skeletonText]}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; cuisine?: string; offers?: string }>();
  const [text, setText] = useState(params.q ?? '');
  const [cuisine, setCuisine] = useState(params.cuisine);
  const [offers, setOffers] = useState(params.offers === '1');
  const [tab, setTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const q = useDebounced(text.trim(), 250);
  const cuisines = useCuisines();
  const adder = useItemAdder(undefined);
  const cartBar = useCartSummary();

  // Links from Home (cuisine tiles, banners) replace the current search.
  const linkKey = `${params.cuisine ?? ''}|${params.offers ?? ''}|${params.q ?? ''}`;
  const [lastLink, setLastLink] = useState(linkKey);
  if (linkKey !== lastLink) {
    setLastLink(linkKey);
    setCuisine(params.cuisine);
    setOffers(params.offers === '1');
    setText(params.q ?? '');
  }

  const browsing = !!cuisine || offers;
  const search = usePlatterSearch(browsing ? '' : q);
  const browse = useRestaurants({ cuisine, offers: offers || undefined, q: q || undefined });
  const searching = !browsing && q.length >= 2;

  const clearBrowse = () => {
    setCuisine(undefined);
    setOffers(false);
    router.setParams({ cuisine: undefined, offers: undefined, q: undefined });
  };

  let body: React.ReactNode;
  if (browsing) {
    body = (
      <FlatList
        key="browse"
        data={browse.data ?? []}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RestaurantRow r={item} />}
        ItemSeparatorComponent={() => <Divider inset="lg" />}
        ListHeaderComponent={
          <Text variant="overline" color="textSecondary" style={styles.listTitle}>
            {browse.data ? `${browse.data.length} restaurants` : 'Finding restaurants'}
          </Text>
        }
        ListEmptyComponent={
          browse.isLoading ? (
            <>{[0, 1, 2, 3].map((i) => <ResultSkeleton key={i} />)}</>
          ) : browse.isError ? (
            <ErrorState art="cooking" error={browse.error} onRetry={() => void browse.refetch()} />
          ) : (
            <EmptyState art="compass" title="Nothing here yet" message="No restaurants match right now." actionLabel="Clear" onAction={clearBrowse} />
          )
        }
        contentContainerStyle={{ paddingBottom: cartBar ? 96 : 24 }}
        keyboardShouldPersistTaps="handled"
      />
    );
  } else if (!searching) {
    body = (
      <FlatList
        key="explore"
        data={cuisines.data ?? []}
        numColumns={4}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View>
            <Text variant="overline" color="textSecondary" style={styles.listTitle}>
              Popular searches
            </Text>
            <View style={styles.popular}>
              {POPULAR.map((p) => (
                <Chip key={p} label={p} icon={{ name: 'trending-up' }} onPress={() => setText(p)} />
              ))}
            </View>
            <Text variant="overline" color="textSecondary" style={styles.listTitle}>
              Explore cuisines
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gridCell}>
            <ArtTile art={item.art} label={item.name} size={68} shape="circle" onPress={() => setCuisine(item.name)} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: cartBar ? 96 : 24 }}
      />
    );
  } else {
    const data = search.data;
    const counts = { restaurants: data?.restaurants.length ?? 0, dishes: data?.dishes.length ?? 0 };
    const rows: (RestaurantSummary | DishResult)[] = tab === 'restaurants' ? (data?.restaurants ?? []) : (data?.dishes ?? []);
    body = (
      <FlatList
        key="results"
        data={rows}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <Divider inset="lg" />}
        ListHeaderComponent={
          <SegmentedControl
            options={[
              { key: 'restaurants', label: `Restaurants${data ? ` (${counts.restaurants})` : ''}` },
              { key: 'dishes', label: `Dishes${data ? ` (${counts.dishes})` : ''}` },
            ]}
            value={tab}
            onChange={setTab}
            style={styles.segment}
          />
        }
        renderItem={({ item }) =>
          'restaurantName' in item ? (
            <MenuItemRow
              item={item}
              restaurantName={item.restaurantName}
              quantity={adder.quantityOf(item.id)}
              onChange={(dish, n) => adder.change(dish, n, item.restaurantName)}
            />
          ) : (
            <RestaurantRow r={item} />
          )
        }
        ListEmptyComponent={
          search.isLoading ? (
            <>{[0, 1, 2, 3].map((i) => <ResultSkeleton key={i} />)}</>
          ) : search.isError ? (
            <ErrorState art="cooking" error={search.error} onRetry={() => void search.refetch()} />
          ) : (
            <EmptyState
              art="compass"
              title={`No ${tab} for "${q}"`}
              message="Check the spelling or try a cuisine like biryani or pizza."
            />
          )
        }
        contentContainerStyle={{ paddingBottom: cartBar ? 96 : 24 }}
      />
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }]}>
      <View style={[styles.top, { paddingTop: insets.top + 8, borderBottomColor: colors.divider }]}>
        <SearchBar
          value={text}
          onChangeText={setText}
          placeholder="Search for dishes or restaurants"
          autoFocus={!browsing && !params.q}
          testID="search-input"
        />
        {browsing ? (
          <View style={styles.activeFilters}>
            {cuisine ? <Chip label={cuisine} selected removable onPress={clearBrowse} /> : null}
            {offers ? <Chip label="Offers" icon={{ name: 'pricetag' }} selected removable onPress={clearBrowse} /> : null}
          </View>
        ) : null}
      </View>
      {body}
      {cartBar ? <CartBar {...cartBar} style={styles.cartBar} /> : null}
      {adder.sheets}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 3 },
  top: { paddingHorizontal: 16, paddingBottom: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  activeFilters: { flexDirection: 'row', gap: 8 },
  listTitle: { marginHorizontal: 16, marginTop: 20, marginBottom: 12 },
  popular: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  gridRow: { paddingHorizontal: 8 },
  gridCell: { flex: 1, alignItems: 'center', marginBottom: 16 },
  segment: { marginHorizontal: 16, marginTop: 12, marginBottom: 4 },
  rRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  skeletonText: { gap: 8 },
  cartBar: { position: 'absolute', left: 0, right: 0, bottom: 12 },
});
