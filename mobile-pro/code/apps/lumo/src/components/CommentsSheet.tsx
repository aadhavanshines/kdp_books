import { useAddComment, useComments, useMe, useToggleCommentLike, type Comment, type Post } from '@pro/api';
import { Avatar, BottomSheet, EmptyState, Icon, Skeleton, Text, formatCompact, timeAgo } from '@pro/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { Caption } from './Caption';
import { Composer } from './Composer';

const QUICK = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'] as const;

function CommentRow({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  return (
    <View style={styles.row}>
      <Avatar name={comment.author.name} art={comment.author.avatar} size={36} />
      <View style={styles.fill}>
        <Text variant="caption" weight={700}>
          {comment.author.handle}
          <Text variant="caption" weight={400} color="textMuted">{`  ${timeAgo(comment.createdAt).replace(' ago', '')}`}</Text>
        </Text>
        <Caption text={comment.text} />
        <Text variant="caption" weight={600} color="textMuted" style={styles.reply}>
          Reply
        </Text>
      </View>
      <Pressable onPress={onLike} accessibilityRole="button" accessibilityLabel={comment.isLiked ? 'Unlike comment' : 'Like comment'} accessibilityState={{ selected: comment.isLiked }} style={styles.like}>
        <Icon name={comment.isLiked ? 'heart' : 'heart-outline'} size={15} color={comment.isLiked ? 'like' : 'textMuted'} />
        {comment.likeCount > 0 ? (
          <Text variant="caption" weight={400} color="textMuted" tabular>
            {formatCompact(comment.likeCount)}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
}

export function CommentsSheet({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const postId = post?.id;
  const comments = useComments(postId);
  const add = useAddComment(postId ?? '');
  const likeComment = useToggleCommentLike(postId ?? '');
  const me = useMe().data;
  const list = comments.data ?? [];
  return (
    <BottomSheet
      visible={!!post}
      onClose={onClose}
      title="Comments"
      maxHeightRatio={0.82}
      footer={
        <Composer
          placeholder="Add a comment…"
          quick={QUICK}
          avatar={me ? { name: me.name, art: me.avatar } : undefined}
          sending={add.isPending}
          onSend={(text) => add.mutate(text)}
          testID="comment-input"
        />
      }
    >
      {post?.caption ? (
        <View style={[styles.row, styles.captionRow]}>
          <Avatar name={post.author.name} art={post.author.avatar} size={36} />
          <View style={styles.fill}>
            <Caption handle={post.author.handle} text={post.caption} />
            <Text variant="caption" weight={400} color="textMuted">
              {timeAgo(post.createdAt)}
            </Text>
          </View>
        </View>
      ) : null}
      {comments.isPending ? (
        [0, 1, 2].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton circle width={36} height={36} />
            <View style={[styles.fill, styles.skel]}>
              <Skeleton width="40%" height={12} />
              <Skeleton width="80%" height={12} />
            </View>
          </View>
        ))
      ) : list.length === 0 ? (
        <EmptyState art="red-heart" title="No comments yet" message="Start the conversation." />
      ) : (
        list.map((c) => <CommentRow key={c.id} comment={c} onLike={() => likeComment.mutate({ commentId: c.id, liked: !c.isLiked })} />)
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  captionRow: { marginBottom: 4 },
  fill: { flex: 1 },
  reply: { marginTop: 4 },
  like: { width: 44, alignItems: 'center', paddingTop: 4, gap: 2 },
  skel: { gap: 6, justifyContent: 'center' },
});
