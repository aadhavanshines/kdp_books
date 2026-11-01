import { addressLine, billLines, orderProgress, useCancelOrder, useOrderStream } from '@pro/api';
import {
  Avatar,
  BillDetails,
  BottomSheet,
  Button,
  Divider,
  ErrorState,
  formatClock,
  formatINR,
  Icon,
  IconButton,
  MapView,
  ProgressSteps,
  SectionCard,
  Skeleton,
  Text,
  useTheme,
  useToast,
  VegMark,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { trackingCopy } from '../../lib/tracking';

export default function TrackingScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, rider, connected, error } = useOrderStream(id);
  const cancel = useCancelOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/orders'));

  if (!order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <IconButton name="arrow-back" label="Go back" onPress={goBack} style={styles.backInline} />
        {error ? (
          <ErrorState art="cooking" error={error} onRetry={() => router.replace(`/order/${id}`)} />
        ) : (
          <View style={styles.body} accessible accessibilityLabel="Loading your order">
            <Skeleton height={300} radius={20} />
            <Skeleton width="60%" height={28} />
            <Skeleton height={140} radius={16} />
          </View>
        )}
      </View>
    );
  }

  const p = orderProgress(order);
  const copy = trackingCopy(order, rider?.etaMinutes);
  const tracking = order.tracking;
  const progress = rider?.progress ?? tracking?.progress ?? null;
  const steps = order.timeline
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({ key: s.status, label: s.label, description: s.description, time: formatClock(s.at) }));

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.hero, { backgroundColor: p.isCancelled ? colors.textSecondary : colors.accent, paddingTop: insets.top + 4 }]}>
          <View style={styles.heroBar}>
            <IconButton name="arrow-back" label="Go back" onPress={goBack} color="onAccent" />
            <View style={styles.heroCenter}>
              <Text variant="headline" weight={700} color="onAccent" numberOfLines={1}>
                {order.restaurant?.name ?? 'Your order'}
              </Text>
              <Text variant="caption" weight={500} color="onAccent" style={styles.dim}>
                {`Order #${order.number}`}
              </Text>
            </View>
            <IconButton name="help-circle-outline" label="Get help with this order" color="onAccent" onPress={() => toast.show({ message: 'Support chat opens here in the full app' })} />
          </View>
          <Animated.View key={copy.title} entering={FadeIn.duration(250)} style={styles.headline}>
            <Text variant="title1" color="onAccent" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
              {copy.title}
            </Text>
            <View style={styles.subRow}>
              <Text variant="subhead" color="onAccent" align="center">
                {copy.subtitle}
              </Text>
            </View>
            {p.isActive ? (
              <View style={[styles.etaPill, { backgroundColor: colors.surface }]}>
                <View style={[styles.liveDot, { backgroundColor: connected ? colors.success : colors.textMuted }]} />
                <Text variant="caption" weight={700} color="text">
                  {`${connected ? 'LIVE' : 'Connecting'} · Arriving by ${formatClock(order.etaAt)}`}
                </Text>
              </View>
            ) : null}
          </Animated.View>
        </View>

        <View style={styles.body}>
          {tracking && !p.isCancelled ? (
            <View style={[styles.mapCard, theme.shadow('md')]}>
              <MapView
                route={tracking.route}
                progress={p.isDelivered ? 1 : progress}
                riderArt="motor-scooter"
                aspectRatio={1.15}
                markers={[
                  { key: 'origin', point: tracking.origin.point, art: tracking.origin.art, label: tracking.origin.label },
                  { key: 'home', point: tracking.destination.point, icon: { name: 'home' }, label: tracking.destination.label },
                ]}
              />
            </View>
          ) : null}

          {order.rider && !p.isCancelled ? (
            <SectionCard titleVariant="overline" style={styles.card}>
              <View style={styles.rider}>
                <Avatar name={order.rider.name} art={order.rider.avatar} size={52} />
                <View style={styles.flex}>
                  <Text variant="headline" weight={700}>
                    {order.rider.name}
                  </Text>
                  <Text variant="caption" weight={400} color="textMuted">
                    {p.isMoving || p.isDelivered ? 'Your delivery partner' : 'Will pick up your order soon'}
                  </Text>
                  <View style={styles.riderMeta}>
                    <Icon name="star" size={12} color="star" />
                    <Text variant="caption" weight={600}>
                      {order.rider.rating.toFixed(1)}
                    </Text>
                    <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
                      {`· ${order.rider.vehicle}`}
                    </Text>
                  </View>
                </View>
                <IconButton
                  name="chatbubble-ellipses-outline"
                  label={`Message ${order.rider.name}`}
                  variant="soft"
                  onPress={() => toast.show({ message: 'Messages are disabled in the demo' })}
                />
                <IconButton
                  name="call"
                  label={`Call ${order.rider.name}`}
                  variant="filled"
                  onPress={() => void Linking.openURL(`tel:${order.rider!.phone.replace(/\s/g, '')}`).catch(() => undefined)}
                />
              </View>
            </SectionCard>
          ) : null}

          {p.isDelivered && order.canRate ? (
            <SectionCard titleVariant="overline" style={styles.card}>
              <Text variant="headline" weight={700}>
                How was your food?
              </Text>
              <Text variant="footnote" color="textSecondary">
                {`Rate ${order.restaurant?.name ?? 'your order'} to help others choose.`}
              </Text>
              <Button title="Rate your order" icon={{ name: 'star' }} fullWidth onPress={() => router.push(`/rate/${order.id}`)} />
            </SectionCard>
          ) : null}

          <SectionCard titleVariant="overline" style={styles.card} title="Order status">
            <ProgressSteps steps={steps} current={p.isCancelled ? -1 : p.current} />
            {p.isCancelled ? (
              <Text variant="footnote" weight={600} color="danger">
                {`Cancelled at ${formatClock(order.cancelledAt)}`}
              </Text>
            ) : null}
          </SectionCard>

          <SectionCard titleVariant="overline" style={styles.card} title="Delivery details">
            <View style={styles.route}>
              <Icon name="restaurant" size={18} color="primary" />
              <View style={styles.flex}>
                <Text variant="subhead" weight={700}>
                  {order.restaurant?.name}
                </Text>
                <Text variant="caption" weight={400} color="textMuted">
                  {order.restaurant?.locality}
                </Text>
              </View>
            </View>
            <View style={[styles.routeLine, { borderLeftColor: colors.border }]} />
            <View style={styles.route}>
              <Icon name="home" size={18} color="accent" />
              <View style={styles.flex}>
                <Text variant="subhead" weight={700}>
                  {order.address.label}
                </Text>
                <Text variant="caption" weight={400} color="textMuted">
                  {`${addressLine(order.address)}, ${order.address.locality}`}
                </Text>
              </View>
            </View>
          </SectionCard>

          <SectionCard titleVariant="overline" style={styles.card} title="Order summary">
            {order.items.map((it) => (
              <View key={it.id} style={styles.item}>
                {it.isVeg != null ? <VegMark veg={it.isVeg} size={12} /> : null}
                <Text variant="footnote" style={styles.flex}>
                  {`${it.quantity} x ${it.name}`}
                  {it.optionsLabel ? (
                    <Text variant="caption" weight={400} color="textMuted">{`\n${it.optionsLabel}`}</Text>
                  ) : null}
                </Text>
                <Text variant="footnote" weight={600} tabular>
                  {formatINR(it.lineTotal)}
                </Text>
              </View>
            ))}
            <Divider style={styles.divider} />
            <BillDetails rows={billLines(order.bill, 'platter', { couponCode: order.coupon })} />
            <Text variant="caption" weight={500} color="textMuted">
              {`Paid via ${order.payment.label}`}
            </Text>
          </SectionCard>

          {order.canCancel ? (
            <Button title="Cancel order" variant="ghost" fullWidth onPress={() => setConfirmCancel(true)} />
          ) : null}
        </View>
      </ScrollView>

      <BottomSheet visible={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this order?">
        <View style={styles.sheet}>
          <Text variant="footnote" color="textSecondary">
            The restaurant has not started cooking yet, so you will get a full refund.
          </Text>
          <View style={styles.buttons}>
            <Button title="Keep order" variant="secondary" size="lg" style={styles.flex} onPress={() => setConfirmCancel(false)} />
            <Button
              title="Cancel order"
              size="lg"
              style={styles.flex}
              loading={cancel.isPending}
              onPress={() =>
                cancel.mutate(order.id, {
                  onSuccess: () => setConfirmCancel(false),
                  onError: (e) => toast.show({ message: e.message, tone: 'danger' }),
                })
              }
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  dim: { opacity: 0.85 },
  backInline: { marginLeft: 8 },
  hero: { paddingBottom: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  heroCenter: { flex: 1, alignItems: 'center' },
  headline: { alignItems: 'center', paddingHorizontal: 24, marginTop: 8, gap: 4 },
  subRow: { opacity: 0.92 },
  etaPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  body: { padding: 16, gap: 16 },
  mapCard: { marginTop: -56, borderRadius: 20, overflow: 'hidden' },
  card: { gap: 10 },
  rider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  riderMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  route: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  routeLine: { height: 18, marginLeft: 8, borderLeftWidth: 2, borderStyle: 'dashed' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  divider: { marginVertical: 4 },
  sheet: { gap: 20, paddingBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12 },
});
