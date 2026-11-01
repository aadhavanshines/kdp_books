import type { MenuItem } from '@pro/api';
import { BottomSheet, Button, OptionRow, QuantityStepper, Text, VegMark, formatINR, useTheme } from '@pro/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { defaultSelection, groupHint, missingRequired, toggleOption, unitPrice, type Selection } from '../lib/customize';

export interface CustomizeSheetProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, selection: Selection, quantity: number) => void;
  busy?: boolean;
}

/** Size, spice and add-ons for a customisable dish, with quantity and a live price. */
export function CustomizeSheet({ item, onClose, onAdd, busy }: CustomizeSheetProps) {
  const { colors } = useTheme();
  // Keep the last dish while the sheet animates closed.
  const [shown, setShown] = useState<MenuItem | null>(item);
  const [selection, setSelection] = useState<Selection>(() => (item ? defaultSelection(item) : {}));
  const [quantity, setQuantity] = useState(1);
  if (item && item !== shown) {
    setShown(item);
    setSelection(defaultSelection(item));
    setQuantity(1);
  }
  const missing = shown ? missingRequired(shown, selection) : null;
  const price = shown ? unitPrice(shown, selection) * quantity : 0;

  return (
    <BottomSheet
      visible={!!item}
      onClose={onClose}
      testID="customize-sheet"
      footer={
        shown ? (
          <View style={styles.footer}>
            <QuantityStepper value={quantity} onChange={setQuantity} min={1} max={20} itemName={shown.name} />
            <Button
              title={missing ? `Choose ${missing.name.toLowerCase()}` : `Add item ${formatINR(price)}`}
              disabled={!!missing}
              loading={busy}
              size="lg"
              style={styles.flex}
              onPress={() => onAdd(shown, selection, quantity)}
              testID="customize-add"
            />
          </View>
        ) : null
      }
    >
      {shown ? (
        <View style={styles.body}>
          <View style={styles.head}>
            <VegMark veg={shown.isVeg} />
            <Text variant="title3" style={styles.flex} numberOfLines={2}>
              {shown.name}
            </Text>
          </View>
          <Text variant="footnote" color="textSecondary" numberOfLines={2}>
            {shown.description}
          </Text>
          {shown.customizations.map((group) => (
            <View key={group.id} style={[styles.group, { backgroundColor: colors.background }]}>
              <View style={styles.groupHead}>
                <Text variant="headline" weight={700}>
                  {group.name}
                </Text>
                <Text variant="caption" weight={500} color={group.required ? 'primary' : 'textMuted'}>
                  {groupHint(group)}
                </Text>
              </View>
              <View style={[styles.options, { backgroundColor: colors.surface }]}>
                {group.options.map((option) => (
                  <OptionRow
                    key={option.id}
                    title={option.name}
                    trailing={option.price > 0 ? `+ ${formatINR(option.price)}` : undefined}
                    control={group.kind === 'single' ? 'radio' : 'checkbox'}
                    selected={selection[group.id]?.includes(option.id) ?? false}
                    onPress={() => setSelection((s) => toggleOption(s, group, option.id))}
                    leading={<VegMark veg={option.isVeg} size={12} />}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12, paddingTop: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  group: { borderRadius: 16, padding: 12, gap: 8 },
  groupHead: { gap: 2 },
  options: { borderRadius: 12, paddingHorizontal: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
