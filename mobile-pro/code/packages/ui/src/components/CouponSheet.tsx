import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { formatINR } from '../utils/format';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { Skeleton } from './Skeleton';
import { Text } from './Text';
import { TextField } from './TextField';

/** The fields of an @pro/api CouponOffer the sheet shows. */
export interface CouponChoice {
  code: string;
  title: string;
  description: string;
  kind: 'flat' | 'percent' | 'free_delivery';
  value: number;
  applicable: boolean;
  /** Why it cannot be applied ("Add ₹120 more to apply"). */
  reason: string | null;
  estimatedSavings: number;
}

/** Applicable coupons first, then by savings. */
export function sortCoupons<C extends CouponChoice>(coupons: readonly C[]): C[] {
  return [...coupons].sort((a, b) => Number(b.applicable) - Number(a.applicable) || b.estimatedSavings - a.estimatedSavings);
}

export interface CouponSheetProps {
  visible: boolean;
  /** Undefined while loading. */
  coupons: readonly CouponChoice[] | undefined;
  onClose: () => void;
  appliedCode: string | null;
  onApply: (code: string) => void;
  applying?: boolean;
  error?: string | null;
}

/** Coupons for the current cart, best savings first, plus a code field. */
export function CouponSheet({ visible, coupons, onClose, appliedCode, onApply, applying, error }: CouponSheetProps) {
  const [code, setCode] = useState('');
  const sorted = sortCoupons(coupons ?? []);
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Apply coupon" testID="coupon-sheet">
      <View style={styles.gap}>
        <TextField
          label="Coupon code"
          hideLabel
          placeholder="Enter coupon code"
          autoCapitalize="characters"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ''))}
          error={error}
          trailing={
            <Button title="Apply" variant="ghost" size="sm" disabled={!code || applying} onPress={() => onApply(code)} />
          }
        />
        <Divider label="AVAILABLE COUPONS" />
        {!coupons
          ? [0, 1, 2].map((i) => <Skeleton key={i} height={96} radius={12} />)
          : sorted.map((c) => (
              <CouponRow key={c.code} coupon={c} applied={c.code === appliedCode} onApply={() => onApply(c.code)} disabled={applying} />
            ))}
      </View>
    </BottomSheet>
  );
}

function CouponRow({ coupon: c, applied, onApply, disabled }: { coupon: CouponChoice; applied: boolean; onApply: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.coupon, { borderColor: colors.border, opacity: c.applicable ? 1 : 0.7 }]}>
      <View style={[styles.stub, { backgroundColor: c.applicable ? colors.primary : colors.textMuted }]}>
        <Text variant="caption" weight={800} color="onPrimary" style={styles.stubText}>
          {c.kind === 'free_delivery' ? 'FREE DEL' : c.kind === 'flat' ? `₹${c.value} OFF` : `${c.value}% OFF`}
        </Text>
      </View>
      <View style={styles.couponBody}>
        <View style={styles.couponHead}>
          <View style={[styles.code, { borderColor: colors.border }]}>
            <Text variant="subhead" weight={800} tabular>
              {c.code}
            </Text>
          </View>
          {applied ? (
            <View style={styles.applied}>
              <Icon name="checkmark-circle" size={16} color="success" />
              <Text variant="subhead" weight={700} color="success">
                Applied
              </Text>
            </View>
          ) : (
            <Button title="APPLY" variant="ghost" size="sm" disabled={!c.applicable || disabled} onPress={onApply} accessibilityLabel={`Apply ${c.code}`} />
          )}
        </View>
        <Text variant="subhead" weight={700}>
          {c.title}
        </Text>
        {c.applicable && c.estimatedSavings > 0 ? (
          <Text variant="caption" weight={600} color="success">
            {`Save ${formatINR(c.estimatedSavings)} on this order`}
          </Text>
        ) : null}
        <Text variant="caption" weight={400} color="textMuted">
          {c.reason ?? c.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12, paddingBottom: 8 },
  coupon: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  stub: { width: 34, alignItems: 'center', justifyContent: 'center' },
  stubText: { transform: [{ rotate: '-90deg' }], width: 96, textAlign: 'center', fontSize: 11 },
  couponBody: { flex: 1, padding: 12, gap: 2 },
  couponHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  code: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  applied: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 },
});
