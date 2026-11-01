import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { MIN_TOUCH, radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type ColorToken } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the title. */
  icon?: IconSpec;
  /** Icon after the title. */
  iconRight?: IconSpec;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** A secondary line on the right of a large button, e.g. a total. */
  trailingText?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const heights: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };
const paddings: Record<ButtonSize, number> = { sm: 14, md: 18, lg: 22 };
const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  trailingText,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: ColorToken; border?: string }> = {
    primary: { bg: colors.primary, fg: 'onPrimary' },
    accent: { bg: colors.accent, fg: 'onAccent' },
    secondary: { bg: colors.surface, fg: 'primary', border: colors.primary },
    ghost: { bg: 'transparent', fg: 'primary' },
  };
  const p = palette[variant];
  const height = heights[size];
  // Small buttons keep a 44pt touch target through hitSlop.
  const slop = Math.max(0, (MIN_TOUCH - height) / 2);

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (trailingText ? `${title}, ${trailingText}` : title)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      hitSlop={slop ? { top: slop, bottom: slop } : undefined}
      style={[
        styles.base,
        {
          minHeight: height,
          paddingHorizontal: paddings[size],
          backgroundColor: p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1.5 : 0,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        trailingText ? styles.split : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[p.fg]} accessibilityLabel="Loading" />
      ) : (
        <>
          <View style={styles.row}>
            {icon ? <Icon {...icon} size={iconSizes[size]} color={p.fg} /> : null}
            <Text
              variant={size === 'sm' ? 'subhead' : 'headline'}
              weight={size === 'lg' ? 700 : 600}
              color={p.fg}
              numberOfLines={1}
            >
              {title}
            </Text>
            {iconRight ? <Icon {...iconRight} size={iconSizes[size]} color={p.fg} /> : null}
          </View>
          {trailingText ? (
            <Text variant="headline" weight={700} color={p.fg} tabular>
              {trailingText}
            </Text>
          ) : null}
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  split: { justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
