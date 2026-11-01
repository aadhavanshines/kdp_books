import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { TextVariant } from '../tokens/scale';
import { discountPercent, formatINR } from '../utils/format';
import { Text } from './Text';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface PriceProps {
  /** Selling price in rupees. */
  amount: number;
  /** Maximum retail price. Shown struck through when higher than `amount`. */
  mrp?: number | null;
  size?: PriceSize;
  /** Show "17% off" after the MRP. */
  showDiscount?: boolean;
  /** Put MRP and discount on a line under the price. */
  stacked?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const variants: Record<PriceSize, { price: TextVariant; meta: TextVariant }> = {
  sm: { price: 'subhead', meta: 'caption' },
  md: { price: 'headline', meta: 'caption' },
  lg: { price: 'title3', meta: 'footnote' },
  xl: { price: 'title1', meta: 'body' },
};

/** "₹249  ₹̶2̶9̶9̶  17% off", with tabular figures and one spoken label. */
export function Price({ amount, mrp, size = 'md', showDiscount = true, stacked = false, style, testID }: PriceProps) {
  const off = discountPercent(amount, mrp);
  const hasMrp = off > 0 && mrp != null;
  const v = variants[size];
  const label = hasMrp
    ? `Price ${formatINR(amount)}, MRP ${formatINR(mrp)}${showDiscount ? `, ${off}% off` : ''}`
    : `Price ${formatINR(amount)}`;

  const meta = hasMrp ? (
    <View style={styles.row}>
      <Text variant={v.meta} color="textMuted" strike tabular>
        {formatINR(mrp)}
      </Text>
      {showDiscount ? (
        <Text variant={v.meta} weight={700} color="success" tabular>
          {off}% off
        </Text>
      ) : null}
    </View>
  ) : null;

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[stacked ? styles.stack : styles.row, style]}
    >
      <Text variant={v.price} weight={size === 'sm' ? 600 : 700} tabular>
        {formatINR(amount)}
      </Text>
      {meta}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  stack: { gap: 2 },
});
