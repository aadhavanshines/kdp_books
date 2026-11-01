import { usePost, type Post } from '@pro/api';
import { ErrorState, ScreenHeader, Skeleton, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CommentsSheet } from '../../components/CommentsSheet';
import { PostCard } from '../../components/PostCard';

export default function PostScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePost(id);
  const [comments, setComments] = useState<Post | null>(null);
  return (
    <View style={[styles.fill, { backgroundColor: colors.surface }]}>
      <ScreenHeader title="Post" onBack={() => router.back()} safeTop />
      {post.isError ? (
        <ErrorState error={post.error} onRetry={() => void post.refetch()} />
      ) : !post.data ? (
        <Skeleton width="100%" height={460} radius={0} />
      ) : (
        <ScrollView>
          <PostCard post={post.data} onOpenComments={setComments} />
        </ScrollView>
      )}
      <CommentsSheet post={comments && post.data ? post.data : null} onClose={() => setComments(null)} />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
