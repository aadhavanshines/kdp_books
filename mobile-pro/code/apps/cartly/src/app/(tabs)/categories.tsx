import { useBrands, useProductCategories, useProducts, type ProductCategory } from '@pro/api';
import { Art, ArtTile, Chip, ErrorState, GradientFill, Icon, PressableScale, Price, RatingPill, SectionHeader, Skeleton, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { displayTitle } from '../../components/ProductCard';

function Pane({ category }: { category: ProductCategory }) {
  const theme = useTheme();
  const { colors } = theme;
  const brands = useBrands(category.id);
  const top = useProducts({ category: category.id, sort: 'rating', pageSize: 6 });
  const items = top.data?.pages[0]?.items;
  const shop = (params: Record<string, string>) => router.push({ pathname: '/products', params: { category: category.id, ...params } });
  return (
    <ScrollView contentContainerStyle={styles.pane}>
      <PressableScale onPress={() => shop({})} accessibilityLabel={`Shop all ${category.name}`} scaleTo={0.98} style={styles.hero}>
        <GradientFill colors={theme.tone(category.tone)} />
        <View style={styles.flex}>
          <Text variant="title3" color={theme.onTone(category.tone)}>
            {category.name}
          </Text>
          <View style={styles.row}>
            <Text variant="caption" weight={700} color="primary">
              Shop all
            </Text>
            <Icon name="arrow-forward" size={12} color="primary" />
          </View>
        </View>
        <Art name={category.art} size={72} decorative />
      </PressableScale>

      <SectionHeader title="Shop by price" />
      <View style={styles.chips}>
        <Chip label="Under ₹999" onPress={() => shop({ maxPrice: '999', title: `${category.name} under ₹999` })} />
        <Chip label="40% off or more" onPress={() => shop({ minDiscount: '40', sort: 'discount' })} />
        <Chip label="Top rated" onPress={() => shop({ minRating: '4', sort: 'rating' })} />
      </View>

      <SectionHeader title="Popular brands" />
      <View style={styles.chips}>
        {brands.data
          ? brands.data.map((b) => <Chip key={b} label={b} onPress={() => shop({ brand: b })} />)
          : [0, 1, 2].map((i) => <Skeleton key={i} width={80} height={36} radius={18} />)}
      </View>

      <SectionHeader title="Top rated" onAction={() => shop({ sort: 'rating' })} />
      <View style={styles.grid}>
        {items
          ? items.map((p) => (
              <PressableScale
                key={p.id}
                onPress={() => router.push(`/product/${p.id}`)}
                accessibilityLabel={`${p.title}, rated ${p.rating}`}
                scaleTo={0.97}
                style={[styles.mini, { backgroundColor: colors.surface }, theme.shadow('sm')]}
              >
                <View style={styles.miniArt}>
                  <GradientFill colors={theme.tone(p.tone)} />
                  <Art name={p.art} size={72} decorative />
                </View>
                <View style={styles.miniBody}>
                  <Text variant="caption" numberOfLines={2}>
                    {displayTitle(p.title, p.brand)}
                  </Text>
                  <RatingPill rating={p.rating} />
                  <Price amount={p.price} mrp={p.mrp} size="sm" showDiscount={false} />
                </View>
              </PressableScale>
            ))
          : [0, 1, 2, 3].map((i) => <Skeleton key={i} width="47%" height={190} radius={12} />)}
      </View>
    </ScrollView>
  );
}

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const categories = useProductCategories();
  const [selected, setSelected] = useState<string | null>(null);
  const list = categories.data ?? [];
  const current = list.find((c) => c.id === selected) ?? list[0];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text variant="title2" accessibilityRole="header" style={styles.flex}>
          All categories
        </Text>
        <PressableScale onPress={() => router.push('/search')} accessibilityLabel="Search" style={styles.search}>
          <Icon name="search" size={22} color="text" />
        </PressableScale>
      </View>
      {categories.isError && !categories.data ? (
        <ErrorState error={categories.error} onRetry={() => void categories.refetch()} art="shopping-bags" />
      ) : (
        <View style={styles.body}>
          <ScrollView style={[styles.rail, { backgroundColor: colors.surface, borderRightColor: colors.divider }]} contentContainerStyle={styles.railContent}>
            {list.map((c) => {
              const on = c.id === current?.id;
              return (
                <PressableScale
                  key={c.id}
                  onPress={() => setSelected(c.id)}
                  accessibilityRole="tab"
                  accessibilityLabel={c.name}
                  accessibilityState={{ selected: on }}
                  scaleTo={0.97}
                  style={[styles.railItem, on && { backgroundColor: colors.primarySoft }]}
                >
                  {on ? <View style={[styles.railBar, { backgroundColor: colors.primary }]} /> : null}
                  <ArtTile art={c.art} tone={c.tone} size={48} shape="circle" decorative />
                  <Text variant="caption" weight={on ? 700 : 500} color={on ? 'onPrimarySoft' : 'textSecondary'} align="center" numberOfLines={2}>
                    {c.name}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
          <View style={styles.flex}>{current ? <Pane key={current.id} category={current} /> : <Skeleton height={120} />}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  search: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, flexDirection: 'row' },
  rail: { width: 88, flexGrow: 0, borderRightWidth: StyleSheet.hairlineWidth },
  railContent: { paddingVertical: 4 },
  railItem: { alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 6 },
  railBar: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 4, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  pane: { padding: 12, gap: 12, paddingBottom: 32 },
  hero: { height: 100, borderRadius: 14, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mini: { width: '47%', borderRadius: 12, overflow: 'hidden', flexGrow: 1 },
  miniArt: { height: 104, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniBody: { padding: 8, gap: 4 },
});
