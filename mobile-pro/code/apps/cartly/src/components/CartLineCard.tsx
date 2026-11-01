import { useDeliveryEstimate, useRemoveCartLine, useUpdateCartLine, type CartLine } from '@pro/api';
import { ArtTile, Icon, PressableScale, Price, QuantityStepper, Text, useTheme, useToast, type IconSpec } from '@pro/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

function Action({ icon, label, onPress, a11y }: { icon: IconSpec; label: string; onPress: () => void; a11y: string }) {
  const { colors } = useTheme();
  return (
    <PressableScale onPress={onPress} accessibilityLabel={a11y} scaleTo={0.98} style={[styles.action, { borderLeftColor: colors.divider }]}>
      <Icon {...icon} size={16} color="textSecondary" />
      <Text variant="caption" weight={600} color="textSecondary">
        {label}
      </Text>
    </PressableScale>
  );
}

/** A cart line: art, title, variant, price, delivery date, stepper and actions. */
export function CartLineCard({ line, pincode, saved }: { line: CartLine; pincode?: string; saved?: boolean }) {
  const theme = useTheme();
  const toast = useToast();
  const update = useUpdateCartLine('cartly');
  const remove = useRemoveCartLine('cartly');
  const [qty, setQty] = useState<number | null>(null);
  const estimate = useDeliveryEstimate(saved ? '' : (pincode ?? ''), line.productId);
  const shown = qty ?? line.quantity;
  const move = (savedForLater: boolean) =>
    update.mutate(
      { lineId: line.id, input: { savedForLater } },
      { onSuccess: () => toast.show({ message: savedForLater ? 'Saved for later' : 'Moved to cart', tone: 'success' }) },
    );

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, theme.shadow('sm')]} testID={`line-${line.id}`}>
      <View style={styles.top}>
        <PressableScale onPress={() => router.push(`/product/${line.productId}`)} accessibilityLabel={`Open ${line.name}`} scaleTo={0.98}>
          <ArtTile art={line.art} tone={line.tone} size={88} artScale={0.7} decorative />
        </PressableScale>
        <View style={styles.info}>
          <Text variant="subhead" weight={500} numberOfLines={2}>
            {line.name}
          </Text>
          {line.optionsLabel ? (
            <Text variant="caption" weight={400} color="textMuted" numberOfLines={1}>
              {line.optionsLabel}
            </Text>
          ) : null}
          <Price amount={line.unitPrice} mrp={line.mrp} size="md" />
          {!line.inStock ? (
            <Text variant="caption" weight={700} color="danger">
              Out of stock
            </Text>
          ) : !saved && estimate.data?.serviceable ? (
            <View style={styles.eta}>
              <Icon name="cube-outline" size={13} color="success" />
              <Text variant="caption" weight={600} color="success" numberOfLines={1}>
                {estimate.data.label}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={[styles.actions, { borderTopColor: theme.colors.divider }]}>
        {saved ? (
          <Action icon={{ name: 'cart-outline' }} label="Move to cart" a11y={`Move ${line.name} to cart`} onPress={() => move(false)} />
        ) : (
          <View style={styles.stepper}>
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
          </View>
        )}
        {!saved ? <Action icon={{ name: 'bookmark-outline' }} label="Save for later" a11y={`Save ${line.name} for later`} onPress={() => move(true)} /> : null}
        <Action
          icon={{ name: 'trash-outline' }}
          label="Remove"
          a11y={`Remove ${line.name}`}
          onPress={() => remove.mutate(line.id, { onSuccess: () => toast.show({ message: 'Item removed' }) })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, overflow: 'hidden' },
  top: { flexDirection: 'row', gap: 12, padding: 12 },
  info: { flex: 1, gap: 4 },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actions: { flexDirection: 'row', alignItems: 'stretch', borderTopWidth: StyleSheet.hairlineWidth, minHeight: 48 },
  stepper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderLeftWidth: StyleSheet.hairlineWidth },
});
