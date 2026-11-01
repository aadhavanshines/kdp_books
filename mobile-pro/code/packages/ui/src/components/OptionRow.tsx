import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface OptionRowProps {
  title: string;
  subtitle?: string;
  /** radio: one of a group. checkbox: any number. */
  control?: 'radio' | 'checkbox';
  selected: boolean;
  onPress: () => void;
  /** Before the title, e.g. a VegMark or an icon well. */
  leading?: ReactNode;
  /** Right of the title, before the control, e.g. "+ ₹60". */
  trailing?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A selectable row with a radio or checkbox, for sheets (size, add-ons, payment, address). */
export function OptionRow({
  title,
  subtitle,
  control = 'radio',
  selected,
  onPress,
  leading,
  trailing,
  disabled,
  style,
  testID,
}: OptionRowProps) {
  const { colors } = useTheme();
  const radio = control === 'radio';
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      scaleTo={0.99}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityLabel={[title, subtitle, trailing].filter(Boolean).join(', ')}
      accessibilityState={radio ? { selected, disabled: !!disabled } : { checked: selected, disabled: !!disabled }}
      style={[styles.row, { opacity: disabled ? 0.45 : 1 }, style]}
    >
      {leading}
      <View style={styles.body}>
        <Text variant="subhead" weight={selected ? 600 : 500} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" weight={400} color="textMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text variant="subhead" color="textSecondary" tabular>
          {trailing}
        </Text>
      ) : null}
      <View
        style={[
          radio ? styles.radio : styles.checkbox,
          {
            borderColor: selected ? colors.primary : colors.textMuted,
            backgroundColor: selected && !radio ? colors.primary : 'transparent',
          },
        ]}
      >
        {selected && radio ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
        {selected && !radio ? <Icon name="checkmark" size={14} color="onPrimary" /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  body: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  checkbox: { width: 20, height: 20, borderRadius: radii.sm / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
