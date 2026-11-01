import { formatPhone, unreadCount, useAddresses, useApplyCoupon, useCoupons, useMe, useNotifications, useOrders, useSignOut } from '@pro/api';
import {
  AddressSheet,
  Avatar,
  Badge,
  CouponSheet,
  GradientFill,
  Icon,
  ListItem,
  PaymentSheet,
  PressableScale,
  Skeleton,
  Text,
  useTheme,
  useToast,
  type IoniconName,
} from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrderCard } from '../../components/OrderCard';
import { PAYMENT_OPTIONS } from '../../lib/payment';

export default function AccountScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const me = useMe();
  const orders = useOrders('cartly');
  const addresses = useAddresses();
  const notifications = useNotifications('cartly');
  const coupons = useCoupons('cartly');
  const applyCoupon = useApplyCoupon('cartly');
  const signOut = useSignOut();
  const [sheet, setSheet] = useState<'address' | 'payment' | 'coupons' | null>(null);
  const unread = unreadCount(notifications.data);
  const user = me.data;
  const latest = orders.data?.[0];

  const tiles: { icon: IoniconName; label: string; onPress: () => void }[] = [
    { icon: 'cube-outline', label: 'Orders', onPress: () => router.push('/orders') },
    { icon: 'heart-outline', label: 'Wishlist', onPress: () => router.push('/wishlist') },
    { icon: 'pricetags-outline', label: 'Coupons', onPress: () => setSheet('coupons') },
    { icon: 'headset-outline', label: 'Help centre', onPress: () => toast.show('Help centre: chat with us 24x7') },
  ];

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <GradientFill colors={colors.gradient} direction="vertical" />
          {user ? (
            <View style={styles.user}>
              <Avatar name={user.name} art={user.avatar} size={64} />
              <View style={styles.flex}>
                <Text variant="title2" color="onPrimary" accessibilityRole="header">
                  {`Hello, ${user.name.split(' ')[0]}`}
                </Text>
                <Text variant="footnote" color="onPrimary">
                  {formatPhone(user.phone)}
                </Text>
                <Text variant="footnote" color="onPrimary" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <Badge label="Cartly Plus" tone="accent" variant="solid" icon={{ name: 'star' }} />
            </View>
          ) : (
            <Skeleton height={64} />
          )}
        </View>

        <View style={[styles.tiles, { backgroundColor: colors.surface }, theme.shadow('md')]}>
          {tiles.map((t) => (
            <PressableScale key={t.label} onPress={t.onPress} accessibilityLabel={t.label} style={styles.tile}>
              <View style={[styles.tileIcon, { backgroundColor: colors.primarySoft }]}>
                <Icon name={t.icon} size={22} color="primary" />
              </View>
              <Text variant="caption" weight={600}>
                {t.label}
              </Text>
            </PressableScale>
          ))}
        </View>

        {latest ? (
          <View style={styles.block}>
            <Text variant="overline" color="textSecondary">
              Your latest order
            </Text>
            <OrderCard order={latest} />
          </View>
        ) : null}

        <View style={styles.block}>
          <Text variant="overline" color="textSecondary">
            Account settings
          </Text>
          <View style={[styles.list, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
            <ListItem
              title="Notifications"
              subtitle="Order updates, offers and price drops"
              leading={{ name: 'notifications-outline' }}
              trailing={unread ? <Badge label={`${unread} new`} tone="danger" variant="solid" /> : undefined}
              chevron
              onPress={() => router.push('/notifications')}
            />
            <ListItem
              title="Saved addresses"
              subtitle={addresses.data ? `${addresses.data.length} addresses` : undefined}
              leading={{ name: 'location-outline' }}
              onPress={() => setSheet('address')}
            />
            <ListItem title="Payment methods" subtitle="UPI, cards and wallet" leading={{ name: 'card-outline' }} onPress={() => setSheet('payment')} />
            <ListItem title="My orders" subtitle={orders.data ? `${orders.data.length} orders` : undefined} leading={{ name: 'receipt-outline' }} onPress={() => router.push('/orders')} />
            <ListItem title="Log out" leading={{ name: 'log-out-outline' }} destructive onPress={signOut} />
          </View>
        </View>
        <Text variant="caption" weight={400} color="textMuted" align="center">
          Cartly 1.0 · A demo store with fictional products
        </Text>
      </ScrollView>

      <AddressSheet
        visible={sheet === 'address'}
        onClose={() => setSheet(null)}
        title="Saved addresses"
        addresses={addresses.data}
        selectedId={addresses.data?.find((a) => a.isDefault)?.id}
        showPincode
        onSelect={() => setSheet(null)}
      />
      <PaymentSheet visible={sheet === 'payment'} onClose={() => setSheet(null)} title="Saved payment methods" options={PAYMENT_OPTIONS} selectedId="upi" onSelect={() => setSheet(null)} />
      <CouponSheet
        visible={sheet === 'coupons'}
        onClose={() => setSheet(null)}
        coupons={coupons.data}
        appliedCode={null}
        applying={applyCoupon.isPending}
        error={applyCoupon.error?.message ?? null}
        onApply={(code) =>
          applyCoupon.mutate(code, {
            onSuccess: () => {
              setSheet(null);
              toast.show({ message: `'${code}' applied to your cart`, tone: 'success' });
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
  content: { paddingBottom: 32, gap: 16 },
  hero: { paddingHorizontal: 16, paddingBottom: 48, overflow: 'hidden' },
  user: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tiles: { flexDirection: 'row', marginHorizontal: 16, marginTop: -48, borderRadius: 16, paddingVertical: 14 },
  tile: { flex: 1, alignItems: 'center', gap: 6, minHeight: 64 },
  tileIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  block: { marginHorizontal: 16, gap: 8 },
  list: { borderRadius: 14, paddingHorizontal: 4, overflow: 'hidden' },
});
