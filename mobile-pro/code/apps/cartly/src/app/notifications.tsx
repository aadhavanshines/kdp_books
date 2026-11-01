import { unreadCount, useMarkNotificationsRead, useNotifications, type AppNotification, type NotificationKind } from '@pro/api';
import { ArtTile, Badge, type BadgeTone, Button, EmptyState, ErrorState, PressableScale, ScreenHeader, Skeleton, Text, timeAgo, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { linkToHref } from '../lib/links';

const KIND: Record<NotificationKind, { label: string; tone: BadgeTone }> = {
  order: { label: 'Order', tone: 'success' },
  offer: { label: 'Offer', tone: 'accent' },
  price_drop: { label: 'Price drop', tone: 'danger' },
  system: { label: 'Account', tone: 'neutral' },
};

function Row({ n, onOpen }: { n: AppNotification; onOpen: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onOpen}
      accessibilityLabel={`${n.isRead ? '' : 'Unread. '}${n.title}. ${n.body}. ${timeAgo(n.createdAt)}`}
      scaleTo={0.99}
      style={[styles.row, { backgroundColor: n.isRead ? colors.surface : colors.primarySoft, borderBottomColor: colors.divider }]}
    >
      <ArtTile art={n.art} size={52} decorative />
      <View style={styles.body}>
        <View style={styles.top}>
          <Badge label={KIND[n.kind].label} tone={KIND[n.kind].tone} />
          <Text variant="caption" weight={400} color="textMuted">
            {timeAgo(n.createdAt)}
          </Text>
        </View>
        <Text variant="subhead" weight={n.isRead ? 600 : 700}>
          {n.title}
        </Text>
        <Text variant="footnote" color="textSecondary">
          {n.body}
        </Text>
      </View>
      {!n.isRead ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
    </PressableScale>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const list = useNotifications('cartly');
  const markRead = useMarkNotificationsRead();
  const unread = unreadCount(list.data);
  const open = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate({ app: 'cartly', ids: [n.id] });
    const href = linkToHref(n.link);
    if (href) router.push(href as never);
  };
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'You are all caught up'}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        right={unread ? <Button title="Mark all read" variant="ghost" size="sm" onPress={() => markRead.mutate({ app: 'cartly' })} /> : undefined}
      />
      {list.isError && !list.data ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} art="electric-light-bulb" />
      ) : !list.data ? (
        <View style={styles.skel}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={84} radius={12} />
          ))}
        </View>
      ) : (
        <FlatList
          data={list.data}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => <Row n={item} onOpen={() => open(item)} />}
          refreshControl={<RefreshControl refreshing={list.isRefetching} onRefresh={() => void list.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={<EmptyState art="electric-light-bulb" title="No notifications yet" message="Order updates, price drops and offers will show up here." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  skel: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  body: { flex: 1, gap: 3 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
