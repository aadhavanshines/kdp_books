import { useExplore, useSearchUsers, type Post } from '@pro/api';
import { Avatar, EmptyState, ErrorState, ListItem, SearchBar, Skeleton, Text, useDebounced, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRID_GAP, PostTile } from '../../components/PostGrid';
import { exploreRows, type ExploreRow } from '../../lib/explore';

function Row({ row, tile }: { row: ExploreRow<Post>; tile: number }) {
  if (row.kind === 'row') {
    return (
      <View style={styles.row}>
        {row.items.map((p) => (
          <PostTile key={p.id} post={p} size={tile} />
        ))}
      </View>
    );
  }
  const big = <PostTile post={row.big} size={tile * 2 + GRID_GAP} />;
  const small = (
    <View style={styles.column}>
      {row.small.map((p) => (
        <PostTile key={p.id} post={p} size={tile} />
      ))}
    </View>
  );
  return <View style={styles.row}>{row.side === 'left' ? [<View key="b">{big}</View>, <View key="s">{small}</View>] : [<View key="s">{small}</View>, <View key="b">{big}</View>]}</View>;
}

export default function ExploreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tile = (width - GRID_GAP * 2) / 3;
  const [query, setQuery] = useState('');
  const term = useDebounced(query.trim(), 250);
  const explore = useExplore();
  const people = useSearchUsers(term);
  const rows = useMemo(() => exploreRows(explore.data?.pages.flatMap((p) => p.items) ?? []), [explore.data]);
  const searching = query.trim().length > 0;

  return (
    <View style={[styles.fill, { paddingTop: insets.top + 6, backgroundColor: colors.surface }]}>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search" style={styles.search} testID="explore-search" />
      {searching ? (
        <FlatList
          data={people.data ?? []}
          keyExtractor={(u) => u.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <ListItem
              title={item.handle}
              subtitle={`${item.name}${item.isFollowing ? ' • Following' : ''}`}
              leading={<Avatar name={item.name} art={item.avatar} size={44} />}
              onPress={() => router.push(`/user/${item.handle}`)}
            />
          )}
          ListEmptyComponent={
            people.isFetching || term !== query.trim() ? undefined : (
              <Text variant="footnote" color="textMuted" align="center" style={styles.none}>
                {`No accounts match "${query.trim()}"`}
              </Text>
            )
          }
        />
      ) : explore.isError && !rows.length ? (
        <ErrorState error={explore.error} onRetry={() => void explore.refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => r.key}
          renderItem={({ item }) => <Row row={item} tile={tile} />}
          contentContainerStyle={styles.grid}
          onEndReached={() => explore.hasNextPage && !explore.isFetchingNextPage && void explore.fetchNextPage()}
          onEndReachedThreshold={1}
          ListEmptyComponent={
            explore.isPending ? (
              <View style={styles.row}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} width={tile} height={tile} radius={0} />
                ))}
              </View>
            ) : (
              <EmptyState art="compass" title="Nothing to explore yet" />
            )
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  search: { marginHorizontal: 12, marginBottom: 8 },
  grid: { gap: GRID_GAP },
  row: { flexDirection: 'row', gap: GRID_GAP },
  column: { gap: GRID_GAP },
  none: { padding: 24 },
});
