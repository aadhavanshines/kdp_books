import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconSpec;
  /** Show a chevron: the chip opens a picker (e.g. "Sort"). */
  dropdown?: boolean;
  /** Show a close icon when selected, for removable filters. */
  removable?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A filter or choice chip. 36 tall with hitSlop to a 44 target. */
export function Chip({ label, selected = false, onPress, icon, dropdown, removable, disabled, style }: ChipProps) {
  const { colors } = useTheme();
  const fg = selected ? 'onPrimarySoft' : 'text';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled: !!disabled }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon {...icon} size={16} color={fg} /> : null}
      <Text variant="subhead" color={fg} numberOfLines={1}>
        {label}
      </Text>
      {dropdown ? <Icon name="chevron-down" size={14} color={fg} /> : null}
      {removable && selected ? <Icon name="close" size={14} color={fg} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
