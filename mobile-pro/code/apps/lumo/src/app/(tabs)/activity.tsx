import { useLumoNotifications, useMarkLumoNotificationsRead, useToggleFollow, type LumoNotification } from '@pro/api';
import { Avatar, EmptyState, ErrorState, PhotoScene, PressableScale, Skeleton, Text, timeAgo, useTheme } from '@pro/ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '../../components/PillButton';
import { activitySections } from '../../lib/activity';

function ActivityRow({ n, onFollow }: { n: LumoNotification; onFollow: () => void }) {
  const open = () => (n.post ? router.push(`/post/${n.post.id}`) : router.push(`/user/${n.actor.handle}`));
  const age = timeAgo(n.createdAt).replace(' ago', '');
  return (
    <View style={styles.row}>
      <Avatar name={n.actor.name} art={n.actor.avatar} size={44} onPress={() => router.push(`/user/${n.actor.handle}`)} />
      <PressableScale onPress={open} scaleTo={1} accessibilityRole="button" accessibilityLabel={`${n.isRead ? '' : 'New. '}${n.actor.handle} ${n.text} ${age}`} style={styles.textWrap}>
        <Text variant="footnote" numberOfLines={3}>
          <Text variant="footnote" weight={700}>
            {n.actor.handle}
          </Text>
          {` ${n.text} `}
          <Text variant="footnote" color="textMuted">
            {age}
          </Text>
        </Text>
      </PressableScale>
      {n.kind === 'follow' ? (
        <PillButton
          title={n.actor.isFollowing ? 'Following' : 'Follow back'}
          tone={n.actor.isFollowing ? 'muted' : 'accent'}
          onPress={onFollow}
          accessibilityLabel={n.actor.isFollowing ? `Unfollow ${n.actor.handle}` : `Follow ${n.actor.handle} back`}
          style={styles.follow}
        />
      ) : n.post ? (
        <PressableScale onPress={open} accessibilityLabel="Open post" style={styles.thumb}>
          <PhotoScene scene={n.post.scene} seed={n.post.id} compact radius={6} />
        </PressableScale>
      ) : null}
    </View>
  );
}

export default function ActivityScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const list = useLumoNotifications();
  const markRead = useMarkLumoNotificationsRead();
  const follow = useToggleFollow();
  const sections = useMemo(() => activitySections(list.data ?? []), [list.data]);
  const hasUnread = !!list.data?.some((n) => !n.isRead);
  const unreadRef = useRef(hasUnread);
  useEffect(() => {
    unreadRef.current = hasUnread;
  }, [hasUnread]);

  // Leave "New" in place while the screen is open; mark it read on the way out.
  useFocusEffect(
    useCallback(
      () => () => {
        if (unreadRef.current) markRead.mutate();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate is stable enough; run per focus
      [],
    ),
  );

  return (
    <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <View style={styles.bar}>
        <Text variant="title2" weight={800} accessibilityRole="header">
          Notifications
        </Text>
      </View>
      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : list.isPending ? (
        <View style={styles.skel}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.row}>
              <Skeleton circle width={44} height={44} />
              <Skeleton width="60%" height={12} />
            </View>
          ))}
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(n) => n.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text variant="headline" weight={700} style={styles.section}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => <ActivityRow n={item} onFollow={() => follow.mutate({ userId: item.actor.id, follow: !item.actor.isFollowing })} />}
          ListEmptyComponent={<EmptyState art="red-heart" title="Activity on your posts" message="When someone likes or comments on your posts, you'll see it here." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { height: 52, justifyContent: 'center', paddingHorizontal: 16 },
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  textWrap: { flex: 1, minHeight: 44, justifyContent: 'center' },
  follow: { minWidth: 104 },
  thumb: { width: 44, height: 44 },
  skel: { gap: 4 },
});
