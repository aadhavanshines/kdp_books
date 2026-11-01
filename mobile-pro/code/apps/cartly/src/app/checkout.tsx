import {
  ApiError,
  useAddresses,
  useApplyCoupon,
  useCart,
  useCoupons,
  useDeliveryEstimate,
  useMe,
  usePlaceOrder,
  useRemoveCoupon,
  type CartLine,
} from '@pro/api';
import {
  AddressSheet,
  ArtTile,
  Badge,
  BillDetails,
  BottomBar,
  Button,
  CouponSheet,
  EmptyState,
  ErrorState,
  formatINR,
  Icon,
  type IoniconName,
  PaymentSheet,
  PressableScale,
  ProgressSteps,
  ScreenHeader,
  SectionCard,
  Skeleton,
  Text,
  useTheme,
  useToast,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { paymentChoices, paymentOption } from '../lib/payment';
import { priceDetails } from '../lib/price';
import { useDeliveryAddress } from '../lib/useDeliveryAddress';

const STEPS = [
  { key: 'address', label: 'Address' },
  { key: 'summary', label: 'Summary' },
  { key: 'payment', label: 'Payment' },
];

const TRUST: { icon: IoniconName; text: string }[] = [
  { icon: 'lock-closed', text: '100% secure payments, encrypted end to end' },
  { icon: 'refresh-circle', text: 'Easy returns within 7 to 10 days of delivery' },
  { icon: 'ribbon', text: 'Genuine products from verified sellers' },
];

function SummaryLine({ line, pincode }: { line: CartLine; pincode?: string }) {
  const estimate = useDeliveryEstimate(pincode ?? '', line.productId);
  return (
    <View style={styles.line}>
      <ArtTile art={line.art} tone={line.tone} size={64} decorative />
      <View style={styles.flex}>
        <Text variant="footnote" numberOfLines={2}>
          {line.name}
        </Text>
        <Text variant="caption" weight={400} color="textMuted">
          {[line.optionsLabel, `Qty ${line.quantity}`].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.row}>
          <Text variant="subhead" weight={700} tabular>
            {formatINR(line.lineTotal)}
          </Text>
          {line.mrp && line.mrp > line.unitPrice ? (
            <Text variant="caption" color="textMuted" strike tabular>
              {formatINR(line.mrp * line.quantity)}
            </Text>
          ) : null}
        </View>
        {estimate.data?.serviceable ? (
          <View style={styles.row}>
            <Icon name="cube-outline" size={13} color="success" />
            <Text variant="caption" weight={600} color="success">
              {estimate.data.label}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function CheckoutScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const toast = useToast();
  const cartQuery = useCart('cartly');
  const cart = cartQuery.data;
  const me = useMe();
  const addresses = useAddresses();
  const [address, setAddressId] = useDeliveryAddress(addresses.data);
  const area = useDeliveryEstimate(address?.pincode ?? '');
  const coupons = useCoupons('cartly');
  const applyCoupon = useApplyCoupon('cartly');
  const removeCoupon = useRemoveCoupon('cartly');
  const placeOrder = usePlaceOrder();
  const [paymentId, setPaymentId] = useState('upi');
  const [sheet, setSheet] = useState<'address' | 'payment' | 'coupon' | null>(null);
  const cod = area.data?.cashOnDelivery ?? true;
  const choices = paymentChoices(cod);
  const payment = paymentOption(paymentId === 'cod' && !cod ? 'upi' : paymentId);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/cart'));
  const header = <ScreenHeader onBack={back} title="Checkout" subtitle={cart ? `${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}` : undefined} />;

  if (cartQuery.isError && !cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState error={cartQuery.error} onRetry={() => void cartQuery.refetch()} art="shopping-trolley" />
      </View>
    );
  }
  if (!cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <View style={styles.content}>
          {[110, 160, 120].map((h, i) => (
            <Skeleton key={i} height={h} radius={14} />
          ))}
        </View>
      </View>
    );
  }
  if (cart.items.length === 0) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <EmptyState art="shopping-trolley" title="Nothing to check out" message="Your cart is empty." actionLabel="Continue shopping" onAction={() => router.replace('/')} />
      </View>
    );
  }

  const place = () => {
    if (!address) return setSheet('address');
    placeOrder.mutate(
      { app: 'cartly', addressId: address.id, payment: payment.input },
      {
        onSuccess: (order) => router.replace(`/order-confirmed/${order.id}`),
        onError: (e) => toast.show({ message: e instanceof ApiError ? e.message : 'Could not place the order. Try again.', tone: 'danger' }),
      },
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content} testID="checkout-scroll">
        <View style={[styles.steps, { backgroundColor: colors.surface }]}>
          <ProgressSteps steps={STEPS} current={2} orientation="horizontal" />
        </View>

        <SectionCard title="Deliver to" right={<Button title="Change" variant="ghost" size="sm" onPress={() => setSheet('address')} accessibilityLabel="Change delivery address" />}>
          {address ? (
            <View style={styles.address}>
              <View style={styles.row}>
                <Text variant="subhead" weight={700}>
                  {address.recipient}
                </Text>
                <Badge label={address.label.toUpperCase()} tone="neutral" />
              </View>
              <Text variant="footnote" color="textSecondary">
                {[address.line1, address.line2, address.landmark].filter(Boolean).join(', ')}
              </Text>
              <Text variant="footnote" color="textSecondary">
                {`${address.locality}, ${address.city} ${address.pincode}`}
              </Text>
              {me.data ? (
                <Text variant="footnote" color="textSecondary">
                  {`Phone: +91 ${me.data.phone}`}
                </Text>
              ) : null}
            </View>
          ) : (
            <Skeleton height={64} />
          )}
        </SectionCard>

        <SectionCard title={`Order summary`}>
          {cart.items.map((l) => (
            <SummaryLine key={l.id} line={l} pincode={address?.pincode} />
          ))}
        </SectionCard>

        <SectionCard title="Offers">
          <PressableScale
            onPress={() => setSheet('coupon')}
            accessibilityLabel={cart.coupon ? `Coupon ${cart.coupon.code} applied. Change coupon` : 'Apply coupon'}
            style={styles.offerRow}
          >
            <Icon name="pricetags-outline" size={20} color="primary" />
            <Text variant="subhead" weight={600} style={styles.flex}>
              {cart.coupon ? `'${cart.coupon.code}' applied` : 'Apply a coupon'}
            </Text>
            {cart.coupon ? (
              <Button title="Remove" variant="ghost" size="sm" onPress={() => removeCoupon.mutate()} accessibilityLabel={`Remove coupon ${cart.coupon.code}`} />
            ) : (
              <Icon name="chevron-forward" size={18} color="textMuted" />
            )}
          </PressableScale>
          <View style={[styles.bank, { backgroundColor: colors.successSoft }]}>
            <Icon name="card" size={16} color="success" />
            <Text variant="caption" color="success" style={styles.flex}>
              10% instant discount on Northbay Bank cards, applied when you pay
            </Text>
          </View>
        </SectionCard>

        <SectionCard title="Payment method" right={<Button title="Change" variant="ghost" size="sm" onPress={() => setSheet('payment')} accessibilityLabel="Change payment method" />}>
          <PressableScale onPress={() => setSheet('payment')} accessibilityLabel={`Pay using ${payment.title}, ${payment.subtitle}`} style={styles.payRow}>
            <View style={[styles.well, { backgroundColor: colors.surfaceMuted }]}>
              <Icon {...payment.icon} size={20} color="text" />
            </View>
            <View style={styles.flex}>
              <Text variant="subhead" weight={700}>
                {payment.title}
              </Text>
              <Text variant="caption" weight={400} color="textMuted">
                {payment.subtitle}
              </Text>
            </View>
          </PressableScale>
          {payment.offer ? (
            <Text variant="caption" color="success">
              {payment.offer}
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard title="Price details">
          <BillDetails rows={priceDetails(cart.bill, cart.itemCount, cart.coupon?.code)} savings={cart.bill.savings} />
        </SectionCard>

        <View style={styles.trust}>
          {TRUST.map((t) => (
            <View key={t.text} style={styles.row}>
              <Icon name={t.icon} size={16} color="success" />
              <Text variant="caption" color="textSecondary" style={styles.flex}>
                {t.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomBar>
        <View style={styles.flex}>
          <Text variant="caption" color="textMuted">
            Total to pay
          </Text>
          <Text variant="title3" tabular>
            {formatINR(cart.bill.total)}
          </Text>
        </View>
        <Button
          title={payment.input.kind === 'cash' ? 'Place order' : `Pay ${formatINR(cart.bill.total)}`}
          variant="accent"
          size="lg"
          icon={{ name: 'lock-closed' }}
          loading={placeOrder.isPending}
          onPress={place}
          style={styles.cta}
          testID="place-order"
        />
      </BottomBar>

      <AddressSheet
        visible={sheet === 'address'}
        onClose={() => setSheet(null)}
        addresses={addresses.data}
        selectedId={address?.id}
        showPincode
        onSelect={(a) => {
          setAddressId(a.id);
          setSheet(null);
        }}
      />
      <PaymentSheet
        visible={sheet === 'payment'}
        onClose={() => setSheet(null)}
        options={choices}
        selectedId={payment.id}
        onSelect={(id) => {
          setPaymentId(id);
          setSheet(null);
        }}
        note="Payments are secured with 256-bit encryption. This is a demo: no money is charged."
      />
      <CouponSheet
        visible={sheet === 'coupon'}
        coupons={coupons.data}
        onClose={() => {
          setSheet(null);
          applyCoupon.reset();
        }}
        appliedCode={cart.coupon?.code ?? null}
        applying={applyCoupon.isPending}
        error={applyCoupon.error?.message ?? null}
        onApply={(code) => applyCoupon.mutate(code, { onSuccess: () => setSheet(null) })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  steps: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8 },
  address: { gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  line: { flexDirection: 'row', gap: 12, paddingVertical: 6 },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  bank: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  well: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trust: { gap: 8, paddingHorizontal: 4 },
  cta: { minWidth: 180 },
});
