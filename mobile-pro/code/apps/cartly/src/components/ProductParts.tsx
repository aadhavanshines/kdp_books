import { isValidPincode, useDeliveryEstimate, type Review, type VariantGroup } from '@pro/api';
import { Avatar, Button, formatINR, Icon, PressableScale, Skeleton, Stars, Text, TextField, timeAgo, useTheme } from '@pro/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Selection } from '../lib/variants';

/** Colour swatches and size / storage boxes. */
export function VariantPicker({ groups, value, onChange }: { groups: readonly VariantGroup[]; value: Selection; onChange: (next: Selection) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.variants}>
      {groups.map((g) => {
        const picked = g.options.find((o) => o.id === value[g.kind]);
        return (
          <View key={g.kind} style={styles.group}>
            <Text variant="subhead" color="textSecondary">
              {`${g.name}: `}
              <Text variant="subhead" weight={700}>
                {picked?.label ?? 'Choose'}
              </Text>
            </Text>
            <View style={styles.options}>
              {g.options.map((o) => {
                const selected = o.id === value[g.kind];
                const name = `${g.name} ${o.label}${o.available ? '' : ', out of stock'}${o.priceDelta ? `, plus ${formatINR(o.priceDelta)}` : ''}`;
                if (g.kind === 'color' && o.hex) {
                  return (
                    <PressableScale
                      key={o.id}
                      onPress={() => onChange({ ...value, [g.kind]: o.id })}
                      disabled={!o.available}
                      accessibilityRole="radio"
                      accessibilityLabel={name}
                      accessibilityState={{ selected, disabled: !o.available }}
                      style={[styles.swatchRing, { borderColor: selected ? colors.primary : 'transparent', opacity: o.available ? 1 : 0.4 }]}
                    >
                      {/* The swatch shows the product's own colour (data, not a theme colour). */}
                      <View style={[styles.swatch, { backgroundColor: o.hex, borderColor: colors.border }]} />
                    </PressableScale>
                  );
                }
                return (
                  <PressableScale
                    key={o.id}
                    onPress={() => onChange({ ...value, [g.kind]: o.id })}
                    disabled={!o.available}
                    accessibilityRole="radio"
                    accessibilityLabel={name}
                    accessibilityState={{ selected, disabled: !o.available }}
                    style={[
                      styles.box,
                      { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : colors.surface, opacity: o.available ? 1 : 0.45 },
                    ]}
                  >
                    <Text variant="subhead" weight={selected ? 700 : 500} color={selected ? 'onPrimarySoft' : 'text'} strike={!o.available}>
                      {o.label}
                    </Text>
                    {o.priceDelta ? (
                      <Text variant="caption" weight={400} color="textMuted" tabular>
                        {`+${formatINR(o.priceDelta)}`}
                      </Text>
                    ) : null}
                  </PressableScale>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Delivery date for a pincode, with a field to check another one. */
export function PincodeCheck({ productId, initialPincode, recipient }: { productId: string; initialPincode: string | undefined; recipient?: string }) {
  const [pincode, setPincode] = useState(initialPincode ?? '');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(!initialPincode);
  const estimate = useDeliveryEstimate(pincode, productId);
  const e = estimate.data;
  const check = () => {
    if (!isValidPincode(draft)) return;
    setPincode(draft);
    setEditing(false);
  };
  return (
    <View style={styles.pin}>
      {editing ? (
        <TextField
          label="Delivery pincode"
          placeholder="Enter a 6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
          value={draft}
          onChangeText={(t) => setDraft(t.replace(/\D/g, ''))}
          onSubmitEditing={check}
          error={draft.length === 6 && !isValidPincode(draft) ? 'Enter a valid pincode' : null}
          trailing={<Button title="Check" variant="ghost" size="sm" disabled={!isValidPincode(draft)} onPress={check} />}
          testID="pincode-input"
        />
      ) : (
        <View style={styles.pinRow}>
          <Icon name="location-outline" size={18} color="text" />
          <Text variant="subhead" style={styles.flex} numberOfLines={1}>
            {'Deliver to '}
            <Text variant="subhead" weight={700}>
              {recipient && pincode === initialPincode ? `${recipient} · ${pincode}` : pincode}
            </Text>
          </Text>
          <Button
            title="Change"
            variant="ghost"
            size="sm"
            onPress={() => {
              setDraft('');
              setEditing(true);
            }}
            accessibilityLabel="Change delivery pincode"
          />
        </View>
      )}
      {pincode && !editing ? (
        estimate.isLoading ? (
          <Skeleton height={40} />
        ) : e ? (
          <View style={styles.estimate} accessible accessibilityLiveRegion="polite">
            <View style={styles.pinRow}>
              <Icon name={e.serviceable ? 'cube-outline' : 'alert-circle-outline'} size={18} color={e.serviceable ? 'success' : 'danger'} />
              <Text variant="subhead" weight={700} color={e.serviceable ? 'text' : 'danger'} style={styles.flex} testID="delivery-label">
                {e.label}
              </Text>
              {e.serviceable ? (
                <Text variant="subhead" weight={700} color={e.fee ? 'text' : 'success'}>
                  {e.fee ? `${formatINR(e.fee)} delivery` : 'FREE delivery'}
                </Text>
              ) : null}
            </View>
            {e.serviceable ? (
              <View style={styles.pinRow}>
                <Icon name={e.cashOnDelivery ? 'cash-outline' : 'close-circle-outline'} size={18} color={e.cashOnDelivery ? 'textSecondary' : 'textMuted'} />
                <Text variant="footnote" color={e.cashOnDelivery ? 'textSecondary' : 'textMuted'}>
                  {e.cashOnDelivery ? 'Pay on delivery available' : 'Pay on delivery not available here'}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null
      ) : null}
    </View>
  );
}

export function ReviewCard({ review: r }: { review: Review }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.review, { borderBottomColor: colors.divider }]}>
      <View style={styles.pinRow}>
        <Avatar name={r.author} art={r.avatar} size={32} />
        <View style={styles.flex}>
          <Text variant="subhead" weight={600}>
            {r.author}
          </Text>
          <Text variant="caption" weight={400} color="textMuted">
            {`${timeAgo(r.createdAt)}${r.variantLabel ? ` · ${r.variantLabel}` : ''}`}
          </Text>
        </View>
      </View>
      <View style={styles.pinRow}>
        <Stars rating={r.rating} size={14} />
        <Text variant="subhead" weight={700} numberOfLines={1} style={styles.flex}>
          {r.title}
        </Text>
      </View>
      <Text variant="footnote" color="textSecondary">
        {r.body}
      </Text>
      <View style={styles.reviewMeta}>
        {r.verifiedPurchase ? (
          <View style={styles.pinRow}>
            <Icon name="checkmark-circle" size={14} color="success" />
            <Text variant="caption" color="success">
              Verified purchase
            </Text>
          </View>
        ) : null}
        <Text variant="caption" weight={400} color="textMuted">
          {`${r.helpfulCount} people found this helpful`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  variants: { gap: 16 },
  group: { gap: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1 },
  box: { minWidth: 64, minHeight: 44, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  pin: { gap: 10 },
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  estimate: { gap: 8 },
  review: { paddingVertical: 14, gap: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
});
