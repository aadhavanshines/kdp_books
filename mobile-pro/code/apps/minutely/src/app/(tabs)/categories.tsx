import { useGroceryCategories } from '@pro/api';
import { ArtTile, ErrorState, Icon, PressableScale, SearchBar, Skeleton, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MinutelyCartBar } from '../../components/MinutelyCartBar';
import { SEARCH_HINTS } from '../../lib/catalog';

export default function CategoriesScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const categories = useGroceryCategories();

  return (
    <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <View style={styles.head}>
        <Text variant="title2" accessibilityRole="header">
          All categories
        </Text>
        <SearchBar rotatingHints={SEARCH_HINTS} onPress={() => router.push('/search')} />
      </View>
      {categories.isError && !categories.data ? (
        <ErrorState art="shopping-trolley" error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {!categories.data
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} height={96} radius={16} />)
            : categories.data.map((c) => (
                <PressableScale
                  key={c.id}
                  onPress={() => router.push(`/category/${c.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${c.name}: ${c.subcategories.join(', ')}`}
                  scaleTo={0.98}
                  style={[styles.row, { backgroundColor: colors.surface }, theme.shadow('sm')]}
                >
                  <ArtTile art={c.art} tone={c.tone} size={72} artScale={0.72} decorative />
                  <View style={styles.flex}>
                    <Text variant="headline">{c.name}</Text>
                    <Text variant="caption" weight={400} color="textMuted" numberOfLines={2}>
                      {c.subcategories.join(' · ')}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={18} color="textMuted" />
                </PressableScale>
              ))}
        </ScrollView>
      )}
      <MinutelyCartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 2 },
  head: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  list: { padding: 16, gap: 10, paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, borderRadius: 16 },
});
