import {
  useAddresses,
  useApplyCoupon,
  useCart,
  useCoupons,
  useRemoveCoupon,
} from '@pro/api';
import {
  AddressSheet,
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
  SectionCard,
  Skeleton,
  Text,
  useTheme,
  useToast,
} from '@pro/ui';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartLineCard } from '../../components/CartLineCard';
import { DeliverTo } from '../../components/DeliverTo';
import { priceDetails } from '../../lib/price';
import { useDeliveryAddress } from '../../lib/useDeliveryAddress';

export default function CartScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const cartQuery = useCart('cartly');
  const cart = cartQuery.data;
  const addresses = useAddresses();
  const [address, setAddressId] = useDeliveryAddress(addresses.data);
  const coupons = useCoupons('cartly');
  const applyCoupon = useApplyCoupon('cartly');
  const removeCoupon = useRemoveCoupon('cartly');
  const [sheet, setSheet] = useState<'coupon' | 'address' | null>(null);
  const scroller = useRef<ScrollViewInstance>(null);
  const [billY, setBillY] = useState(0);

  const header = (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface }]}>
      <Text variant="title2" accessibilityRole="header">
        {cart && cart.itemCount > 0 ? `My cart (${cart.itemCount})` : 'My cart'}
      </Text>
    </View>
  );

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
          {[140, 140, 200].map((h, i) => (
            <Skeleton key={i} height={h} radius={14} />
          ))}
        </View>
      </View>
    );
  }

  const empty = cart.items.length === 0;
  const rows = priceDetails(cart.bill, cart.itemCount, cart.coupon?.code);
  const toFree = cart.amountToFreeDelivery;

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      {!empty ? <DeliverTo address={address} onChange={() => setSheet('address')} /> : null}
      <ScrollView ref={scroller} contentContainerStyle={styles.content} testID="cart-scroll">
        {empty ? (
          <EmptyState
            art="shopping-trolley"
            title="Your cart is empty"
            message={cart.savedForLater.length ? 'Move something you saved for later, or find today’s deals.' : 'Add items you love and they will show up here.'}
            actionLabel="Shop today’s deals"
            onAction={() => router.push('/')}
          />
        ) : (
          <>
            {toFree != null && toFree > 0 ? (
              <View style={[styles.freeBar, { backgroundColor: colors.infoSoft }]} accessible accessibilityLabel={`Add ${formatINR(toFree)} more for free delivery`}>
                <Text variant="footnote" color="text">
                  {'Add '}
                  <Text variant="footnote" weight={700}>
                    {formatINR(toFree)}
                  </Text>
                  {' more for FREE delivery'}
                </Text>
                <ProgressBar value={cart.bill.itemTotal / (cart.bill.itemTotal + toFree)} color="info" trackColor="surface" />
              </View>
            ) : (
              <View style={[styles.freeRow, { backgroundColor: colors.successSoft }]}>
                <Icon name="checkmark-circle" size={16} color="success" />
                <Text variant="footnote" weight={600} color="success">
                  Your order is eligible for FREE delivery
                </Text>
              </View>
            )}
            {cart.items.map((l) => (
              <CartLineCard key={l.id} line={l} pincode={address?.pincode} />
            ))}

            <PressableScale
              onPress={() => setSheet('coupon')}
              accessibilityLabel={cart.coupon ? `Coupon ${cart.coupon.code} applied. Change coupon` : 'Apply coupon'}
              scaleTo={0.99}
              style={[styles.coupon, { backgroundColor: colors.surface }, theme.shadow('sm')]}
            >
              <Icon name="pricetags-outline" size={22} color="primary" />
              <View style={styles.flex}>
                <Text variant="subhead" weight={700}>
                  {cart.coupon ? `'${cart.coupon.code}' applied` : 'Apply coupon'}
                </Text>
                <Text variant="caption" weight={400} color={cart.coupon ? 'success' : 'textMuted'}>
                  {cart.coupon ? `You save ${formatINR(cart.bill.couponDiscount || cart.bill.deliveryFeeWaived)}` : 'Save more with offers on your cart'}
                </Text>
              </View>
              {cart.coupon ? (
                <Button
                  title="Remove"
                  variant="ghost"
                  size="sm"
                  onPress={() => removeCoupon.mutate()}
                  accessibilityLabel={`Remove coupon ${cart.coupon.code}`}
                />
              ) : (
                <Icon name="chevron-forward" size={18} color="textMuted" />
              )}
            </PressableScale>

            <View onLayout={(e) => setBillY(e.nativeEvent.layout.y)}>
              <SectionCard title="Price details">
                <BillDetails rows={rows} savings={cart.bill.savings} />
              </SectionCard>
            </View>
            <View style={styles.trust}>
              <Icon name="shield-checkmark" size={18} color="textMuted" />
              <Text variant="caption" weight={400} color="textMuted" style={styles.flex}>
                Safe and secure payments. Easy returns. 100% authentic products.
              </Text>
            </View>
          </>
        )}

        {cart.savedForLater.length ? (
          <View style={styles.saved}>
            <Text variant="title3" accessibilityRole="header">
              {`Saved for later (${cart.savedForLater.length})`}
            </Text>
            {cart.savedForLater.map((l) => (
              <CartLineCard key={l.id} line={l} saved />
            ))}
          </View>
        ) : null}
      </ScrollView>

      {!empty ? (
        <BottomBar safeBottom={false}>
          <PressableScale onPress={() => scroller.current?.scrollTo({ y: billY, animated: true })} accessibilityLabel={`Total ${formatINR(cart.bill.total)}. View price details`} style={styles.flex}>
            {cart.bill.mrpTotal > cart.bill.total ? (
              <Text variant="caption" color="textMuted" strike tabular>
                {formatINR(cart.bill.mrpTotal)}
              </Text>
            ) : null}
            <Text variant="title3" tabular>
              {formatINR(cart.bill.total)}
            </Text>
            <Text variant="caption" weight={600} color="primary">
              View price details
            </Text>
          </PressableScale>
          <Button title="Place order" variant="accent" size="lg" onPress={() => router.push('/checkout')} style={styles.cta} testID="place-order" />
        </BottomBar>
      ) : null}

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
              const saved = next.bill.couponDiscount || next.bill.deliveryFeeWaived;
              toast.show({ message: saved ? `'${code}' applied. You save ${formatINR(saved)}!` : `'${code}' applied`, tone: 'success' });
            },
          })
        }
      />
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
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  freeBar: { borderRadius: 12, padding: 12, gap: 8 },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  coupon: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, minHeight: 64 },
  trust: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  saved: { gap: 12, marginTop: 12 },
  cta: { minWidth: 170 },
});
