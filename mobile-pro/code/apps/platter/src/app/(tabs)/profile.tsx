import { addressLine, useAddresses, useMe, useOrders, useSignOut } from '@pro/api';
import { addressIcon, Avatar, BottomSheet, Button, Divider, ListItem, Skeleton, Text, useTheme, useToast } from '@pro/ui';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PAYMENT_OPTIONS } from '../../lib/payment';

function Group({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.group}>
      <Text variant="overline" color="textSecondary" style={styles.groupTitle}>
        {title}
      </Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const me = useMe();
  const addresses = useAddresses();
  const orders = useOrders('platter');
  const signOut = useSignOut();
  const [confirm, setConfirm] = useState(false);
  const user = me.data;
  const delivered = orders.data?.filter((o) => o.status === 'delivered') ?? [];
  const soon = (what: string) => () => toast.show({ message: `${what} is not part of the demo yet` });

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.hero, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
          {user ? (
            <>
              <Avatar name={user.name} art={user.avatar} size={64} />
              <View style={styles.flex}>
                <Text variant="title3">{user.name}</Text>
                <Text variant="footnote" color="textSecondary">{`+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`}</Text>
                <Text variant="footnote" color="textMuted" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Skeleton circle height={64} />
              <View style={[styles.flex, styles.skeletonText]}>
                <Skeleton width="50%" height={20} />
                <Skeleton width="70%" height={14} />
              </View>
            </>
          )}
        </View>

        <View style={styles.stats}>
          {[
            { label: 'Orders', value: String(orders.data?.length ?? '–') },
            { label: 'Delivered', value: String(delivered.length) },
            { label: 'Rated', value: String(delivered.filter((o) => o.rating != null).length) },
          ].map((s) => (
            <View key={s.label} style={[styles.stat, { backgroundColor: colors.surface }, theme.shadow('sm')]} accessible accessibilityLabel={`${s.value} ${s.label}`}>
              <Text variant="title2" color="primary" tabular>
                {s.value}
              </Text>
              <Text variant="caption" weight={600} color="textSecondary">
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <Group title="Saved addresses">
          {(addresses.data ?? []).map((a, i) => (
            <View key={a.id}>
              {i > 0 ? <Divider /> : null}
              <ListItem
                title={a.isDefault ? `${a.label} (default)` : a.label}
                subtitle={`${addressLine(a)}, ${a.locality}`}
                leading={addressIcon(a.label)}
              />
            </View>
          ))}
          {addresses.isLoading ? <Skeleton height={56} /> : null}
        </Group>

        <Group title="Payments">
          {PAYMENT_OPTIONS.slice(0, 2).map((p, i) => (
            <View key={p.id}>
              {i > 0 ? <Divider /> : null}
              <ListItem title={p.title} subtitle={p.subtitle} leading={p.icon} />
            </View>
          ))}
        </Group>

        <Group title="More">
          <ListItem title="Your orders" leading={{ name: 'receipt-outline' }} onPress={() => router.push('/orders')} />
          <Divider />
          <ListItem title="Favourite restaurants" leading={{ name: 'heart-outline' }} onPress={soon('Favourites')} />
          <Divider />
          <ListItem title="Help and support" leading={{ name: 'chatbubbles-outline' }} onPress={soon('Support chat')} />
          <Divider />
          <ListItem title="Log out" leading={{ name: 'log-out-outline' }} destructive onPress={() => setConfirm(true)} />
        </Group>

        <Text variant="caption" weight={400} color="textMuted" align="center">
          {`Platter v${Constants.expoConfig?.version ?? '1.0.0'} · Made with care in Northbay`}
        </Text>
      </ScrollView>

      <BottomSheet visible={confirm} onClose={() => setConfirm(false)} title="Log out of Platter?">
        <View style={styles.sheet}>
          <Text variant="footnote" color="textSecondary">
            Your cart and order history stay saved on your account.
          </Text>
          <View style={styles.buttons}>
            <Button title="Cancel" variant="secondary" size="lg" style={styles.flex} onPress={() => setConfirm(false)} />
            <Button
              title="Log out"
              size="lg"
              style={styles.flex}
              onPress={() => {
                setConfirm(false);
                signOut();
              }}
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
  content: { padding: 16, gap: 20, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20 },
  skeletonText: { gap: 8 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16 },
  group: { gap: 8 },
  groupTitle: { marginLeft: 4 },
  card: { borderRadius: 18, paddingHorizontal: 16 },
  sheet: { gap: 20, paddingBottom: 8 },
  buttons: { flexDirection: 'row', gap: 12 },
});
