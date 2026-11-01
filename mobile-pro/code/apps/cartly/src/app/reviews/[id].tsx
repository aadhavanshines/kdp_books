import { useProduct, useReviews } from '@pro/api';
import { Chip, ErrorState, RatingBreakdown, ScreenHeader, Skeleton, Text, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, View } from 'react-native';

import { ReviewCard } from '../../components/ProductParts';

type Sort = 'helpful' | 'recent' | 'rating_high' | 'rating_low';
const SORTS: { key: Sort; label: string }[] = [
  { key: 'helpful', label: 'Most helpful' },
  { key: 'recent', label: 'Most recent' },
  { key: 'rating_high', label: 'Highest rated' },
  { key: 'rating_low', label: 'Lowest rated' },
];

export default function ReviewsScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sort, setSort] = useState<Sort>('helpful');
  const product = useProduct(id);
  const reviews = useReviews(id, sort);
  const first = reviews.data?.pages[0];
  const items = reviews.data?.pages.flatMap((p) => p.items) ?? [];

  const header = (
    <View style={[styles.top, { backgroundColor: colors.surface }]}>
      {first ? (
        <RatingBreakdown average={first.summary.average} count={first.summary.count} breakdown={first.summary.breakdown} reviewCount={first.total} />
      ) : (
        <Skeleton height={110} />
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {SORTS.map((s) => (
          <Chip key={s.key} label={s.label} selected={sort === s.key} onPress={() => setSort(s.key)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader onBack={() => (router.canGoBack() ? router.back() : router.replace(`/product/${id}`))} title="Ratings and reviews" subtitle={product.data?.title} />
      {reviews.isError && !reviews.data ? (
        <ErrorState error={reviews.error} onRetry={() => void reviews.refetch()} art="white-medium-star" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <View style={[styles.item, { backgroundColor: colors.surface }]}>
              <ReviewCard review={item} />
            </View>
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (reviews.hasNextPage && !reviews.isFetchingNextPage) void reviews.fetchNextPage();
          }}
          ListFooterComponent={
            reviews.isFetchingNextPage || !reviews.data ? (
              <ActivityIndicator color={colors.primary} style={styles.more} accessibilityLabel="Loading reviews" />
            ) : (
              <Text variant="caption" color="textMuted" align="center" style={styles.more}>
                {items.length ? 'That is every review' : 'No reviews yet'}
              </Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { padding: 16, gap: 16, marginBottom: 8 },
  chips: { gap: 8 },
  item: { paddingHorizontal: 16 },
  more: { marginVertical: 20 },
});
