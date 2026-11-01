import { addressLine, orderProgress, returnForLine, useCancelOrder, useOrderStream, type Order } from '@pro/api';
import {
  ArtTile,
  Badge,
  BillDetails,
  BottomSheet,
  Button,
  dateTime,
  ErrorState,
  formatINR,
  Icon,
  ListItem,
  ProgressSteps,
  ScreenHeader,
  SectionCard,
  shortDate,
  Skeleton,
  Text,
  useTheme,
  useToast,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { deliveryLine, statusTone } from '../../lib/orders';
import { priceDetails } from '../../lib/price';
import { RETURN_STATUS_LABEL } from '../../lib/returns';

function Tracking({ order }: { order: Order }) {
  const progress = orderProgress(order);
  const steps = order.timeline
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({ key: s.status, label: s.label, description: s.description, time: s.at ? dateTime(s.at) : undefined }));
  if (progress.isCancelled) {
    return (
      <View style={styles.row}>
        <Icon name="close-circle" size={20} color="danger" />
        <Text variant="subhead" color="danger">
          {`This order was cancelled${order.cancelledAt ? ` on ${shortDate(order.cancelledAt)}` : ''}. Any payment will be refunded in 3 to 5 days.`}
        </Text>
      </View>
    );
  }
  return <ProgressSteps steps={steps} current={progress.current} />;
}

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, error } = useOrderStream(id);
  const cancel = useCancelOrder();
  const [confirm, setConfirm] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/orders'));

  if (!order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <ScreenHeader onBack={back} title="Order details" />
        {error ? (
          <ErrorState error={error} onRetry={() => router.replace(`/order/${id}`)} art="package" />
        ) : (
          <View style={styles.content}>
            {[120, 220, 140].map((h, i) => (
              <Skeleton key={i} height={h} radius={14} />
            ))}
          </View>
        )}
      </View>
    );
  }

  const progress = orderProgress(order);
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader onBack={back} title="Order details" subtitle={`Order ${order.number} · ${shortDate(order.placedAt)}`} />
      <ScrollView contentContainerStyle={styles.content} testID="order-scroll">
        <SectionCard>
          <View style={styles.statusHead}>
            <Badge label={order.statusLabel} tone={statusTone(order.status)} variant="soft" size="md" />
            {progress.isActive ? (
              <View style={styles.row}>
                <View style={[styles.live, { backgroundColor: colors.success }]} />
                <Text variant="caption" weight={700} color="success">
                  LIVE
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="title3" accessibilityRole="header">
            {deliveryLine(order)}
          </Text>
          <View style={styles.tracking}>
            <Tracking order={order} />
          </View>
        </SectionCard>

        {order.returns.length ? (
          <SectionCard title="Returns">
            {order.returns.map((r) => (
              <View key={r.id} style={[styles.returnCard, { backgroundColor: colors.infoSoft }]}>
                <View style={styles.row}>
                  <Icon name="return-down-back" size={18} color="info" />
                  <Text variant="subhead" weight={700} color="info">
                    {RETURN_STATUS_LABEL[r.status]}
                  </Text>
                </View>
                <Text variant="footnote" color="textSecondary">
                  {`Pickup on ${shortDate(r.pickupDate)} · Refund ${formatINR(r.refundAmount)} to ${order.payment.kind === 'cash' ? 'your bank account' : 'the original payment method'}`}
                </Text>
                <Text variant="caption" weight={400} color="textMuted">
                  {`Reason: ${r.reason}`}
                </Text>
              </View>
            ))}
          </SectionCard>
        ) : null}

        <SectionCard title={`Items (${order.items.length})`}>
          {order.items.map((l) => {
            const ret = returnForLine(order, l.id);
            return (
              <View key={l.id} style={styles.item}>
                <ArtTile art={l.art} size={64} decorative />
                <View style={styles.flex}>
                  <Text variant="footnote" numberOfLines={2}>
                    {l.name}
                  </Text>
                  <Text variant="caption" weight={400} color="textMuted">
                    {[l.optionsLabel, `Qty ${l.quantity}`].filter(Boolean).join(' · ')}
                  </Text>
                  <Text variant="subhead" weight={700} tabular>
                    {formatINR(l.lineTotal)}
                  </Text>
                  {ret ? <Badge label={RETURN_STATUS_LABEL[ret.status]} tone="info" /> : null}
                </View>
              </View>
            );
          })}
          <View style={styles.actions}>
            {order.canReturn ? (
              <Button title="Return items" variant="secondary" icon={{ name: 'return-down-back' }} onPress={() => router.push(`/return/${order.id}`)} style={styles.flex} testID="return-items" />
            ) : null}
            {order.canCancel ? (
              <Button title="Cancel order" variant="secondary" icon={{ name: 'close-circle-outline' }} onPress={() => setConfirm(true)} style={styles.flex} />
            ) : null}
            <Button title="Buy again" icon={{ name: 'refresh' }} onPress={() => router.push(`/product/${order.items[0]!.productId}`)} style={styles.flex} />
          </View>
        </SectionCard>

        <SectionCard title="Shipping address">
          <Text variant="subhead" weight={700}>
            {`${order.address.recipient} · ${order.address.label}`}
          </Text>
          <Text variant="footnote" color="textSecondary">
            {`${addressLine(order.address)}, ${order.address.locality}, ${order.address.city} ${order.address.pincode}`}
          </Text>
        </SectionCard>

        <SectionCard title="Payment">
          <View style={styles.row}>
            <Icon name={order.payment.kind === 'cash' ? 'cash-outline' : order.payment.kind === 'card' ? 'card-outline' : 'phone-portrait-outline'} size={18} color="text" />
            <Text variant="subhead">{order.payment.label}</Text>
          </View>
          <BillDetails rows={priceDetails(order.bill, order.items.reduce((s, l) => s + l.quantity, 0), order.coupon)} savings={order.bill.savings} />
        </SectionCard>

        <SectionCard>
          <ListItem title="Download invoice" leading={{ name: 'document-text-outline' }} onPress={() => toast.show({ message: 'Invoice sent to your email', tone: 'success' })} />
          <ListItem title="Need help with this order?" subtitle="Chat with us, 24x7" leading={{ name: 'chatbubbles-outline' }} onPress={() => toast.show('Support chat opens here in the full app')} />
        </SectionCard>
      </ScrollView>

      <BottomSheet
        visible={confirm}
        onClose={() => setConfirm(false)}
        title="Cancel this order?"
        subtitle="It has not shipped yet, so you will get a full refund."
        footer={
          <View style={styles.actions}>
            <Button title="Keep order" variant="secondary" onPress={() => setConfirm(false)} style={styles.flex} />
            <Button
              title="Yes, cancel"
              loading={cancel.isPending}
              onPress={() =>
                cancel.mutate(order.id, {
                  onSuccess: () => {
                    setConfirm(false);
                    toast.show({ message: 'Order cancelled', tone: 'success' });
                  },
                  onError: (e) => toast.show({ message: e.message, tone: 'danger' }),
                })
              }
              style={styles.flex}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  live: { width: 8, height: 8, borderRadius: 4 },
  tracking: { marginTop: 8 },
  returnCard: { borderRadius: 12, padding: 12, gap: 4 },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 4 },
});
