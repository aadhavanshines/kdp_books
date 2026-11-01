import { useOrders } from '@pro/api';
import { Chip, EmptyState, ErrorState, ScreenHeader, Skeleton, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { OrderCard } from '../components/OrderCard';
import { matchesFilter, ORDER_FILTERS as FILTERS, type OrderFilter as Filter } from '../lib/orders';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const orders = useOrders('cartly');
  const [filter, setFilter] = useState<Filter>('all');
  const list = (orders.data ?? []).filter((o) => matchesFilter(o, filter));

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader title="My orders" onBack={() => (router.canGoBack() ? router.back() : router.replace('/account'))} />
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>
      {orders.isError && !orders.data ? (
        <ErrorState error={orders.error} onRetry={() => void orders.refetch()} art="package" />
      ) : !orders.data ? (
        <View style={styles.content}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={96} radius={14} />
          ))}
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={orders.isRefetching} onRefresh={() => void orders.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              art="package"
              title={filter === 'all' ? 'No orders yet' : 'Nothing here'}
              message={filter === 'all' ? 'When you buy something, you can track it here.' : 'No orders match this filter.'}
              actionLabel={filter === 'all' ? 'Start shopping' : 'Show all orders'}
              onAction={() => (filter === 'all' ? router.replace('/') : setFilter('all'))}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  chips: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  content: { padding: 16, gap: 12 },
});
