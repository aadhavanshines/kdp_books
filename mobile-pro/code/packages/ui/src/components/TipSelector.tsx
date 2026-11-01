import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { formatINR } from '../utils/format';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface TipSelectorProps {
  /** Rupee amounts to offer. */
  amounts?: readonly number[];
  /** Current tip, 0 for none. */
  value: number;
  /** Called with the new tip; tapping the selected amount again clears it (0). */
  onChange: (amount: number) => void;
  /** The amount to mark "Most tipped". */
  popular?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Tip chips: ₹20  ₹30  ₹50  ₹80. Tap again to remove the tip. */
export function TipSelector({ amounts = [20, 30, 50, 80], value, onChange, popular, disabled, style }: TipSelectorProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, style]} accessibilityRole="radiogroup">
      {amounts.map((amount) => {
        const selected = value === amount;
        return (
          <PressableScale
            key={amount}
            disabled={disabled}
            onPress={() => onChange(selected ? 0 : amount)}
            accessibilityRole="radio"
            accessibilityLabel={`Tip ${formatINR(amount)}${popular === amount ? ', most tipped' : ''}`}
            accessibilityState={{ selected, disabled: !!disabled }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primarySoft : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text variant="subhead" weight={700} color={selected ? 'onPrimarySoft' : 'text'} tabular>
              {formatINR(amount)}
            </Text>
            {popular === amount ? (
              <View style={[styles.popular, { backgroundColor: colors.accentSoft }]}>
                <Text variant="caption" weight={700} color="success" style={styles.popularText}>
                  MOST TIPPED
                </Text>
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  popular: { marginTop: 2, paddingHorizontal: 4, borderRadius: 4 },
  popularText: { fontSize: 9, lineHeight: 12, letterSpacing: 0.3 },
});
