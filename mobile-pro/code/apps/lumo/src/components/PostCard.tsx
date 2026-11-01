import { useToggleLike, useToggleSave, type Post } from '@pro/api';
import {
  Avatar,
  HeartBurst,
  Icon,
  IconButton,
  PhotoScene,
  PressableScale,
  Text,
  timeAgo,
  useDoubleTap,
  useTheme,
  useToast,
} from '@pro/ui';
import { router } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { likesLine } from '../lib/likes';
import { Caption } from './Caption';

export interface PostCardProps {
  post: Post;
  onOpenComments: (post: Post) => void;
  /** Starts with the heart burst playing (screenshots and demos). */
  initialBurst?: number;
}

export function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <View accessible accessibilityLabel="Verified" accessibilityRole="image">
      <Icon name="checkmark-circle" size={size} color="accent" />
    </View>
  );
}

function LikeButton({ liked, onPress }: { liked: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={() => {
        scale.set(withSequence(withTiming(0.8, { duration: 70 }), withSpring(1, { damping: 8, stiffness: 300 })));
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      accessibilityState={{ selected: liked }}
      hitSlop={6}
      style={styles.action}
    >
      <Animated.View style={style}>
        <Icon name={liked ? 'heart' : 'heart-outline'} size={27} color={liked ? 'like' : 'text'} />
      </Animated.View>
    </Pressable>
  );
}

/** A feed post: author, photo (double-tap to like), actions, likes, caption and comment preview. */
export const PostCard = memo(function PostCard({ post, onOpenComments, initialBurst = 0 }: PostCardProps) {
  const { colors } = useTheme();
  const toast = useToast();
  const like = useToggleLike();
  const save = useToggleSave();
  const [burst, setBurst] = useState(initialBurst);
  const likes = likesLine(post);
  const openProfile = () => router.push(`/user/${post.author.handle}`);

  const onDoubleTap = useCallback(() => {
    setBurst((b) => b + 1);
    if (!post.isLiked) like.mutate({ postId: post.id, liked: true });
  }, [like, post.id, post.isLiked]);
  const onPhotoPress = useDoubleTap(onDoubleTap);

  const share = () => {
    Share.share({ message: `${post.author.name} on Lumo: https://lumo.example/p/${post.id}` }).catch(() =>
      toast.show({ message: 'Sharing is not available here', icon: { name: 'share-outline' } }),
    );
  };
  const toggleSave = () => {
    save.mutate({ postId: post.id, saved: !post.isSaved });
    if (!post.isSaved) toast.show({ message: 'Saved to your collection', icon: { name: 'bookmark' } });
  };

  return (
    <View style={styles.card} accessibilityLabel={`Post by ${post.author.handle}`}>
      <View style={styles.header}>
        <Avatar name={post.author.name} art={post.author.avatar} size={34} onPress={openProfile} />
        <PressableScale onPress={openProfile} accessibilityRole="link" accessibilityLabel={`${post.author.handle}, open profile`} style={styles.who} scaleTo={1}>
          <View style={styles.nameRow}>
            <Text variant="subhead" weight={700} numberOfLines={1}>
              {post.author.handle}
            </Text>
            {post.author.isVerified ? <VerifiedBadge /> : null}
          </View>
          {post.location ? (
            <Text variant="caption" weight={400} numberOfLines={1}>
              {post.location}
            </Text>
          ) : null}
        </PressableScale>
        <IconButton name="ellipsis-horizontal" label="More options" iconSize={20} />
      </View>

      <Pressable onPress={onPhotoPress} accessibilityRole="button" accessibilityLabel="Photo" accessibilityHint="Double-tap to like">
        <PhotoScene scene={post.scene} seed={post.id} filter={post.filter} />
        {post.taggedUsers.length > 0 ? (
          <View style={[styles.tagBadge, { backgroundColor: colors.overlay }]} accessible accessibilityLabel={`Tagged: ${post.taggedUsers.map((u) => u.handle).join(', ')}`}>
            <Icon name="person" size={12} color="textInverse" />
          </View>
        ) : null}
        <HeartBurst trigger={burst} size={110} />
      </Pressable>

      <View style={styles.actions}>
        <LikeButton liked={post.isLiked} onPress={() => like.mutate({ postId: post.id, liked: !post.isLiked })} />
        <Pressable onPress={() => onOpenComments(post)} accessibilityRole="button" accessibilityLabel="Comment" hitSlop={6} style={styles.action}>
          <Icon name="chatbubble-outline" size={25} style={styles.flipX} />
        </Pressable>
        <Pressable onPress={share} accessibilityRole="button" accessibilityLabel="Share" hitSlop={6} style={styles.action}>
          <Icon name="paper-plane-outline" size={25} />
        </Pressable>
        <View style={styles.fill} />
        <Pressable onPress={toggleSave} accessibilityRole="button" accessibilityLabel={post.isSaved ? 'Remove from saved' : 'Save'} accessibilityState={{ selected: post.isSaved }} hitSlop={6} style={styles.action}>
          <Icon name={post.isSaved ? 'bookmark' : 'bookmark-outline'} size={25} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {likes ? (
          <Text variant="footnote" weight={400}>
            {likes.by ? 'Liked by ' : null}
            {likes.by ? (
              <Text variant="footnote" weight={700}>
                {likes.by}
              </Text>
            ) : null}
            {likes.by ? ' and ' : null}
            <Text variant="footnote" weight={700}>
              {likes.rest}
            </Text>
          </Text>
        ) : null}
        {post.caption ? <Caption handle={post.author.handle} text={post.caption} collapsible onPressHandle={openProfile} /> : null}
        {post.commentCount > 0 ? (
          <Pressable onPress={() => onOpenComments(post)} accessibilityRole="button" style={styles.viewAll}>
            <Text variant="footnote" color="textMuted">
              {post.commentCount === 1 ? 'View 1 comment' : `View all ${post.commentCount} comments`}
            </Text>
          </Pressable>
        ) : null}
        {post.previewComments.slice(0, 2).map((c) => (
          <Caption key={c.id} handle={c.author.handle} text={c.text} numberOfLines={1} />
        ))}
        <Text variant="caption" weight={400} color="textMuted" style={styles.time}>
          {timeAgo(post.createdAt)}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 12, paddingRight: 4, paddingVertical: 8, gap: 10 },
  who: { flex: 1, justifyContent: 'center', minHeight: 44 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagBadge: { position: 'absolute', left: 12, bottom: 12, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingTop: 2 },
  action: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  flipX: { transform: [{ scaleX: -1 }] },
  fill: { flex: 1 },
  body: { paddingHorizontal: 14, gap: 4 },
  viewAll: { minHeight: 24, justifyContent: 'center' },
  time: { marginTop: 2 },
});
