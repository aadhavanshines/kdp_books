import { addressLine, ApiError, billLines, defaultAddress, useAddresses, useCart, usePlaceOrder } from '@pro/api';
import {
  AddressSheet,
  addressIcon,
  BillDetails,
  BottomBar,
  Button,
  formatINR,
  Icon,
  OptionRow,
  PressableScale,
  ScreenHeader,
  SectionCard,
  Skeleton,
  Text,
  TextField,
  useTheme,
  useToast,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useShop } from '../components/ShopProvider';
import { etaHeadline } from '../lib/delivery';
import { PAYMENT_OPTIONS, paymentOption } from '../lib/payment';

export default function CheckoutScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { etaMinutes } = useShop();
  const { data: cart } = useCart('minutely');
  const addresses = useAddresses();
  const placeOrder = usePlaceOrder();
  const [addressId, setAddressId] = useState<string>();
  const [addressOpen, setAddressOpen] = useState(false);
  const [paymentId, setPaymentId] = useState('upi');
  const [instructions, setInstructions] = useState('');
  const address = addresses.data?.find((a) => a.id === addressId) ?? defaultAddress(addresses.data);
  const payment = paymentOption(paymentId);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/cart'));

  const pay = () => {
    if (!address) {
      setAddressOpen(true);
      return;
    }
    placeOrder.mutate(
      { app: 'minutely', addressId: address.id, payment: payment.input, instructions: instructions.trim() || undefined },
      {
        onSuccess: (o) => router.replace(`/order/${o.id}`),
        onError: (e) => toast.show({ message: e instanceof ApiError ? e.message : 'Could not place the order', tone: 'danger' }),
      },
    );
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScreenHeader onBack={back} title="Payment" subtitle={cart ? `${cart.itemCount} items · ${etaHeadline(etaMinutes)}` : undefined} />
      {!cart ? (
        <View style={styles.content}>
          <Skeleton height={90} radius={16} />
          <Skeleton height={220} radius={16} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SectionCard title="Deliver to">
            <PressableScale
              onPress={() => setAddressOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={address ? `Delivering to ${address.label}. Change address` : 'Choose a delivery address'}
              style={styles.row}
            >
              <View style={[styles.well, { backgroundColor: colors.primarySoft }]}>
                <Icon {...addressIcon(address?.label ?? 'home')} size={18} color="onPrimarySoft" />
              </View>
              <View style={styles.flex}>
                <Text variant="headline">{address ? address.label : 'Choose a delivery address'}</Text>
                {address ? (
                  <Text variant="caption" weight={400} color="textMuted" numberOfLines={2}>
                    {`${addressLine(address)}, ${address.locality}, ${address.city}`}
                  </Text>
                ) : null}
              </View>
              <Text variant="subhead" weight={700} color="primary">
                Change
              </Text>
            </PressableScale>
            <TextField label="Delivery instructions" hideLabel placeholder="Note for your delivery partner" value={instructions} onChangeText={setInstructions} maxLength={140} />
          </SectionCard>

          <SectionCard title="Pay with">
            {PAYMENT_OPTIONS.map((p) => (
              <OptionRow
                key={p.id}
                title={p.title}
                subtitle={p.subtitle}
                selected={paymentId === p.id}
                onPress={() => setPaymentId(p.id)}
                leading={
                  <View style={[styles.well, { backgroundColor: colors.surfaceMuted }]}>
                    <Icon {...p.icon} size={18} color="text" />
                  </View>
                }
                testID={`pay-${p.id}`}
              />
            ))}
          </SectionCard>

          <SectionCard title="Bill summary">
            <BillDetails rows={billLines(cart.bill, 'minutely', { couponCode: cart.coupon?.code })} savings={cart.bill.savings} />
          </SectionCard>
          <View style={styles.secure}>
            <Icon name="shield-checkmark" size={14} color="textMuted" />
            <Text variant="caption" weight={400} color="textMuted">
              Demo payments only. No money is charged.
            </Text>
          </View>
        </ScrollView>
      )}

      {cart ? (
        <BottomBar>
          <Button
            title={`Pay ${formatINR(cart.bill.total)} with ${payment.input.kind === 'cash' ? 'cash' : payment.title}`}
            size="lg"
            fullWidth
            style={styles.flex}
            loading={placeOrder.isPending}
            disabled={cart.items.length === 0}
            onPress={pay}
            testID="pay"
          />
        </BottomBar>
      ) : null}

      <AddressSheet
        visible={addressOpen}
        onClose={() => setAddressOpen(false)}
        addresses={addresses.data}
        selectedId={address?.id}
        onSelect={(a) => {
          setAddressId(a.id);
          setAddressOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 12, gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 8 },
  well: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
