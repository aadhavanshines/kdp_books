import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type ColorToken } from './Text';

export type IconButtonVariant = 'plain' | 'soft' | 'filled' | 'surface';

export type IconButtonProps = IconSpec & {
  /** Required: what the button does, for screen readers ("Open cart"). */
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  /** Visual diameter. The touch target is never under 44. */
  size?: number;
  iconSize?: number;
  color?: ColorToken;
  /** A count bubble (cart items, unread notifications). */
  badge?: number;
  /** Toggle state, e.g. a wishlist heart. */
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function IconButton({
  label,
  onPress,
  variant = 'plain',
  size = 40,
  iconSize,
  color,
  badge,
  selected,
  disabled,
  style,
  testID,
  ...icon
}: IconButtonProps) {
  const theme = useTheme();
  const { colors } = theme;
  const bg: Record<IconButtonVariant, string> = {
    plain: 'transparent',
    soft: colors.primarySoft,
    filled: colors.primary,
    surface: colors.surface,
  };
  const fg: ColorToken = color ?? (variant === 'filled' ? 'onPrimary' : variant === 'soft' ? 'onPrimarySoft' : 'text');
  const slop = Math.max(0, (MIN_TOUCH - size) / 2);
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={badge ? `${label}, ${badge} ${badge === 1 ? 'item' : 'items'}` : label}
      accessibilityState={{ disabled: !!disabled, selected }}
      hitSlop={slop}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg[variant], opacity: disabled ? 0.45 : 1 },
        variant === 'surface' ? theme.shadow('sm') : null,
        style,
      ]}
    >
      <Icon {...icon} size={iconSize ?? Math.round(size * 0.55)} color={fg} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
          <Text variant="caption" weight={700} color="textInverse" style={styles.badgeText} tabular>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
