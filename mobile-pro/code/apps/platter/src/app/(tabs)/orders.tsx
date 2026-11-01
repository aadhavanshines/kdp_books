import { useOrders, type OrderSummary } from '@pro/api';
import { ArtTile, Badge, type BadgeTone, Button, Divider, EmptyState, ErrorState, formatINR, Icon, PressableScale, Skeleton, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatOrderDate } from '../../lib/tracking';

const ACTIVE = new Set(['confirmed', 'preparing', 'picked_up', 'on_the_way']);

function statusTone(o: OrderSummary): BadgeTone {
  if (o.status === 'delivered') return 'success';
  if (o.status === 'cancelled') return 'danger';
  return 'primary';
}

function OrderCard({ order: o }: { order: OrderSummary }) {
  const theme = useTheme();
  const active = ACTIVE.has(o.status);
  return (
    <PressableScale
      onPress={() => router.push(`/order/${o.id}`)}
      accessibilityLabel={`${o.title}, ${o.statusLabel}, ${formatINR(o.total)}, ${formatOrderDate(o.placedAt)}`}
      accessibilityHint={active ? 'Track this order' : 'Shows order details'}
      scaleTo={0.98}
      style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]}
    >
      <View style={styles.top}>
        <ArtTile art={o.art} size={56} decorative />
        <View style={styles.flex}>
          <Text variant="headline" weight={700} numberOfLines={1}>
            {o.title}
          </Text>
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
            {`#${o.number} · ${formatOrderDate(o.placedAt)}`}
          </Text>
        </View>
        <Badge label={o.statusLabel} tone={statusTone(o)} icon={o.status === 'delivered' ? { name: 'checkmark-circle' } : undefined} />
      </View>
      <Divider variant="dashed" />
      <Text variant="footnote" color="textSecondary" numberOfLines={2}>
        {o.itemsPreview}
      </Text>
      <View style={styles.bottom}>
        <Text variant="subhead" weight={700} tabular>
          {formatINR(o.total)}
        </Text>
        {active ? (
          <Button title="Track order" size="sm" icon={{ name: 'navigate' }} onPress={() => router.push(`/order/${o.id}`)} />
        ) : o.status === 'delivered' && o.rating == null ? (
          <Button title="Rate order" size="sm" variant="secondary" icon={{ name: 'star-outline' }} onPress={() => router.push(`/rate/${o.id}`)} />
        ) : o.rating != null ? (
          <View style={styles.rated} accessible accessibilityLabel={`You rated ${o.rating} stars`}>
            <Text variant="caption" weight={500} color="textMuted">
              You rated
            </Text>
            {[1, 2, 3, 4, 5].map((n) => (
              <Icon key={n} name={n <= o.rating! ? 'star' : 'star-outline'} size={14} color={n <= o.rating! ? 'star' : 'border'} />
            ))}
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const orders = useOrders('platter');
  const data = orders.data ?? [];
  const active = data.filter((o) => ACTIVE.has(o.status));
  const past = data.filter((o) => !ACTIVE.has(o.status));
  const rows: ({ header: string } | OrderSummary)[] = [
    ...(active.length ? [{ header: 'Active' }, ...active] : []),
    ...(past.length ? [{ header: 'Past orders' }, ...past] : []),
  ];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text variant="title2" accessibilityRole="header">
          Your orders
        </Text>
      </View>
      {orders.isLoading ? (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={168} radius={18} />
          ))}
        </View>
      ) : orders.isError ? (
        <ErrorState art="cooking" error={orders.error} onRetry={() => void orders.refetch()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) => ('header' in r ? r.header : r.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) =>
            'header' in item ? (
              <Text variant="overline" color="textSecondary" style={styles.groupTitle}>
                {item.header}
              </Text>
            ) : (
              <OrderCard order={item} />
            )
          }
          refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              art="shallow-pan-of-food"
              title="No orders yet"
              message="When you order, your food and its live status will show up here."
              actionLabel="Order now"
              onAction={() => router.push('/')}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  list: { padding: 16, gap: 12 },
  groupTitle: { marginTop: 4 },
  card: { borderRadius: 18, padding: 14, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  rated: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
