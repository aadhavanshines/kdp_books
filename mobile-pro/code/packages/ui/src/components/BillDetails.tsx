import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { formatINR } from '../utils/format';
import { Text, type ColorToken } from './Text';

export interface BillRow {
  key: string;
  label: string;
  /** Signed rupees; negative rows are discounts ("-₹100"). */
  amount: number;
  /** Struck-through amount before this one (a waived fee or MRP total). */
  waivedAmount?: number;
  note?: string;
  tone?: 'default' | 'discount' | 'total';
}

export interface BillDetailsProps {
  rows: readonly BillRow[];
  /** A green line under the total: "You saved ₹137 on this order". */
  savings?: number;
  style?: StyleProp<ViewStyle>;
}

function amountText(row: BillRow): string {
  if (row.amount === 0 && row.waivedAmount && row.tone !== 'total' && row.key !== 'itemTotal') return 'FREE';
  return row.amount < 0 ? `-${formatINR(-row.amount)}` : formatINR(row.amount);
}

/** A bill: label and amount rows, discounts in green, a bold total. */
export function BillDetails({ rows, savings, style }: BillDetailsProps) {
  const { colors } = useTheme();
  return (
    <View style={style}>
      {rows.map((row) => {
        const total = row.tone === 'total';
        const discount = row.tone === 'discount' || amountText(row) === 'FREE';
        const color: ColorToken = discount ? 'success' : total ? 'text' : 'textSecondary';
        const text = amountText(row);
        return (
          <View
            key={row.key}
            accessible
            accessibilityLabel={`${row.label}, ${text}${row.waivedAmount ? `, was ${formatINR(row.waivedAmount)}` : ''}`}
            style={[
              styles.row,
              total && [styles.totalRow, { borderTopColor: colors.divider }],
            ]}
          >
            <View style={styles.labelCol}>
              <Text variant={total ? 'headline' : 'footnote'} weight={total ? 700 : 400} color={total ? 'text' : 'textSecondary'}>
                {row.label}
              </Text>
              {row.note ? (
                <Text variant="caption" weight={400} color="textMuted">
                  {row.note}
                </Text>
              ) : null}
            </View>
            <View style={styles.amountCol}>
              {row.waivedAmount ? (
                <Text variant="footnote" color="textMuted" strike tabular>
                  {formatINR(row.waivedAmount)}
                </Text>
              ) : null}
              <Text variant={total ? 'headline' : 'footnote'} weight={total ? 700 : 500} color={color} tabular>
                {text}
              </Text>
            </View>
          </View>
        );
      })}
      {savings && savings > 0 ? (
        <View style={[styles.savings, { backgroundColor: colors.successSoft }]}>
          <Text variant="subhead" weight={600} color="success" align="center">
            {`You saved ${formatINR(savings)} on this order`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: 6, gap: 12 },
  totalRow: { marginTop: 6, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  labelCol: { flex: 1 },
  amountCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savings: { marginTop: 12, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
});
