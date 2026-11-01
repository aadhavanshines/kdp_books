import { useConversations, useFeed, type Post } from '@pro/api';
import { Divider, EmptyState, ErrorState, IconButton, Skeleton, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommentsSheet } from '../../components/CommentsSheet';
import { PostCard } from '../../components/PostCard';
import { StoriesRow } from '../../components/StoriesRow';
import { Wordmark } from '../../components/Wordmark';

function PostSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={styles.skelHead}>
        <Skeleton circle width={34} height={34} />
        <Skeleton width={120} height={12} />
      </View>
      <Skeleton width="100%" height={393} radius={0} />
      <View style={styles.skelBody}>
        <Skeleton width={140} height={12} />
        <Skeleton width="85%" height={12} />
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // `burst` replays the double-tap heart on the first post (demos and screenshots).
  const { burst } = useLocalSearchParams<{ burst?: string }>();
  const feed = useFeed();
  const unreadChats = useConversations().data?.reduce((n, c) => n + (c.unreadCount > 0 ? 1 : 0), 0) ?? 0;
  const [commentsFor, setCommentsFor] = useState<Post | null>(null);
  const posts = useMemo(() => feed.data?.pages.flatMap((p) => p.items) ?? [], [feed.data]);
  // Keep the sheet's post in sync with cache updates (new comment counts).
  const sheetPost = commentsFor ? (posts.find((p) => p.id === commentsFor.id) ?? commentsFor) : null;
  const openComments = useCallback((post: Post) => setCommentsFor(post), []);

  return (
    <View style={[styles.fill, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Wordmark size={26} variant="title2" />
        <View style={styles.barActions}>
          <IconButton name="paper-plane-outline" label={unreadChats ? `Messages, ${unreadChats} unread` : 'Messages'} iconSize={25} badge={unreadChats || undefined} onPress={() => router.push('/messages')} />
        </View>
      </View>
      {feed.isError && !posts.length ? (
        <ErrorState error={feed.error} onRetry={() => void feed.refetch()} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.id}
          renderItem={({ item, index }) => <PostCard post={item} onOpenComments={openComments} initialBurst={index === 0 && burst ? 1 : 0} />}
          ListHeaderComponent={
            <>
              <StoriesRow />
              <Divider />
            </>
          }
          ListEmptyComponent={
            feed.isPending ? (
              <PostSkeleton />
            ) : (
              <EmptyState art="camera-with-flash" title="Welcome to Lumo" message="Follow people to see their photos here." actionLabel="Explore" onAction={() => router.navigate('/explore')} />
            )
          }
          onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && void feed.fetchNextPage()}
          onEndReachedThreshold={1.5}
          ListFooterComponent={feed.isFetchingNextPage ? <PostSkeleton /> : undefined}
          refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => void feed.refetch()} tintColor={colors.textMuted} />}
          showsVerticalScrollIndicator={false}
          windowSize={7}
        />
      )}
      <CommentsSheet post={sheetPost} onClose={() => setCommentsFor(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 4 },
  barActions: { flexDirection: 'row' },
  skeleton: { paddingBottom: 16, gap: 10 },
  skelHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 8 },
  skelBody: { gap: 8, paddingHorizontal: 14 },
});
