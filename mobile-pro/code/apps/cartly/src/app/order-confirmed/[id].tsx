import { useDeliveryEstimate, useMe, useOrder } from '@pro/api';
import { Art, ArtTile, Button, ErrorState, Icon, Skeleton, Text, formatINR, useTheme } from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrderConfirmedScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useOrder(id);
  const me = useMe();
  const order = query.data;
  const estimate = useDeliveryEstimate(order?.address.pincode ?? '', order?.items[0]?.productId);

  if (query.isError && !order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} art="package" />
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.hero}>
          <View style={[styles.check, { backgroundColor: colors.successSoft }]}>
            <View style={[styles.checkInner, { backgroundColor: colors.success }]}>
              <Icon name="checkmark" size={44} color="textInverse" />
            </View>
          </View>
          <Art name="party-popper" size={56} decorative style={styles.popper} />
          <Text variant="title1" align="center" accessibilityRole="header">
            Order placed!
          </Text>
          <Text variant="footnote" color="textSecondary" align="center">
            {me.data ? `Thank you, ${me.data.name.split(' ')[0]}. A confirmation is on its way to ${me.data.email}.` : 'Thank you for shopping with Cartly.'}
          </Text>
        </View>

        {order ? (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
              <View style={styles.row}>
                <Icon name="cube" size={22} color="primary" />
                <View style={styles.flex}>
                  <Text variant="headline" weight={700}>
                    {estimate.data?.serviceable ? estimate.data.label : 'Arriving soon'}
                  </Text>
                  <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
                    {`To ${order.address.label}: ${order.address.line1}, ${order.address.locality} ${order.address.pincode}`}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.items}>
                {order.items.slice(0, 4).map((l) => (
                  <ArtTile key={l.id} art={l.art} size={56} decorative />
                ))}
                <View style={styles.flex}>
                  <Text variant="subhead" weight={600} numberOfLines={2}>
                    {order.items.length === 1 ? order.items[0]!.name : `${order.items.length} items`}
                  </Text>
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              {[
                ['Order number', order.number],
                ['Payment', order.payment.label],
                [order.payment.kind === 'cash' ? 'Amount to pay' : 'Amount paid', formatINR(order.bill.total)],
              ].map(([k, v]) => (
                <View key={k} style={styles.kv}>
                  <Text variant="footnote" color="textMuted">
                    {k}
                  </Text>
                  <Text variant="footnote" weight={700} tabular>
                    {v}
                  </Text>
                </View>
              ))}
              {order.bill.savings > 0 ? (
                <View style={[styles.saved, { backgroundColor: colors.successSoft }]}>
                  <Text variant="subhead" weight={700} color="success" align="center">
                    {`You saved ${formatINR(order.bill.savings)} on this order`}
                  </Text>
                </View>
              ) : null}
            </View>
            <Button title="Track order" size="lg" fullWidth icon={{ name: 'navigate' }} onPress={() => router.replace(`/order/${order.id}`)} testID="track-order" />
            <Button title="Continue shopping" variant="secondary" size="lg" fullWidth onPress={() => router.replace('/')} />
          </>
        ) : (
          <Skeleton height={240} radius={16} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  check: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  checkInner: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  popper: { position: 'absolute', top: 0, right: 80 },
  card: { borderRadius: 16, padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: StyleSheet.hairlineWidth },
  items: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  saved: { borderRadius: 10, paddingVertical: 8 },
});
