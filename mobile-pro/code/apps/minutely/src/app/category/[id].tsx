import { useGroceries, useGroceryCategories, type GrocerySort } from '@pro/api';
import {
  ArtTile,
  BottomSheet,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  OptionRow,
  PressableScale,
  ScreenHeader,
  Skeleton,
  Text,
  useTheme,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { MinutelyCartBar } from '../../components/MinutelyCartBar';
import { ProductCard } from '../../components/ProductCard';
import { inStockFirst, SORT_OPTIONS, sortLabel } from '../../lib/catalog';

const RAIL = 84;
const GAP = 10;

export default function CategoryScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useGroceryCategories();
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState<GrocerySort>('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const category = categories.data?.find((c) => c.id === id);
  const products = useGroceries({ category: id, subcategory: subcategory ?? undefined, sort: sort === 'relevance' ? undefined : sort });
  const cardWidth = Math.floor((Math.min(width, 520) - RAIL - 12 * 2 - GAP) / 2);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const select = (next: string) => {
    if (next === id) return;
    setSubcategory(null);
    router.setParams({ id: next });
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }]}>
      <ScreenHeader
        onBack={back}
        title={category?.name ?? 'Category'}
        subtitle={products.data ? `${products.data.length} items` : undefined}
        right={<IconButton name="search" label="Search products" onPress={() => router.push('/search')} />}
      />
      <View style={[styles.body, { borderTopColor: colors.divider }]}>
        <ScrollView style={[styles.rail, { borderRightColor: colors.divider }]} contentContainerStyle={styles.railContent} showsVerticalScrollIndicator={false} testID="category-rail">
          {(categories.data ?? []).map((c) => {
            const selected = c.id === id;
            return (
              <PressableScale
                key={c.id}
                onPress={() => select(c.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={c.name}
                style={styles.railItem}
              >
                <ArtTile art={c.art} tone={c.tone} size={52} shape="circle" artScale={0.7} decorative />
                <Text variant="caption" weight={selected ? 700 : 500} color={selected ? 'text' : 'textSecondary'} align="center" numberOfLines={2} style={styles.railLabel}>
                  {c.name}
                </Text>
                {selected ? <View style={[styles.railMark, { backgroundColor: colors.primary }]} /> : null}
              </PressableScale>
            );
          })}
        </ScrollView>

        <View style={[styles.flex, { backgroundColor: colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
            <Chip label={sort === 'relevance' ? 'Sort' : sortLabel(sort)} icon={{ name: 'swap-vertical' }} dropdown selected={sort !== 'relevance'} onPress={() => setSortOpen(true)} />
            {(category?.subcategories ?? []).map((s) => (
              <Chip key={s} label={s} selected={subcategory === s} onPress={() => setSubcategory(subcategory === s ? null : s)} />
            ))}
          </ScrollView>

          {products.isError && !products.data ? (
            <ErrorState art="shopping-trolley" error={products.error} onRetry={() => void products.refetch()} />
          ) : !products.data ? (
            <View style={styles.grid}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} width={cardWidth} height={cardWidth + 90} radius={16} />
              ))}
            </View>
          ) : products.data.length === 0 ? (
            <EmptyState art="shopping-trolley" title="Nothing here yet" message="Try another filter." actionLabel="Clear filters" onAction={() => setSubcategory(null)} />
          ) : (
            <ScrollView contentContainerStyle={styles.grid} testID="product-grid">
              {inStockFirst(products.data).map((item) => (
                <View key={item.id} style={[styles.cell, { backgroundColor: colors.surface }]}>
                  <ProductCard item={item} width={cardWidth - 16} testID={`card-${item.id}`} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      <MinutelyCartBar />

      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {SORT_OPTIONS.map((o) => (
          <OptionRow
            key={o.key}
            title={o.label}
            selected={sort === o.key}
            onPress={() => {
              setSort(o.key);
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
  flex: { flex: 1 },
  body: { flex: 1, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  rail: { width: RAIL, flexGrow: 0, borderRightWidth: StyleSheet.hairlineWidth },
  railContent: { paddingVertical: 8, paddingBottom: 96 },
  railItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, gap: 4, minHeight: 44 },
  railLabel: { fontSize: 11, lineHeight: 14 },
  railMark: { position: 'absolute', right: 0, top: 10, bottom: 10, width: 4, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  filterBar: { flexGrow: 0, flexShrink: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filters: { gap: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, padding: 12, paddingBottom: 104 },
  cell: { borderRadius: 16, padding: 8 },
});
