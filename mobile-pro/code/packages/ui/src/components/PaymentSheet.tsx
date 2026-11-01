import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { BottomSheet } from './BottomSheet';
import { Icon, type IconSpec } from './Icon';
import { OptionRow } from './OptionRow';
import { Text } from './Text';

export interface PaymentChoice {
  id: string;
  title: string;
  subtitle: string;
  icon: IconSpec;
  /** Greyed out with the subtitle explaining why (e.g. no cash on delivery here). */
  disabled?: boolean;
  /** A short offer line, e.g. "5% cashback with Northbay Bank cards". */
  offer?: string;
}

export interface PaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  options: readonly PaymentChoice[];
  selectedId: string;
  onSelect: (id: string) => void;
  title?: string;
  /** Small print under the options. */
  note?: string;
}

/** Choose how to pay: UPI, card, wallet, cash. */
export function PaymentSheet({
  visible,
  onClose,
  options,
  selectedId,
  onSelect,
  title = 'Pay using',
  note = 'This is a demo: no money is charged.',
}: PaymentSheetProps) {
  const { colors } = useTheme();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} testID="payment-sheet">
      {options.map((p) => (
        <View key={p.id}>
          <OptionRow
            title={p.title}
            subtitle={p.subtitle}
            selected={p.id === selectedId}
            disabled={p.disabled}
            onPress={() => onSelect(p.id)}
            leading={
              <View style={[styles.well, { backgroundColor: colors.surfaceMuted }]}>
                <Icon {...p.icon} size={20} color="text" />
              </View>
            }
          />
          {p.offer ? (
            <View style={[styles.offer, { backgroundColor: colors.successSoft }]}>
              <Icon name="pricetag" size={12} color="success" />
              <Text variant="caption" color="success">
                {p.offer}
              </Text>
            </View>
          ) : null}
        </View>
      ))}
      {note ? (
        <View style={styles.noteRow}>
          <Icon name="lock-closed" size={14} color="textMuted" />
          <Text variant="caption" weight={400} color="textMuted" style={styles.note}>
            {note}
          </Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  well: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  offer: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginLeft: 52, marginTop: -4, marginBottom: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  note: { flex: 1 },
});
