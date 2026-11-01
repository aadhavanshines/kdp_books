import {
  useProfile,
  useProfilePosts,
  useStartConversation,
  useStories,
  useToggleFollow,
  type Highlight,
  type LumoProfile,
} from '@pro/api';
import { Avatar, EmptyState, ErrorState, Icon, IconButton, PhotoScene, PressableScale, Skeleton, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { statCount } from '../lib/likes';
import { Caption } from './Caption';
import { PillButton } from './PillButton';
import { PostGrid } from './PostGrid';
import { VerifiedBadge } from './PostCard';

type Tab = 'grid' | 'tagged';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${value} ${label}`}>
      <Text variant="headline" weight={700} tabular>
        {statCount(value)}
      </Text>
      <Text variant="footnote">{label}</Text>
    </View>
  );
}

function HighlightBubble({ highlight, profile }: { highlight: Highlight; profile: LumoProfile }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      accessibilityLabel={`Highlight: ${highlight.title}`}
      onPress={() =>
        router.push({ pathname: '/story/[id]', params: { id: profile.id, highlight: highlight.id, handle: profile.handle, title: highlight.title } })
      }
      style={styles.highlight}
    >
      <View style={[styles.hlRing, { borderColor: colors.border }]}>
        <View style={styles.hlCover}>
          <PhotoScene scene={highlight.cover} seed={highlight.id} compact accessibilityLabel={highlight.title} />
        </View>
      </View>
      <Text variant="caption" weight={400} numberOfLines={1} style={styles.hlLabel}>
        {highlight.title}
      </Text>
    </PressableScale>
  );
}

function mutualsLine(p: LumoProfile): string | null {
  if (!p.mutuals.length) return null;
  const names = p.mutuals.slice(0, 2).map((m) => m.handle);
  const more = Math.max(0, p.mutuals.length - 2);
  return `Followed by ${names.join(', ')}${more ? ` and ${more} ${more === 1 ? 'other' : 'others'}` : ''}`;
}

/** A profile: header, stats, bio, actions, highlights, then grid and tagged tabs. */
export function ProfileView({ handle, isTab }: { handle: string; isTab?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile(handle);
  const [tab, setTab] = useState<Tab>('grid');
  const posts = useProfilePosts(handle, tab);
  const follow = useToggleFollow();
  const start = useStartConversation();
  const group = useStories().data?.find((g) => g.user.handle === handle);
  const p = profile.data;

  const header = (
    <View style={styles.bar}>
      {isTab ? null : <IconButton name="chevron-back" label="Back" iconSize={28} onPress={() => router.back()} />}
      <View style={[styles.barTitle, isTab && styles.barTitleTab]}>
        <Text variant={isTab ? 'title2' : 'headline'} weight={isTab ? 800 : 700} numberOfLines={1}>
          {handle}
        </Text>
        {p?.isVerified ? <VerifiedBadge size={16} /> : null}
        {isTab ? <Icon name="chevron-down" size={18} /> : null}
      </View>
      {isTab ? <IconButton name="add-circle-outline" label="Create" iconSize={26} onPress={() => router.navigate('/create')} /> : null}
      <IconButton name={isTab ? 'menu' : 'ellipsis-horizontal'} label={isTab ? 'Menu' : 'More options'} iconSize={isTab ? 28 : 22} />
    </View>
  );

  if (profile.isError) {
    return (
      <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        {header}
        <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />
      </View>
    );
  }

  return (
    <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      {header}
      <ScrollView showsVerticalScrollIndicator={false}>
        {!p ? (
          <View style={styles.top}>
            <Skeleton circle width={88} height={88} />
            <View style={[styles.stats, styles.skelStats]}>
              <Skeleton width="80%" height={36} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.top}>
              <Avatar
                name={p.name}
                art={p.avatar}
                size={84}
                ring={group ? (group.hasUnseen ? 'unseen' : 'seen') : 'none'}
                showAdd={p.isMe && !group}
                onPress={group ? () => router.push(`/story/${p.id}`) : undefined}
              />
              <View style={styles.stats}>
                <Stat value={p.stats.posts} label="posts" />
                <Stat value={p.stats.followers} label="followers" />
                <Stat value={p.stats.following} label="following" />
              </View>
            </View>
            <View style={styles.bio}>
              <Text variant="subhead" weight={700}>
                {p.name}
              </Text>
              {p.bio ? <Caption text={p.bio} /> : null}
              {p.website ? (
                <View style={styles.link}>
                  <Icon name="link" size={15} color="onPrimarySoft" />
                  <Text variant="footnote" weight={600} color="onPrimarySoft">
                    {p.website}
                  </Text>
                </View>
              ) : null}
              {mutualsLine(p) ? (
                <Text variant="caption" weight={400} color="textSecondary">
                  {mutualsLine(p)}
                </Text>
              ) : null}
            </View>
            <View style={styles.buttons}>
              {p.isMe ? (
                <>
                  <PillButton title="Edit profile" style={styles.fill} />
                  <PillButton title="Share profile" style={styles.fill} />
                </>
              ) : (
                <>
                  <PillButton
                    title={p.isFollowing ? 'Following' : p.followsYou ? 'Follow back' : 'Follow'}
                    tone={p.isFollowing ? 'muted' : 'accent'}
                    onPress={() => follow.mutate({ userId: p.id, follow: !p.isFollowing })}
                    style={styles.fill}
                  />
                  <PillButton
                    title="Message"
                    loading={start.isPending}
                    onPress={() => start.mutate([p.id], { onSuccess: (c) => router.push(`/chat/${c.id}`) })}
                    style={styles.fill}
                  />
                </>
              )}
            </View>
            {p.highlights.length > 0 || p.isMe ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlights}>
                {p.highlights.map((h) => (
                  <HighlightBubble key={h.id} highlight={h} profile={p} />
                ))}
                {p.isMe ? (
                  <View style={styles.highlight}>
                    <View style={[styles.hlRing, styles.hlNew, { borderColor: colors.border }]}>
                      <Icon name="add" size={30} />
                    </View>
                    <Text variant="caption" weight={400}>
                      New
                    </Text>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}
          </>
        )}
        <View style={[styles.tabs, { borderBottomColor: colors.divider }]} accessibilityRole="tablist">
          {(
            [
              ['grid', 'grid-outline', 'grid', 'Posts'],
              ['tagged', 'person-circle-outline', 'person-circle', 'Tagged'],
            ] as const
          ).map(([key, icon, active, label]) => (
            <PressableScale
              key={key}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: tab === key }}
              scaleTo={1}
              style={[styles.tab, tab === key && { borderBottomColor: colors.text }]}
            >
              <Icon name={tab === key ? active : icon} size={24} color={tab === key ? 'text' : 'textMuted'} />
            </PressableScale>
          ))}
        </View>
        {posts.isPending ? (
          <View style={styles.skelGrid}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} width="33%" height={130} radius={0} />
            ))}
          </View>
        ) : posts.data && posts.data.length > 0 ? (
          <PostGrid posts={posts.data} />
        ) : (
          <EmptyState
            art={tab === 'grid' ? 'camera-with-flash' : 'person'}
            title={tab === 'grid' ? 'No posts yet' : 'No photos of you'}
            message={tab === 'grid' ? (p?.isMe ? 'Share your first photo.' : undefined) : 'When people tag you in photos, they will appear here.'}
            actionLabel={tab === 'grid' && p?.isMe ? 'Create' : undefined}
            onAction={() => router.navigate('/create')}
          />
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  barTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
  barTitleTab: { paddingLeft: 12 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, gap: 20 },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  skelStats: { justifyContent: 'center' },
  stat: { alignItems: 'center' },
  bio: { paddingHorizontal: 16, paddingTop: 10, gap: 2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  buttons: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 12 },
  highlights: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 4, gap: 14 },
  highlight: { alignItems: 'center', gap: 4, width: 70 },
  hlRing: { width: 66, height: 66, borderRadius: 33, borderWidth: 1, padding: 3 },
  hlNew: { alignItems: 'center', justifyContent: 'center' },
  hlCover: { flex: 1, borderRadius: 30, overflow: 'hidden' },
  hlLabel: { maxWidth: 70 },
  tabs: { flexDirection: 'row', marginTop: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1.5, borderBottomColor: 'transparent' },
  skelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
});
