import { ApiError, billLines, useApplyCoupon, useCart, useCoupons, useRemoveCoupon, useSetTip, type CartLine } from '@pro/api';
import {
  ArtTile,
  BillDetails,
  BottomBar,
  Button,
  CouponSheet,
  EmptyState,
  ErrorState,
  formatINR,
  Icon,
  PressableScale,
  ProgressBar,
  QuantityStepper,
  ScreenHeader,
  SectionCard,
  Skeleton,
  Text,
  TipSelector,
  useTheme,
  useToast,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useShop } from '../components/ShopProvider';
import { etaHeadline, freeDeliveryNudge, savingsMessage } from '../lib/delivery';

function LineRow({ line }: { line: CartLine }) {
  const { quantityOf, change, openProduct } = useShop();
  const qty = quantityOf(line.productId);
  const item = { id: line.productId, price: line.unitPrice, mrp: line.mrp ?? line.unitPrice, maxPerOrder: line.maxQuantity };
  return (
    <View style={styles.line}>
      <PressableScale onPress={() => openProduct(line.productId)} accessibilityRole="button" accessibilityLabel={`${line.name}, view details`} style={styles.lineInfo}>
        <ArtTile art={line.art} tone={line.tone} size={56} artScale={0.7} decorative />
        <View style={styles.flex}>
          <Text variant="footnote" weight={600} numberOfLines={2}>
            {line.name}
          </Text>
          {line.unit ? (
            <Text variant="caption" weight={400} color="textMuted">
              {line.unit}
            </Text>
          ) : null}
        </View>
      </PressableScale>
      <View style={styles.lineRight}>
        <QuantityStepper size="sm" variant="filled" value={qty} max={line.maxQuantity} itemName={line.name} onChange={(n) => change(item, n)} />
        <View style={styles.linePrice}>
          {line.mrp && line.mrp > line.unitPrice ? (
            <Text variant="caption" weight={400} color="textMuted" tabular style={styles.strike}>
              {formatINR(line.mrp * qty)}
            </Text>
          ) : null}
          <Text variant="subhead" weight={700} tabular>
            {formatINR(line.unitPrice * qty)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { etaMinutes } = useShop();
  const params = useLocalSearchParams<{ coupons?: string }>();
  const cartQuery = useCart('minutely');
  const cart = cartQuery.data;
  const coupons = useCoupons('minutely');
  const applyCoupon = useApplyCoupon('minutely');
  const removeCoupon = useRemoveCoupon('minutely');
  const setTip = useSetTip('minutely');
  const [couponOpen, setCouponOpen] = useState(params.coupons === '1');
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const header = <ScreenHeader onBack={back} title="Your cart" subtitle={cart?.itemCount ? `${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}` : undefined} />;

  if (cartQuery.isError && !cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState art="shopping-trolley" error={cartQuery.error} onRetry={() => void cartQuery.refetch()} />
      </View>
    );
  }
  if (!cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <View style={styles.content}>
          {[48, 220, 140].map((h, i) => (
            <Skeleton key={i} height={h} radius={16} />
          ))}
        </View>
      </View>
    );
  }
  if (cart.items.length === 0) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <EmptyState
          art="shopping-trolley"
          title="Your cart is empty"
          message="Fresh fruits, milk, snacks and more, at your door in minutes."
          actionLabel="Start shopping"
          onAction={() => router.replace('/')}
          style={styles.fill}
        />
      </View>
    );
  }

  const nudge = freeDeliveryNudge(cart);
  const saving = savingsMessage(cart.bill);
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        {saving ? (
          <View style={[styles.savings, { backgroundColor: colors.successSoft }]} testID="savings-banner">
            <Icon set="mci" name="party-popper" size={18} color="success" />
            <Text variant="subhead" weight={700} color="success">
              {saving}
            </Text>
          </View>
        ) : null}

        <SectionCard>
          <View style={styles.slot}>
            <View style={[styles.slotIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name="flash" size={20} color="primary" />
            </View>
            <View style={styles.flex}>
              <Text variant="headline">{etaHeadline(etaMinutes)}</Text>
              <Text variant="caption" weight={400} color="textMuted">
                {`Instant slot · Shipment of ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}`}
              </Text>
            </View>
          </View>
          {nudge ? (
            <View style={[styles.nudge, { backgroundColor: nudge.unlocked ? colors.successSoft : colors.surfaceMuted }]}>
              <View style={styles.nudgeRow}>
                <Icon set="mci" name="moped" size={16} color={nudge.unlocked ? 'success' : 'textSecondary'} />
                <Text variant="caption" weight={700} color={nudge.unlocked ? 'success' : 'text'}>
                  {nudge.message}
                </Text>
              </View>
              {!nudge.unlocked ? <ProgressBar value={nudge.progress} height={4} accessibilityLabel={nudge.message} /> : null}
            </View>
          ) : null}
          {cart.items.map((l) => (
            <LineRow key={l.id} line={l} />
          ))}
          <Button title="Add more items" icon={{ name: 'add-circle-outline' }} variant="ghost" size="sm" onPress={() => router.replace('/')} style={styles.addMore} />
        </SectionCard>

        <SectionCard>
          <PressableScale onPress={() => setCouponOpen(true)} accessibilityRole="button" accessibilityLabel={cart.coupon ? `Coupon ${cart.coupon.code} applied. Change coupon` : 'See all coupons'} style={styles.row}>
            <Icon set="mci" name="ticket-percent" size={24} color={cart.coupon ? 'success' : 'primary'} />
            <View style={styles.flex}>
              <Text variant="headline">{cart.coupon ? `'${cart.coupon.code}' applied` : 'See all coupons'}</Text>
              <Text variant="caption" weight={500} color={cart.coupon ? 'success' : 'textMuted'}>
                {cart.coupon && cart.bill.couponDiscount > 0 ? `You saved ${formatINR(cart.bill.couponDiscount)} more` : 'Save more with coupons'}
              </Text>
            </View>
            {cart.coupon ? (
              <Button title="Remove" variant="ghost" size="sm" loading={removeCoupon.isPending} onPress={() => removeCoupon.mutate()} />
            ) : (
              <Icon name="chevron-forward" size={18} color="textMuted" />
            )}
          </PressableScale>
        </SectionCard>

        <SectionCard title="Tip your delivery partner">
          <Text variant="footnote" color="textSecondary" style={styles.tipNote}>
            Your kindness means a lot! 100% of your tip goes to your delivery partner.
          </Text>
          <TipSelector amounts={[10, 20, 30, 50]} value={cart.tip} popular={20} onChange={(n) => setTip.mutate(n)} disabled={setTip.isPending} />
        </SectionCard>

        <SectionCard title="Bill details">
          <BillDetails rows={billLines(cart.bill, 'minutely', { couponCode: cart.coupon?.code })} savings={cart.bill.savings} />
        </SectionCard>

        <View style={styles.policy}>
          <Text variant="overline" color="textMuted">
            Cancellation policy
          </Text>
          <Text variant="caption" weight={400} color="textMuted">
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </Text>
        </View>
      </ScrollView>

      <BottomBar style={styles.pay}>
        <View style={styles.flex}>
          <Text variant="title3" tabular>
            {formatINR(cart.bill.total)}
          </Text>
          <Text variant="caption" weight={600} color="primary">
            TOTAL
          </Text>
        </View>
        <Button title="Proceed to pay" size="lg" onPress={() => router.push('/checkout')} style={styles.payBtn} testID="proceed" />
      </BottomBar>

      <CouponSheet
        visible={couponOpen}
        coupons={coupons.data}
        onClose={() => {
          setCouponOpen(false);
          applyCoupon.reset();
        }}
        appliedCode={cart.coupon?.code ?? null}
        applying={applyCoupon.isPending}
        error={applyCoupon.error ? (applyCoupon.error instanceof ApiError ? applyCoupon.error.message : 'Could not apply the coupon') : null}
        onApply={(code) =>
          applyCoupon.mutate(code, {
            onSuccess: (next) => {
              setCouponOpen(false);
              toast.show({ message: next.bill.couponDiscount > 0 ? `'${code}' applied. You saved ${formatINR(next.bill.couponDiscount)}!` : `'${code}' applied`, tone: 'success', icon: { name: 'checkmark-circle' } });
            },
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  savings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12 },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slotIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nudgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nudge: { borderRadius: 10, padding: 10, gap: 8, marginTop: 4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  lineInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineRight: { alignItems: 'flex-end', gap: 4 },
  linePrice: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  strike: { textDecorationLine: 'line-through' },
  addMore: { alignSelf: 'flex-start' },
  tipNote: { marginBottom: 6 },
  policy: { paddingHorizontal: 4, gap: 4 },
  pay: { gap: 12, alignItems: 'center' },
  payBtn: { minWidth: 200 },
});
