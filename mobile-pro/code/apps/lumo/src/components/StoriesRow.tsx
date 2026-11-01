import { orderStoryGroups, useMe, useStories } from '@pro/api';
import { Avatar, Skeleton, Text } from '@pro/ui';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const SIZE = 66;

/** Stories across the top of the feed: yours first, then new (gradient ring), then seen (gray). */
export function StoriesRow() {
  const stories = useStories();
  const me = useMe().data;
  const groups = useMemo(() => orderStoryGroups(stories.data ?? []), [stories.data]);

  if (stories.isPending) {
    return (
      <View style={styles.row}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.item}>
            <Skeleton circle width={SIZE + 8} height={SIZE + 8} />
            <Skeleton width={52} height={10} />
          </View>
        ))}
      </View>
    );
  }
  const hasMine = groups.some((g) => g.isMe);
  return (
    <FlatList
      horizontal
      data={groups}
      keyExtractor={(g) => g.user.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      ListHeaderComponent={
        !hasMine && me ? (
          <View style={styles.item}>
            <Avatar name={me.name} art={me.avatar} size={SIZE} showAdd onPress={() => router.push('/create')} accessibilityHint="Add to your story" />
            <Text variant="caption" weight={400} color="textSecondary" numberOfLines={1} style={styles.label}>
              Your story
            </Text>
          </View>
        ) : undefined
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Avatar
            name={item.isMe ? 'Your story' : item.user.handle}
            art={item.user.avatar}
            size={SIZE}
            ring={item.hasUnseen ? 'unseen' : 'seen'}
            showAdd={item.isMe}
            onPress={() => router.push(`/story/${item.user.id}`)}
          />
          <Text variant="caption" weight={400} color={item.isMe || !item.hasUnseen ? 'textSecondary' : 'text'} numberOfLines={1} style={styles.label}>
            {item.isMe ? 'Your story' : item.user.handle}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  item: { alignItems: 'center', width: SIZE + 14, gap: 4 },
  label: { maxWidth: SIZE + 12 },
});
