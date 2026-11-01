import { useOrders, type OrderSummary } from '@pro/api';
import { ArtTile, Badge, type BadgeTone, EmptyState, ErrorState, formatINR, Icon, PressableScale, shortDate, Skeleton, Text, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function tone(status: OrderSummary['status']): BadgeTone {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'warning';
}

function OrderRow({ order }: { order: OrderSummary }) {
  const theme = useTheme();
  const active = order.status !== 'delivered' && order.status !== 'cancelled';
  return (
    <PressableScale
      onPress={() => router.push(`/order/${order.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${order.statusLabel}. ${order.title}. ${formatINR(order.total)}. ${active ? 'Track order' : 'View details'}`}
      scaleTo={0.98}
      style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]}
    >
      <View style={styles.top}>
        <ArtTile art={order.art} size={56} artScale={0.7} decorative />
        <View style={styles.flex}>
          <Badge label={order.statusLabel} tone={tone(order.status)} variant="soft" />
          <Text variant="subhead" weight={700} numberOfLines={1} style={styles.title}>
            {order.title}
          </Text>
          <Text variant="caption" weight={400} color="textMuted">
            {`${shortDate(order.placedAt)} · ${order.itemCount} ${order.itemCount === 1 ? 'item' : 'items'} · ${formatINR(order.total)}`}
          </Text>
        </View>
        <Icon name="chevron-forward" size={18} color="textMuted" />
      </View>
      {active ? (
        <View style={[styles.track, { backgroundColor: theme.colors.primarySoft }]}>
          <Icon name="flash" size={14} color="primary" />
          <Text variant="footnote" weight={700} color="primary">
            Arriving in minutes · Track live
          </Text>
        </View>
      ) : (
        <Text variant="caption" weight={400} color="textSecondary" numberOfLines={1}>
          {order.itemsPreview}
        </Text>
      )}
    </PressableScale>
  );
}

export default function OrdersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const orders = useOrders('minutely');

  return (
    <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top + 8 }]}>
      <Text variant="title2" accessibilityRole="header" style={styles.heading}>
        Your orders
      </Text>
      {orders.isError && !orders.data ? (
        <ErrorState art="package" error={orders.error} onRetry={() => void orders.refetch()} />
      ) : orders.data && orders.data.length === 0 ? (
        <EmptyState art="shopping-trolley" title="No orders yet" message="Your groceries arrive in minutes. Place your first order!" actionLabel="Start shopping" onAction={() => router.navigate('/')} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} tintColor={colors.primary} />}
        >
          {!orders.data ? [0, 1, 2].map((i) => <Skeleton key={i} height={120} radius={16} />) : orders.data.map((o) => <OrderRow key={o.id} order={o} />)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 2, alignItems: 'flex-start' },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 4, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 16, padding: 12, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { marginTop: 4 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
});
