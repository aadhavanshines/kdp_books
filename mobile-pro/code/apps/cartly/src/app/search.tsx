import { useProductCategories, useSearchSuggestions, type SearchSuggestion } from '@pro/api';
import { ArtTile, Chip, Icon, IconButton, PressableScale, SearchBar, SectionHeader, Text, useDebounced, useTheme, type IoniconName } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { highlightParts, suggestionHref, TRENDING_SEARCHES } from '../lib/search';
import { useRecentSearches } from '../lib/useRecentSearches';

const KIND_ICON: Record<SearchSuggestion['kind'], IoniconName> = {
  query: 'search',
  category: 'grid-outline',
  brand: 'pricetag-outline',
  product: 'cube-outline',
};
const KIND_LABEL: Record<SearchSuggestion['kind'], string> = { query: 'Search', category: 'in Categories', brand: 'Brand', product: 'Product' };

function SuggestionRow({ s, query, onPress, onFill }: { s: SearchSuggestion; query: string; onPress: () => void; onFill: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <PressableScale onPress={onPress} accessibilityLabel={`${s.text}, ${KIND_LABEL[s.kind]}`} scaleTo={0.99} style={styles.rowMain}>
        <View style={[styles.kindIcon, { backgroundColor: colors.surfaceMuted }]}>
          <Icon name={KIND_ICON[s.kind]} size={16} color="textSecondary" />
        </View>
        <View style={styles.flex}>
          <Text variant="subhead" weight={400} numberOfLines={1}>
            {highlightParts(s.text, query).map((part, i) => (
              <Text key={i} variant="subhead" weight={part.match ? 700 : 400}>
                {part.text}
              </Text>
            ))}
          </Text>
          {s.kind !== 'query' ? (
            <Text variant="caption" weight={400} color={s.kind === 'category' ? 'primary' : 'textMuted'}>
              {KIND_LABEL[s.kind]}
            </Text>
          ) : null}
        </View>
      </PressableScale>
      <IconButton set="mci" name="arrow-top-left" label={`Fill search with ${s.text}`} size={36} iconSize={20} color="textMuted" onPress={onFill} />
    </View>
  );
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const term = useDebounced(q, 200);
  const suggestions = useSearchSuggestions(term);
  const categories = useProductCategories();
  const { recent, add, clear } = useRecentSearches();
  const searching = q.trim().length > 0;

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    add(t);
    router.push({ pathname: '/products', params: { q: t } });
  };
  const open = (s: SearchSuggestion) => {
    add(s.text);
    router.push(suggestionHref(s) as never);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface, paddingTop: insets.top + 6 }]}>
      <View style={styles.bar}>
        <IconButton name="arrow-back" label="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <SearchBar value={q} onChangeText={setQ} onSubmit={submit} autoFocus placeholder="Search for products, brands and more" style={styles.flex} testID="search-input" />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        {searching ? (
          (suggestions.data ?? []).map((s, i) => (
            <SuggestionRow key={`${s.kind}-${s.id ?? s.text}-${i}`} s={s} query={q} onPress={() => (s.kind === 'query' ? submit(q) : open(s))} onFill={() => setQ(s.text)} />
          ))
        ) : (
          <>
            {recent.length ? (
              <View style={styles.block}>
                <SectionHeader title="Recent searches" actionLabel="Clear" onAction={clear} />
                <View style={styles.chips}>
                  {recent.map((r) => (
                    <Chip key={r} label={r} icon={{ name: 'time-outline' }} onPress={() => submit(r)} />
                  ))}
                </View>
              </View>
            ) : null}
            <View style={styles.block}>
              <SectionHeader title="Trending in Northbay" />
              {TRENDING_SEARCHES.map((t, i) => (
                <PressableScale key={t} onPress={() => submit(t)} accessibilityLabel={`Trending: ${t}`} scaleTo={0.99} style={styles.trend}>
                  <Text variant="subhead" weight={800} color="primary" style={styles.rank} tabular>
                    {i + 1}
                  </Text>
                  <Text variant="subhead" weight={500} style={styles.flex}>
                    {t}
                  </Text>
                  <Icon name="trending-up" size={18} color="success" />
                </PressableScale>
              ))}
            </View>
            <View style={styles.block}>
              <SectionHeader title="Popular categories" />
              <View style={styles.catGrid}>
                {(categories.data ?? []).slice(0, 8).map((c) => (
                  <ArtTile key={c.id} art={c.art} tone={c.tone} label={c.name} size={64} onPress={() => router.push({ pathname: '/products', params: { category: c.id } })} style={styles.cat} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 4, paddingRight: 16, paddingBottom: 8 },
  content: { paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  kindIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  block: { paddingHorizontal: 16, paddingTop: 18, gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  rank: { width: 18 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  cat: { width: '23%' },
});
