import { addressLine, useAddresses, useMe, useOrders, useSignOut } from '@pro/api';
import { addressIcon, Avatar, BottomSheet, Button, formatINR, ListItem, Skeleton, Text, useTheme, useToast } from '@pro/ui';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function AccountScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const me = useMe();
  const addresses = useAddresses();
  const orders = useOrders('minutely');
  const signOut = useSignOut();
  const [confirm, setConfirm] = useState(false);
  const user = me.data;
  const delivered = orders.data?.filter((o) => o.status === 'delivered') ?? [];
  const spent = delivered.reduce((s, o) => s + o.total, 0);
  const soon = (what: string) => () => toast.show({ message: `${what} is not part of the demo yet` });

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
        <Text variant="title2" accessibilityRole="header">
          Account
        </Text>
        <View style={[styles.hero, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
          {user ? (
            <>
              <Avatar name={user.name} art={user.avatar} size={60} />
              <View style={styles.flex}>
                <Text variant="title3">{user.name}</Text>
                <Text variant="footnote" color="textSecondary">{`+91 ${user.phone.slice(0, 5)} ${user.phone.slice(5)}`}</Text>
              </View>
            </>
          ) : (
            <>
              <Skeleton circle height={60} />
              <View style={styles.flex}>
                <Skeleton width="50%" height={20} />
              </View>
            </>
          )}
        </View>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
            <Text variant="title2" color="primary" tabular>
              {String(delivered.length)}
            </Text>
            <Text variant="caption" weight={600} color="onPrimarySoft">
              Orders delivered
            </Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.accentSoft }]}>
            <Text variant="title2" tabular>
              {formatINR(spent)}
            </Text>
            <Text variant="caption" weight={600} color="textSecondary">
              Spent on Minutely
            </Text>
          </View>
        </View>

        <Group title="Your information">
          <ListItem title="Your orders" leading={{ name: 'bag-handle-outline' }} chevron onPress={() => router.navigate('/orders')} />
          {(addresses.data ?? []).slice(0, 2).map((a) => (
            <ListItem key={a.id} title={a.label} subtitle={`${addressLine(a)}, ${a.locality}`} leading={addressIcon(a.label)} chevron onPress={soon('Editing addresses')} />
          ))}
          <ListItem title="Payment methods" subtitle="UPI, cards and cash" leading={{ name: 'card-outline' }} chevron onPress={soon('Saved payment methods')} />
        </Group>

        <Group title="Help and more">
          <ListItem title="Help and support" leading={{ name: 'chatbubbles-outline' }} chevron onPress={soon('Support chat')} />
          <ListItem title="Notifications" leading={{ name: 'notifications-outline' }} chevron onPress={soon('Notification settings')} />
          <ListItem title="About Minutely" subtitle="Version 1.0.0 · Northbay" leading={{ name: 'information-circle-outline' }} />
          <ListItem title="Log out" leading={{ name: 'log-out-outline' }} destructive onPress={() => setConfirm(true)} />
        </Group>
      </ScrollView>

      <BottomSheet visible={confirm} onClose={() => setConfirm(false)} title="Log out?" subtitle="You can log back in with your phone number any time.">
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
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1, gap: 4 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, borderRadius: 16, padding: 14, gap: 2 },
  group: { gap: 8 },
  groupTitle: { paddingHorizontal: 4 },
  card: { borderRadius: 16, overflow: 'hidden' },
  buttons: { flexDirection: 'row', gap: 12, paddingBottom: 8 },
});
