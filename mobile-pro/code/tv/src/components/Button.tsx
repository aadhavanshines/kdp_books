import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { s } from '../theme/scale';
import { colors, motion, radii } from '../theme/tokens';
import { Focusable, type FocusableProps } from './Focusable';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface ButtonProps extends Omit<FocusableProps, 'children' | 'accessibilityLabel'> {
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
  /** Hide the label (round icon button); the label still goes to screen readers. */
  iconOnly?: boolean;
  size?: 'md' | 'lg';
  /** A thin progress line under the label (Resume). */
  progress?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * TV button: glass when resting, solid white with dark text when focused
 * (the clearest focus state from across a room), plus a slight grow and glow.
 */
export function Button({ label, icon, variant = 'secondary', iconOnly, size = 'md', progress, accessibilityLabel, style, ...rest }: ButtonProps) {
  const height = s(size === 'lg' ? 84 : 72);
  return (
    <Focusable
      {...rest}
      accessibilityLabel={accessibilityLabel ?? label}
      indicator="glow"
      focusScale={motion.buttonFocusScale}
      radius={height / 2}
      style={[{ height, minWidth: iconOnly ? height : undefined }, style]}
    >
      {({ focused }) => {
        const fg = focused ? 'onFocusFill' : variant === 'primary' ? 'onPrimary' : 'text';
        return (
          <View
            style={[
              styles.body,
              {
                height,
                borderRadius: height / 2,
                paddingHorizontal: iconOnly ? 0 : s(size === 'lg' ? 40 : 32),
                width: iconOnly ? height : undefined,
                backgroundColor: focused ? colors.focusFill : variant === 'primary' ? colors.primary : colors.glass,
                borderColor: focused ? colors.focusFill : variant === 'primary' ? colors.primary : colors.hairline,
              },
            ]}
          >
            {icon ? <Icon name={icon} size={size === 'lg' ? 40 : 34} color={fg} /> : null}
            {iconOnly ? null : (
              <Text variant="label" color={fg} style={icon ? { marginLeft: s(12) } : null} numberOfLines={1}>
                {label}
              </Text>
            )}
            {progress !== undefined && !iconOnly ? (
              <View style={[styles.track, { backgroundColor: focused ? colors.track : colors.track }]}>
                <View style={[styles.fillBar, { width: `${Math.round(progress * 100)}%`, backgroundColor: focused ? colors.primary : colors.accent }]} />
              </View>
            ) : null}
          </View>
        );
      }}
    </Focusable>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
  track: { position: 'absolute', left: '22%', right: '22%', bottom: s(12), height: s(4), borderRadius: radii.pill },
  fillBar: { height: '100%', borderRadius: radii.pill },
});
