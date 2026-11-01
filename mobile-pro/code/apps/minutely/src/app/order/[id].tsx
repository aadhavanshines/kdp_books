import { addressLine, billLines, orderProgress, useOrderStream } from '@pro/api';
import {
  Art,
  ArtTile,
  Avatar,
  BillDetails,
  CountdownTimer,
  ErrorState,
  formatClock,
  formatINR,
  GradientFill,
  Icon,
  IconButton,
  MapView,
  ProgressSteps,
  SectionCard,
  Skeleton,
  Text,
  useTheme,
  useToast,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { countdownWindow, trackingCopy } from '../../lib/tracking';

export default function TrackingScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { order, rider, connected, error } = useOrderStream(id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/orders'));

  if (!order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <IconButton name="arrow-back" label="Go back" onPress={back} style={styles.inlineBack} />
        {error ? (
          <ErrorState art="shopping-trolley" error={error} onRetry={() => router.replace(`/order/${id}`)} />
        ) : (
          <View style={styles.body} accessible accessibilityLabel="Loading your order">
            <Skeleton height={220} radius={20} />
            <Skeleton height={260} radius={20} />
          </View>
        )}
      </View>
    );
  }

  const p = orderProgress(order);
  const copy = trackingCopy(order);
  const window = countdownWindow(order);
  const tracking = order.tracking;
  const progress = p.isDelivered ? 1 : (rider?.progress ?? tracking?.progress ?? null);
  const steps = order.timeline
    .filter((s) => s.status !== 'cancelled')
    .map((s) => ({ key: s.status, label: s.label, description: s.description, time: formatClock(s.at) }));
  const itemCount = order.items.reduce((n, l) => n + l.quantity, 0);

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} testID="tracking-scroll">
        <View style={[styles.hero, { paddingTop: insets.top + 4 }]}>
          <GradientFill colors={p.isCancelled ? [colors.textSecondary, colors.textSecondary] : colors.gradient} direction="vertical" />
          <View style={styles.heroBar}>
            <IconButton name="arrow-back" label="Go back" onPress={back} color="onPrimary" />
            <View style={styles.flex}>
              <Text variant="headline" color="onPrimary" align="center">
                {`Order #${order.number}`}
              </Text>
              <Text variant="caption" weight={500} color="onPrimary" align="center" style={styles.dim}>
                {`${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${formatINR(order.bill.total)}`}
              </Text>
            </View>
            <IconButton name="help-circle-outline" label="Get help with this order" color="onPrimary" onPress={() => toast.show({ message: 'Support chat opens here in the full app' })} />
          </View>

          <View style={styles.heroBody}>
            {p.isActive ? (
              <CountdownTimer
                endsAt={window.endsAt}
                totalSeconds={window.totalSeconds}
                variant="ring"
                format="ms"
                size={148}
                label="left"
                doneLabel="Any moment"
                color="onPrimary"
                fillColor="onPrimary"
                trackColor="primaryPressed"
                testID="countdown"
              />
            ) : (
              <View style={[styles.doneArt, { backgroundColor: colors.primaryPressed }]}>
                <Art name={p.isDelivered ? 'party-popper' : 'package'} size={88} decorative />
              </View>
            )}
            <Text variant="title1" weight={800} color="onPrimary" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
              {copy.title}
            </Text>
            <Text variant="subhead" color="onPrimary" align="center" style={styles.dim}>
              {copy.subtitle}
            </Text>
            {p.isActive ? (
              <View style={[styles.pill, { backgroundColor: colors.surface }]}>
                <View style={[styles.dot, { backgroundColor: connected ? colors.success : colors.textMuted }]} />
                <Text variant="caption" weight={700}>
                  {`${connected ? 'LIVE' : 'Connecting'} · Arriving by ${formatClock(order.etaAt)}`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {tracking && !p.isCancelled ? (
            <View style={[styles.mapCard, { backgroundColor: colors.surface }, theme.shadow('md')]}>
              <MapView
                route={tracking.route}
                progress={p.isMoving || p.isDelivered ? progress : null}
                riderArt="motor-scooter"
                aspectRatio={1.35}
                accessibilityLabel={p.isMoving ? `Map: your delivery partner is ${Math.round((progress ?? 0) * 100)}% of the way` : 'Map of the store and your address'}
                markers={[
                  { key: 'store', point: tracking.origin.point, art: tracking.origin.art, label: tracking.origin.label },
                  { key: 'home', point: tracking.destination.point, icon: { name: 'home' }, label: tracking.destination.label },
                ]}
              />
            </View>
          ) : null}

          {order.rider && !p.isCancelled ? (
            <SectionCard>
              <View style={styles.rider}>
                <Avatar name={order.rider.name} art={order.rider.avatar} size={52} />
                <View style={styles.flex}>
                  <Text variant="headline">{order.rider.name}</Text>
                  <Text variant="caption" weight={400} color="textMuted">
                    {p.isMoving ? 'Your delivery partner is on the way' : p.isDelivered ? 'Delivered your order' : 'Will pick up your order in a moment'}
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
                  name="call"
                  label={`Call ${order.rider.name}`}
                  variant="filled"
                  onPress={() => void Linking.openURL(`tel:${order.rider!.phone.replace(/\s/g, '')}`).catch(() => undefined)}
                />
              </View>
              {order.bill.tip > 0 ? (
                <View style={[styles.tip, { backgroundColor: colors.successSoft }]}>
                  <Icon name="heart" size={14} color="success" />
                  <Text variant="caption" weight={700} color="success">
                    {`You tipped ${formatINR(order.bill.tip)}. Thank you!`}
                  </Text>
                </View>
              ) : null}
            </SectionCard>
          ) : null}

          <SectionCard title="Order status">
            <ProgressSteps steps={steps} current={p.isCancelled ? -1 : p.current} />
          </SectionCard>

          <SectionCard title={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} in this order`}>
            {order.items.map((l) => (
              <View key={l.id} style={styles.item}>
                <ArtTile art={l.art} size={44} artScale={0.7} decorative />
                <View style={styles.flex}>
                  <Text variant="footnote" weight={600} numberOfLines={1}>
                    {l.name}
                  </Text>
                  <Text variant="caption" weight={400} color="textMuted">
                    {`Qty ${l.quantity}`}
                  </Text>
                </View>
                <Text variant="footnote" weight={700} tabular>
                  {formatINR(l.lineTotal)}
                </Text>
              </View>
            ))}
            <BillDetails rows={billLines(order.bill, 'minutely', { couponCode: order.coupon })} savings={order.bill.savings} />
          </SectionCard>

          <SectionCard title="Delivering to">
            <View style={styles.row}>
              <Icon name="location" size={18} color="primary" />
              <Text variant="footnote" color="textSecondary" style={styles.flex}>
                {`${order.address.label} · ${addressLine(order.address)}, ${order.address.locality}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Icon name="wallet-outline" size={18} color="primary" />
              <Text variant="footnote" color="textSecondary" style={styles.flex}>
                {`Paid via ${order.payment.label}`}
              </Text>
            </View>
          </SectionCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  dim: { opacity: 0.9 },
  inlineBack: { marginLeft: 8 },
  hero: { paddingBottom: 48, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  heroBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  heroBody: { alignItems: 'center', gap: 6, paddingHorizontal: 24, marginTop: 8 },
  doneArt: { width: 148, height: 148, borderRadius: 74, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { padding: 12, gap: 12 },
  mapCard: { marginTop: -40, borderRadius: 20, overflow: 'hidden' },
  rider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riderMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  tip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, padding: 8, marginTop: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
});
