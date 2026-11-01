import type { Post } from '@pro/api';
import { PhotoScene, PressableScale } from '@pro/ui';
import { router } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

export const GRID_GAP = 2;

/** One square tile linking to the post. */
export function PostTile({ post, size }: { post: Post; size: number }) {
  return (
    <PressableScale
      onPress={() => router.push(`/post/${post.id}`)}
      accessibilityLabel={`Post by ${post.author.handle}${post.caption ? `: ${post.caption}` : ''}`}
      scaleTo={0.98}
      style={{ width: size, height: size }}
    >
      <PhotoScene scene={post.scene} seed={post.id} filter={post.filter} compact />
    </PressableScale>
  );
}

/** A three-column grid of square post tiles. */
export function PostGrid({ posts }: { posts: readonly Post[] }) {
  const { width } = useWindowDimensions();
  const size = (width - GRID_GAP * 2) / 3;
  return (
    <View style={styles.grid}>
      {posts.map((p) => (
        <PostTile key={p.id} post={p} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
});
