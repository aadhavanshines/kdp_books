import { conversationTitle, useConversations, useMe } from '@pro/api';
import { Avatar, EmptyState, ErrorState, IconButton, PressableScale, SearchBar, Skeleton, Text, timeAgo, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const me = useMe().data;
  const convos = useConversations();
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = convos.data ?? [];
    return q ? all.filter((c) => c.participants.some((p) => p.name.toLowerCase().includes(q) || p.handle.includes(q))) : all;
  }, [convos.data, query]);

  return (
    <View style={[styles.fill, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
      <View style={styles.bar}>
        <IconButton name="chevron-back" label="Back" iconSize={28} onPress={() => router.back()} />
        <Text variant="title3" weight={800} style={styles.fill} accessibilityRole="header">
          {me?.handle ?? 'Messages'}
        </Text>
        <IconButton name="create-outline" label="New message" iconSize={25} />
      </View>
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search" style={styles.search} />
      <Text variant="headline" weight={700} style={styles.heading}>
        Messages
      </Text>
      {convos.isError ? (
        <ErrorState error={convos.error} onRetry={() => void convos.refetch()} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(c) => c.id}
          renderItem={({ item, index }) => {
            const other = item.participants[0];
            const unread = item.unreadCount > 0;
            const last = item.lastMessage;
            const preview = last ? `${last.isMine ? 'You: ' : ''}${last.text}` : 'Say hi 👋';
            const title = conversationTitle(item);
            return (
              <PressableScale
                onPress={() => router.push(`/chat/${item.id}`)}
                scaleTo={0.99}
                accessibilityLabel={`${title}${unread ? ', unread' : ''}. ${preview}`}
                style={styles.row}
              >
                <Avatar name={other?.name ?? title} art={other?.avatar} size={56} online={index % 3 === 0} />
                <View style={styles.fill}>
                  <Text variant="subhead" weight={unread ? 700 : 500} numberOfLines={1}>
                    {title}
                  </Text>
                  <View style={styles.previewRow}>
                    <Text variant="footnote" weight={unread ? 700 : 400} color={unread ? 'text' : 'textMuted'} numberOfLines={1} style={styles.shrink}>
                      {preview}
                    </Text>
                    {last ? (
                      <Text variant="footnote" color="textMuted" numberOfLines={1} style={styles.noShrink}>
                        {`\u00A0·\u00A0${timeAgo(last.createdAt).replace(' ago', '')}`}
                      </Text>
                    ) : null}
                  </View>
                </View>
                {unread ? <View style={[styles.dot, { backgroundColor: colors.accent }]} /> : <View style={styles.dotSpace} />}
              </PressableScale>
            );
          }}
          ListEmptyComponent={
            convos.isPending ? (
              <View style={styles.row}>
                <Skeleton circle width={56} height={56} />
                <Skeleton width="50%" height={12} />
              </View>
            ) : (
              <EmptyState art="mobile-phone" title="No messages yet" message="Message someone from their profile." />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shrink: { flexShrink: 1 },
  noShrink: { flexShrink: 0 },
  bar: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 4 },
  search: { marginHorizontal: 16, marginVertical: 6 },
  heading: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotSpace: { width: 9 },
});
