import { firstUnseenIndex, orderStoryGroups, stepStory, useHighlightStories, useMarkStorySeen, useProfile, useStories, type StoryGroup, type StoryPosition } from '@pro/api';
import { Avatar, GradientFill, IconButton, PhotoScene, StoryProgress, Text, photoColors, timeAgo, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { cancelAnimation, Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Composer } from '../../components/Composer';
import { VerifiedBadge } from '../../components/PostCard';

export const STORY_MS = 5000;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Groups for this viewer: the feed's story tray (order frozen on open), or one highlight. */
function useViewerGroups(highlight: string | undefined, handle: string | undefined, title: string | undefined) {
  const stories = useStories();
  const hl = useHighlightStories(highlight);
  const profile = useProfile(highlight ? handle : undefined);
  // Marking stories seen re-sorts the tray; keep the order the viewer opened with.
  const [order, setOrder] = useState<string[] | null>(null);
  if (!highlight && !order && stories.data) setOrder(orderStoryGroups(stories.data).map((g) => g.user.id));
  return useMemo((): StoryGroup[] | null => {
    if (highlight) {
      if (!hl.data || !profile.data) return null;
      return [{ user: { ...profile.data, name: title ?? profile.data.name }, stories: hl.data, hasUnseen: false, isMe: profile.data.isMe }];
    }
    if (!stories.data || !order) return null;
    const byId = new Map(stories.data.map((g) => [g.user.id, g]));
    return order.map((uid) => byId.get(uid)).filter((g): g is StoryGroup => !!g);
  }, [highlight, hl.data, profile.data, stories.data, title, order]);
}

export default function StoryViewer() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id, highlight, handle, title, at } = useLocalSearchParams<{ id: string; highlight?: string; handle?: string; title?: string; at?: string }>();
  const groups = useViewerGroups(highlight, handle, title);
  const markSeen = useMarkStorySeen();
  const [pos, setPos] = useState<StoryPosition | null>(null);
  const [paused, setPaused] = useState(false);
  const progress = useSharedValue(0);
  const elapsed = useRef(0);
  const startedAt = useRef(0);

  // Open on the tapped person's first unseen story (set during render, once the groups load).
  if (!pos && groups) {
    const g = highlight ? 0 : Math.max(0, groups.findIndex((x) => x.user.id === id));
    const opening = groups[g];
    if (opening) setPos({ group: g, story: at ? Math.min(Number(at), opening.stories.length - 1) : highlight ? 0 : firstUnseenIndex(opening) });
  }

  const group = pos && groups ? groups[pos.group] : undefined;
  const story = group && pos ? group.stories[pos.story] : undefined;

  const go = useCallback(
    (direction: 1 | -1) => {
      if (!groups || !pos) return;
      const next = stepStory(groups, pos, direction);
      if (!next) close();
      else {
        elapsed.current = 0;
        progress.set(0);
        setPos(next);
      }
    },
    [groups, pos, progress],
  );

  // A new story starts from zero and is marked seen.
  useEffect(() => {
    if (!story) return;
    elapsed.current = 0;
    progress.set(0);
    if (!story.isSeen && !highlight) markSeen.mutate(story.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per story
  }, [story?.id]);

  // The timer: animate the bar for the time left and advance when it runs out; pausing banks the elapsed time.
  useEffect(() => {
    if (!story || paused) return;
    const remaining = Math.max(0, STORY_MS - elapsed.current);
    startedAt.current = Date.now();
    progress.set(withTiming(1, { duration: remaining, easing: Easing.linear }));
    const t = setTimeout(() => go(1), remaining);
    return () => {
      clearTimeout(t);
      elapsed.current += Date.now() - startedAt.current;
      cancelAnimation(progress);
    };
  }, [story, paused, go, progress]);

  if (!group || !story || !pos) return <View style={[styles.fill, { backgroundColor: photoColors.media }]} />;

  return (
    <View style={[styles.fill, { backgroundColor: photoColors.media, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.frame}>
        <PhotoScene scene={story.scene} seed={story.id} aspectRatio={9 / 16} radius={12} style={styles.photo} accessibilityLabel={`Story by ${group.user.handle}${story.caption ? `: ${story.caption}` : ''}`} />
        <View pointerEvents="none" style={styles.topScrim}>
          <GradientFill colors={[photoColors.shade, photoColors.shade]} opacities={[0.45, 0]} direction="vertical" />
        </View>
        {story.caption ? (
          <View pointerEvents="none" style={styles.captionWrap}>
            <View style={[styles.captionPill, { backgroundColor: colors.surface }]}>
              <Text variant="headline" weight={700} align="center">
                {story.caption}
              </Text>
            </View>
          </View>
        ) : null}
        {/* Tap zones: left third goes back, the rest forward; holding anywhere pauses. */}
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.zones}>
            {([-1, 1] as const).map((dir) => (
              <Pressable
                key={dir}
                onPress={() => go(dir)}
                onPressIn={() => setPaused(true)}
                onPressOut={() => setPaused(false)}
                delayLongPress={250}
                onLongPress={() => undefined}
                accessibilityRole="button"
                accessibilityLabel={dir === 1 ? 'Next story' : 'Previous story'}
                accessibilityHint="Hold to pause"
                style={dir === 1 ? styles.right : styles.left}
              />
            ))}
          </View>
        </View>
        <View style={[styles.chrome, paused && styles.hidden]} pointerEvents="box-none">
          <StoryProgress count={group.stories.length} index={pos.story} progress={progress} />
          <View style={styles.head} pointerEvents="box-none">
            <Avatar name={group.user.name} art={group.user.avatar} size={32} onPress={() => router.push(`/user/${group.user.handle}`)} />
            <View style={styles.who} pointerEvents="none">
              <Text variant="subhead" weight={700} color="textInverse" numberOfLines={1}>
                {highlight ? (title ?? group.user.handle) : group.isMe ? 'Your story' : group.user.handle}
              </Text>
              {group.user.isVerified && !highlight ? <VerifiedBadge size={13} /> : null}
              <Text variant="subhead" weight={400} color="textInverse" style={styles.age}>
                {timeAgo(story.createdAt).replace(' ago', '')}
              </Text>
            </View>
            <IconButton name="close" label="Close stories" color="textInverse" iconSize={28} onPress={close} />
          </View>
        </View>
      </View>
      {!group.isMe ? (
        <View style={styles.reply}>
          <View style={styles.fill}>
            <StoryReply handle={group.user.handle} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} />
          </View>
          <IconButton name="heart-outline" label="Like story" color="textInverse" iconSize={27} />
          <IconButton name="paper-plane-outline" label="Send story" color="textInverse" iconSize={25} />
        </View>
      ) : (
        <View style={styles.reply}>
          <Text variant="footnote" color="textInverse" style={styles.age}>
            Seen by 24
          </Text>
        </View>
      )}
    </View>
  );
}

function StoryReply({ handle, onFocus, onBlur }: { handle: string; onFocus: () => void; onBlur: () => void }) {
  return <Composer placeholder={`Message ${handle}…`} dark onFocus={onFocus} onBlur={onBlur} onSend={onBlur} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  frame: { flex: 1, borderRadius: 12, overflow: 'hidden', justifyContent: 'center' },
  photo: { flex: 1, aspectRatio: undefined },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  captionWrap: { position: 'absolute', left: 0, right: 0, bottom: '16%', alignItems: 'center', paddingHorizontal: 24 },
  captionPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  zones: { flex: 1, flexDirection: 'row' },
  left: { flex: 1 },
  right: { flex: 2 },
  chrome: { position: 'absolute', top: 8, left: 8, right: 4, gap: 8 },
  hidden: { opacity: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  age: { opacity: 0.75 },
  reply: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, minHeight: 60, gap: 2 },
});
