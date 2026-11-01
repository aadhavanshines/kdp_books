import type { OrderSummary } from '@pro/api';
import { ArtTile, Icon, PressableScale, Text, formatINR, useTheme } from '@pro/ui';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { deliveryLine, statusTone } from '../lib/orders';

export function OrderCard({ order: o }: { order: OrderSummary }) {
  const theme = useTheme();
  const tone = statusTone(o.status);
  const { colors } = theme;
  const dot = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : tone === 'info' ? colors.info : colors.warning;
  const line = deliveryLine(o);
  return (
    <PressableScale
      onPress={() => router.push(`/order/${o.id}`)}
      accessibilityLabel={`${line}. ${o.title}. ${formatINR(o.total)}. Order ${o.number}`}
      scaleTo={0.98}
      style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]}
    >
      <ArtTile art={o.art} size={72} decorative />
      <View style={styles.body}>
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: dot }]} />
          <Text variant="subhead" weight={700} numberOfLines={1} style={styles.flex}>
            {line}
          </Text>
        </View>
        <Text variant="footnote" color="textSecondary" numberOfLines={2}>
          {o.title}
        </Text>
        <Text variant="caption" weight={400} color="textMuted" tabular>
          {`${o.number} · ${formatINR(o.total)}`}
        </Text>
      </View>
      <Icon name="chevron-forward" size={18} color="textMuted" />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14 },
  body: { flex: 1, gap: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  flex: { flex: 1 },
});
