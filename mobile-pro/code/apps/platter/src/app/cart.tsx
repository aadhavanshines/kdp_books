import {
  addressLine,
  ApiError,
  billLines,
  type CartLine,
  defaultAddress,
  useAddresses,
  useApplyCoupon,
  useCart,
  useCoupons,
  usePlaceOrder,
  useRemoveCartLine,
  useRemoveCoupon,
  useSetCartAddress,
  useSetTip,
  useUpdateCartLine,
} from '@pro/api';
import {
  addressIcon,
  AddressSheet,
  Art,
  BillDetails,
  BottomBar,
  Button,
  CouponSheet,
  EmptyState,
  ErrorState,
  formatINR,
  Icon,
  PaymentSheet,
  PressableScale,
  QuantityStepper,
  ScreenHeader,
  SectionCard,
  Skeleton,
  Text,
  TextField,
  TipSelector,
  useTheme,
  useToast,
  VegMark,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { deliveryWindow } from '../components/RestaurantCard';
import { PAYMENT_OPTIONS, paymentLabel, paymentOption } from '../lib/payment';

function LineRow({ line }: { line: CartLine }) {
  const update = useUpdateCartLine('platter');
  const remove = useRemoveCartLine('platter');
  const [qty, setQty] = useState<number | null>(null);
  const shown = qty ?? line.quantity;
  return (
    <View style={styles.line}>
      <View style={styles.lineMark}>{line.isVeg != null ? <VegMark veg={line.isVeg} size={13} /> : null}</View>
      <View style={styles.flex}>
        <Text variant="subhead" weight={600}>
          {line.name}
        </Text>
        {line.optionsLabel ? (
          <Text variant="caption" weight={400} color="textMuted">
            {line.optionsLabel}
          </Text>
        ) : null}
        <Text variant="caption" weight={500} color="textSecondary" tabular>
          {formatINR(line.unitPrice)}
        </Text>
      </View>
      <View style={styles.lineRight}>
        <QuantityStepper
          size="sm"
          value={shown}
          max={line.maxQuantity}
          itemName={line.name}
          onChange={(n) => {
            setQty(n);
            const done = { onSettled: () => setQty(null) };
            if (n <= 0) remove.mutate(line.id, done);
            else update.mutate({ lineId: line.id, input: { quantity: n } }, done);
          }}
        />
        <Text variant="subhead" weight={600} tabular>
          {formatINR(line.unitPrice * shown)}
        </Text>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const cartQuery = useCart('platter');
  const cart = cartQuery.data;
  const addresses = useAddresses();
  const coupons = useCoupons('platter');
  const applyCoupon = useApplyCoupon('platter');
  const removeCoupon = useRemoveCoupon('platter');
  const setTip = useSetTip('platter');
  const setCartAddress = useSetCartAddress('platter');
  const placeOrder = usePlaceOrder();
  const [addressId, setAddressId] = useState<string>();
  const [paymentId, setPaymentId] = useState('upi');
  const [instructions, setInstructions] = useState('');
  const [sheet, setSheet] = useState<'coupon' | 'address' | 'payment' | null>(null);
  const address = addresses.data?.find((a) => a.id === addressId) ?? defaultAddress(addresses.data);
  const payment = paymentOption(paymentId);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const header = (
    <ScreenHeader
      onBack={goBack}
      title={cart?.restaurant?.name ?? 'Cart'}
      subtitle={cart?.restaurant && address ? `${deliveryWindow(cart.restaurant)} to ${address.label}` : undefined}
    />
  );

  if (cartQuery.isError && !cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState art="cooking" error={cartQuery.error} onRetry={() => void cartQuery.refetch()} />
      </View>
    );
  }
  if (!cart) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <View style={styles.content}>
          {[120, 96, 180].map((h, i) => (
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
          art="cooking"
          title="Your cart is empty"
          message="Good food is always cooking. Go ahead, order some yummy items from the menu."
          actionLabel="Browse restaurants"
          onAction={() => router.replace('/')}
          style={styles.fill}
        />
      </View>
    );
  }

  const r = cart.restaurant;
  const order = () => {
    if (!address) {
      setSheet('address');
      return;
    }
    placeOrder.mutate(
      { app: 'platter', addressId: address.id, payment: payment.input, instructions: instructions.trim() || undefined },
      {
        onSuccess: (o) => router.replace(`/order/${o.id}`),
        onError: (e) => toast.show({ message: e instanceof ApiError ? e.message : 'Could not place the order', tone: 'danger' }),
      },
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {cart.bill.savings > 0 ? (
          <View style={[styles.savings, { backgroundColor: colors.successSoft }]}>
            <Icon set="mci" name="party-popper" size={18} color="success" />
            <Text variant="subhead" weight={700} color="success">
              {`You're saving ${formatINR(cart.bill.savings)} on this order`}
            </Text>
          </View>
        ) : null}

        <SectionCard titleVariant="overline">
          {r ? (
            <PressableScale onPress={() => router.push(`/restaurant/${r.id}`)} accessibilityLabel={`${r.name}, open menu`} scaleTo={0.99} style={styles.restaurant}>
              <View style={[styles.rArt, { backgroundColor: colors.primarySoft }]}>
                <Art name={r.art} size={32} decorative />
              </View>
              <View style={styles.flex}>
                <Text variant="headline" weight={700}>
                  {r.name}
                </Text>
                <Text variant="caption" weight={400} color="textMuted">
                  {r.locality}
                </Text>
              </View>
            </PressableScale>
          ) : null}
          {cart.items.map((l) => (
            <LineRow key={l.id} line={l} />
          ))}
          <View style={[styles.addMore, { borderTopColor: colors.divider }]}>
            <Button
              title="Add more items"
              icon={{ name: 'add-circle-outline' }}
              variant="ghost"
              size="sm"
              onPress={() => (r ? router.push(`/restaurant/${r.id}`) : goBack())}
            />
          </View>
          <TextField
            label="Cooking instructions"
            hideLabel
            placeholder="Add cooking instructions"
            value={instructions}
            onChangeText={setInstructions}
            maxLength={140}
          />
        </SectionCard>

        <SectionCard titleVariant="overline" title="Offers">
          <PressableScale onPress={() => setSheet('coupon')} accessibilityLabel={cart.coupon ? `Coupon ${cart.coupon.code} applied. Change coupon` : 'Apply coupon'} scaleTo={0.99} style={styles.couponRow}>
            <Icon set="mci" name="ticket-percent" size={24} color={cart.coupon ? 'success' : 'primary'} />
            <View style={styles.flex}>
              <Text variant="headline" weight={700}>
                {cart.coupon ? `'${cart.coupon.code}' applied` : 'Apply coupon'}
              </Text>
              <Text variant="caption" weight={500} color={cart.coupon ? 'success' : 'textMuted'}>
                {cart.coupon
                  ? cart.bill.couponDiscount > 0
                    ? `${formatINR(cart.bill.couponDiscount)} saved with this coupon`
                    : cart.bill.deliveryFeeWaived > 0
                      ? 'Free delivery unlocked'
                      : cart.coupon.title
                  : 'Save more with coupons on this order'}
              </Text>
            </View>
            {cart.coupon ? (
              <Button title="Remove" variant="ghost" size="sm" loading={removeCoupon.isPending} onPress={() => removeCoupon.mutate()} />
            ) : (
              <Icon name="chevron-forward" size={18} color="textMuted" />
            )}
          </PressableScale>
        </SectionCard>

        <SectionCard titleVariant="overline" title="Tip your delivery partner">
          <Text variant="footnote" color="textSecondary" style={styles.tipNote}>
            Your kindness means a lot. 100% of the tip goes to your delivery partner.
          </Text>
          <TipSelector value={cart.tip} popular={30} onChange={(n) => setTip.mutate(n)} disabled={setTip.isPending} />
        </SectionCard>

        <SectionCard titleVariant="overline" title="Bill details">
          <BillDetails rows={billLines(cart.bill, 'platter', { couponCode: cart.coupon?.code })} savings={cart.bill.savings} />
        </SectionCard>

        <SectionCard titleVariant="overline" title="Delivery">
          <PressableScale onPress={() => setSheet('address')} accessibilityLabel={address ? `Delivering to ${address.label}. Change address` : 'Choose address'} scaleTo={0.99} style={styles.couponRow}>
            <View style={[styles.well, { backgroundColor: colors.primarySoft }]}>
              <Icon {...addressIcon(address?.label ?? 'home')} size={18} color="onPrimarySoft" />
            </View>
            <View style={styles.flex}>
              <Text variant="headline" weight={700}>
                {address ? `Delivering to ${address.label}` : 'Choose a delivery address'}
              </Text>
              {address ? (
                <Text variant="caption" weight={400} color="textMuted" numberOfLines={2}>
                  {`${addressLine(address)}, ${address.locality}`}
                </Text>
              ) : null}
            </View>
            <Text variant="subhead" weight={700} color="primary">
              Change
            </Text>
          </PressableScale>
        </SectionCard>

        <View style={styles.policy}>
          <Text variant="overline" color="textMuted">
            Cancellation policy
          </Text>
          <Text variant="caption" weight={400} color="textMuted">
            You can cancel until the restaurant starts preparing your food. After that, a 100% cancellation fee applies.
          </Text>
        </View>
      </ScrollView>

      <BottomBar style={styles.payBar}>
        <PressableScale onPress={() => setSheet('payment')} accessibilityLabel={`Pay using ${paymentLabel(payment)}. Change payment method`} scaleTo={0.98} style={styles.payWith}>
          <View style={styles.payTop}>
            <Text variant="caption" weight={700} color="textMuted">
              PAY USING
            </Text>
            <Icon name="caret-up" size={12} color="textMuted" />
          </View>
          <Text variant="subhead" weight={700} numberOfLines={1}>
            {payment.title}
          </Text>
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
            {payment.subtitle}
          </Text>
        </PressableScale>
        <Button
          title="Place order"
          trailingText={formatINR(cart.bill.total)}
          size="lg"
          variant="accent"
          style={styles.place}
          loading={placeOrder.isPending}
          onPress={order}
          testID="place-order"
        />
      </BottomBar>

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
        onApply={(code) =>
          applyCoupon.mutate(code, {
            onSuccess: (next) => {
              setSheet(null);
              toast.show({
                message: next.bill.couponDiscount > 0 ? `'${code}' applied. You saved ${formatINR(next.bill.couponDiscount)}!` : `'${code}' applied`,
                tone: 'success',
                icon: { name: 'checkmark-circle' },
              });
            },
          })
        }
      />
      <AddressSheet
        visible={sheet === 'address'}
        onClose={() => setSheet(null)}
        addresses={addresses.data}
        selectedId={address?.id}
        onSelect={(a) => {
          setAddressId(a.id);
          // The delivery fee depends on the distance, so re-price the bill for this address.
          setCartAddress.mutate(a.id);
          setSheet(null);
        }}
      />
      <PaymentSheet
        visible={sheet === 'payment'}
        options={PAYMENT_OPTIONS}
        onClose={() => setSheet(null)}
        selectedId={paymentId}
        onSelect={(id) => {
          setPaymentId(id);
          setSheet(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  savings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12 },
  restaurant: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 8 },
  rArt: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  lineMark: { paddingTop: 3, width: 14 },
  lineRight: { alignItems: 'flex-end', gap: 6 },
  addMore: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, marginBottom: 4 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  well: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tipNote: { marginBottom: 6 },
  policy: { paddingHorizontal: 4, gap: 4 },
  payBar: { gap: 12 },
  payWith: { width: 120 },
  payTop: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  place: { flex: 1 },
});
