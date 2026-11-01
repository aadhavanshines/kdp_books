import { addressLine, returnableLines, useOrder, useRequestReturn } from '@pro/api';
import {
  ArtTile,
  BottomBar,
  Button,
  ErrorState,
  formatINR,
  Icon,
  OptionRow,
  ScreenHeader,
  SectionCard,
  shortDate,
  Skeleton,
  Text,
  TextField,
  useTheme,
} from '@pro/ui';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { canSubmitReturn, refundTotal, RETURN_REASONS, toggleId } from '../../lib/returns';

export default function ReturnScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useOrder(id);
  const order = query.data;
  const request = useRequestReturn();
  const [lineIds, setLineIds] = useState<string[] | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const close = () => (router.canGoBack() ? router.back() : router.replace(`/order/${id}`));
  const header = <ScreenHeader onBack={close} backLabel="Close" title="Return items" subtitle={order ? `Order ${order.number}` : undefined} />;

  if (query.isError && !order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ErrorState error={query.error} onRetry={() => void query.refetch()} art="package" />
      </View>
    );
  }
  if (!order) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <View style={styles.content}>
          <Skeleton height={160} radius={14} />
        </View>
      </View>
    );
  }

  const done = request.data?.returns.at(-1);
  if (done) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        {header}
        <ScrollView contentContainerStyle={styles.doneWrap}>
          <View style={[styles.doneIcon, { backgroundColor: colors.successSoft }]}>
            <Icon name="checkmark-circle" size={56} color="success" />
          </View>
          <Text variant="title2" align="center" accessibilityRole="header">
            Return requested
          </Text>
          <Text variant="footnote" color="textSecondary" align="center">
            {`Our courier partner will pick up the item${done.lineIds.length > 1 ? 's' : ''} on ${shortDate(done.pickupDate)} between 9 am and 7 pm. Keep it in its original packaging.`}
          </Text>
          <View style={[styles.doneCard, { backgroundColor: colors.surface }, theme.shadow('sm')]}>
            {[
              ['Return ID', done.id.toUpperCase()],
              ['Pickup', shortDate(done.pickupDate)],
              ['Refund', formatINR(done.refundAmount)],
              ['Refund to', order.payment.kind === 'cash' ? 'Bank account (we will ask at pickup)' : order.payment.label],
            ].map(([k, v]) => (
              <View key={k} style={styles.kv}>
                <Text variant="footnote" color="textMuted">
                  {k}
                </Text>
                <Text variant="footnote" weight={700} align="right" style={styles.flex}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
          <Button title="Back to order" size="lg" fullWidth onPress={() => router.replace(`/order/${order.id}`)} />
        </ScrollView>
      </View>
    );
  }

  const lines = returnableLines(order);
  const chosen = lineIds ?? (lines.length === 1 ? [lines[0]!.id] : []);
  const refund = refundTotal(order, chosen);
  const ready = canSubmitReturn(chosen, reason);

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {header}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionCard title="1. Which items?">
          {lines.map((l) => (
            <OptionRow
              key={l.id}
              control="checkbox"
              title={l.name}
              subtitle={`Qty ${l.quantity} · ${formatINR(l.lineTotal)}`}
              selected={chosen.includes(l.id)}
              onPress={() => setLineIds(toggleId(chosen, l.id))}
              leading={<ArtTile art={l.art} size={48} decorative />}
            />
          ))}
          {!order.canReturn ? (
            <Text variant="footnote" color="danger">
              This order can no longer be returned.
            </Text>
          ) : null}
        </SectionCard>

        <SectionCard title="2. Why are you returning it?">
          {RETURN_REASONS.map((r) => (
            <OptionRow key={r} title={r} selected={reason === r} onPress={() => setReason(r)} />
          ))}
          <TextField label="Tell us more (optional)" placeholder="What went wrong?" value={comment} onChangeText={setComment} multiline maxLength={300} />
        </SectionCard>

        <SectionCard title="3. Pickup and refund">
          <View style={styles.infoRow}>
            <Icon name="home-outline" size={18} color="primary" />
            <Text variant="footnote" style={styles.flex}>
              {`Pickup from ${order.address.label}: ${addressLine(order.address)}, ${order.address.pincode}`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={18} color="primary" />
            <Text variant="footnote" style={styles.flex}>
              Pickup by tomorrow, 9 am to 7 pm
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="wallet-outline" size={18} color="primary" />
            <Text variant="footnote" style={styles.flex}>
              {`Refund to ${order.payment.kind === 'cash' ? 'your bank account' : order.payment.label}, within 2 days of pickup`}
            </Text>
          </View>
        </SectionCard>
        {request.error ? (
          <Text variant="footnote" color="danger" align="center">
            {request.error.message}
          </Text>
        ) : null}
      </ScrollView>
      <BottomBar>
        <View style={styles.flex}>
          <Text variant="caption" color="textMuted">
            Refund amount
          </Text>
          <Text variant="title3" tabular>
            {formatINR(refund)}
          </Text>
        </View>
        <Button
          title="Request return"
          size="lg"
          disabled={!ready || !order.canReturn}
          loading={request.isPending}
          onPress={() => reason && request.mutate({ id: order.id, input: { lineIds: chosen, reason, comment: comment.trim() || undefined } })}
          testID="submit-return"
        />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  doneWrap: { padding: 24, gap: 14, alignItems: 'center' },
  doneIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  doneCard: { alignSelf: 'stretch', borderRadius: 14, padding: 16, gap: 10 },
  kv: { flexDirection: 'row', gap: 12 },
});
