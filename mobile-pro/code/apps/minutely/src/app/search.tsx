import { useGroceries, useGroceryCategories } from '@pro/api';
import { Chip, EmptyState, ErrorState, IconButton, SearchBar, Skeleton, Text, useDebounced, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryTile } from '../components/CategoryTile';
import { MinutelyCartBar } from '../components/MinutelyCartBar';
import { ProductCard } from '../components/ProductCard';
import { inStockFirst, TRENDING } from '../lib/catalog';

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [text, setText] = useState('');
  const q = useDebounced(text.trim(), 250);
  const results = useGroceries({ q });
  const categories = useGroceryCategories();
  const cardWidth = Math.floor((Math.min(width, 520) - 32 - 12) / 2);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface, paddingTop: insets.top + 6 }]}>
      <View style={styles.bar}>
        <IconButton name="arrow-back" label="Go back" onPress={back} />
        <SearchBar value={text} onChangeText={setText} placeholder='Search "milk", "chips"…' autoFocus style={styles.flex} testID="search-input" />
      </View>

      {!q ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text variant="headline">Trending near you</Text>
          <View style={styles.chips}>
            {TRENDING.map((t) => (
              <Chip key={t} label={t} icon={{ name: 'trending-up' }} onPress={() => setText(t)} />
            ))}
          </View>
          <Text variant="headline" style={styles.gapTop}>
            Browse categories
          </Text>
          <View style={styles.cats}>
            {(categories.data ?? []).slice(0, 8).map((c) => (
              <CategoryTile key={c.id} category={c} size={Math.floor((Math.min(width, 520) - 32 - 30) / 4)} />
            ))}
          </View>
        </ScrollView>
      ) : results.isError ? (
        <ErrorState art="shopping-trolley" error={results.error} onRetry={() => void results.refetch()} />
      ) : !results.data || (results.isFetching && results.data.length === 0) ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={cardWidth} height={cardWidth + 90} radius={16} />
          ))}
        </View>
      ) : results.data.length === 0 ? (
        <EmptyState art="shopping-trolley" title={`No results for "${q}"`} message="Check the spelling or try something more general, like “fruit” or “snacks”." />
      ) : (
        <ScrollView contentContainerStyle={styles.grid} keyboardShouldPersistTaps="handled" testID="search-results">
          <Text variant="footnote" color="textMuted" style={styles.count} accessibilityLiveRegion="polite">
            {`${results.data.length} ${results.data.length === 1 ? 'result' : 'results'} for "${q}"`}
          </Text>
          {inStockFirst(results.data).map((item) => (
            <ProductCard key={item.id} item={item} width={cardWidth} testID={`card-${item.id}`} />
          ))}
        </ScrollView>
      )}
      <MinutelyCartBar bottom={insets.bottom + 12} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 4, paddingRight: 16, paddingBottom: 8 },
  content: { padding: 16, gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gapTop: { marginTop: 12 },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, rowGap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 20, padding: 16, paddingBottom: 120 },
  count: { width: '100%' },
});
