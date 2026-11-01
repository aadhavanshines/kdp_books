import { useProductCategories, useProducts, type ProductSummary } from '@pro/api';
import { Chip, EmptyState, ErrorState, Icon, IconButton, PressableScale, ScreenHeader, Text, formatNumber, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { CartButton } from '../components/CartButton';
import { FilterSheet, SortSheet } from '../components/FilterSheets';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import {
  activeFilterCount,
  appliedFilters,
  discountLabel,
  fromParams,
  listingTitle,
  NO_FILTERS,
  priceLabel,
  ratingLabel,
  SORTS,
  toggleBrand,
  toProductQuery,
  type ListingParams,
} from '../lib/filters';

const QUICK_PRICE = { max: 999 };

export default function ProductsScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const params = useLocalSearchParams<ListingParams & Record<string, string>>();
  const start = useMemo(() => fromParams(params), [params]);
  const [filters, setFilters] = useState(start.filters);
  const [sheet, setSheet] = useState<'filter' | 'sort' | null>(null);
  const query = toProductQuery(start.base, filters);
  const list = useProducts(query);
  const categories = useProductCategories();
  const { width } = useWindowDimensions();
  const cardWidth = (Math.min(width, 600) - 16 * 2 - 12) / 2;
  const items = useMemo(() => list.data?.pages.flatMap((p) => p.items) ?? [], [list.data]);
  const first = list.data?.pages[0];
  const total = first?.total;
  const categoryName = categories.data?.find((c) => c.id === start.base.category)?.name;
  const title = listingTitle(params, categoryName);
  const count = activeFilterCount(filters);
  const sortLabel = SORTS.find((s) => s.key === filters.sort)?.label ?? 'Relevance';
  const applied = appliedFilters(filters);
  const topBrands = (first?.facets.brands ?? []).slice(0, 4).filter((b) => !filters.brands.includes(b.name));

  const toolbar = (
    <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
      <View style={styles.tools}>
        <PressableScale onPress={() => setSheet('sort')} accessibilityLabel={`Sort, ${sortLabel}`} scaleTo={0.98} style={styles.tool} testID="open-sort">
          <Icon name="swap-vertical" size={18} color="text" />
          <View>
            <Text variant="subhead" weight={700}>
              Sort
            </Text>
            <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
              {sortLabel}
            </Text>
          </View>
        </PressableScale>
        <View style={[styles.toolDivider, { backgroundColor: colors.divider }]} />
        <PressableScale onPress={() => setSheet('filter')} accessibilityLabel={count ? `Filter, ${count} applied` : 'Filter'} scaleTo={0.98} style={styles.tool} testID="open-filter">
          <Icon name="options-outline" size={18} color="text" />
          <View>
            <Text variant="subhead" weight={700}>
              {count ? `Filter (${count})` : 'Filter'}
            </Text>
            <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
              Price, brand, rating
            </Text>
          </View>
        </PressableScale>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {applied.map((a) => (
          <Chip key={a.key} label={a.label} selected removable onPress={() => setFilters((f) => a.remove(f))} />
        ))}
        {filters.minRating == null ? <Chip label={ratingLabel(4)} onPress={() => setFilters((f) => ({ ...f, minRating: 4 }))} /> : null}
        {filters.minDiscount == null ? <Chip label={discountLabel(30)} onPress={() => setFilters((f) => ({ ...f, minDiscount: 30 }))} /> : null}
        {!filters.price ? <Chip label={priceLabel(QUICK_PRICE)} onPress={() => setFilters((f) => ({ ...f, price: QUICK_PRICE }))} /> : null}
        {topBrands.map((b) => (
          <Chip key={b.name} label={b.name} onPress={() => setFilters((f) => toggleBrand(f, b.name))} />
        ))}
      </ScrollView>
    </View>
  );

  let body;
  if (list.isError && !list.data) body = <ErrorState error={list.error} onRetry={() => void list.refetch()} art="shopping-bags" />;
  else if (!list.data)
    body = (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <ProductCardSkeleton key={i} width={cardWidth} />
        ))}
      </View>
    );
  else if (items.length === 0)
    body = (
      <EmptyState
        art="compass"
        title="No matching products"
        message={count ? 'Try removing a filter or two to see more.' : 'Check the spelling or try a more general term.'}
        actionLabel={count ? 'Clear filters' : 'Search again'}
        onAction={() => (count ? setFilters({ ...NO_FILTERS, sort: filters.sort }) : router.push('/search'))}
      />
    );
  else
    body = (
      <FlatList
        testID="product-list"
        data={items}
        keyExtractor={(p: ProductSummary) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => {
          if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
        }}
        ListFooterComponent={
          list.isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.more} accessibilityLabel="Loading more products" />
          ) : !list.hasNextPage && items.length > 4 ? (
            <Text variant="caption" color="textMuted" align="center" style={styles.more}>
              {"You've seen all the results"}
            </Text>
          ) : undefined
        }
      />
    );

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        title={title}
        subtitle={total != null ? `${formatNumber(total)} ${total === 1 ? 'result' : 'results'}` : 'Loading…'}
        right={
          <>
            <IconButton name="search" label="Search" onPress={() => router.push('/search')} />
            <CartButton />
          </>
        }
      />
      {toolbar}
      <View style={styles.fill}>{body}</View>

      <FilterSheet
        visible={sheet === 'filter'}
        onClose={() => setSheet(null)}
        value={filters}
        facets={first?.facets}
        onApply={(next) => {
          setFilters(next);
          setSheet(null);
        }}
      />
      <SortSheet
        visible={sheet === 'sort'}
        onClose={() => setSheet(null)}
        value={filters.sort}
        onChange={(sort) => {
          setFilters((f) => ({ ...f, sort }));
          setSheet(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  toolbar: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10 },
  tools: { flexDirection: 'row', alignItems: 'center' },
  tool: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 52 },
  toolDivider: { width: StyleSheet.hairlineWidth, height: 28 },
  chips: { paddingHorizontal: 16, gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  column: { gap: 12 },
  listContent: { padding: 16, gap: 12 },
  more: { marginVertical: 16 },
});
