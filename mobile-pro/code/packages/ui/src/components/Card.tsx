import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { radii, spacing, type RadiusToken, type ShadowToken, type SpacingToken } from '../tokens/scale';
import { PressableScale } from './PressableScale';

export interface CardProps {
  children?: ReactNode;
  /** elevated: shadow; outlined: hairline border; flat: neither. */
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: SpacingToken | 0;
  radius?: RadiusToken;
  shadow?: ShadowToken;
  onPress?: () => void;
  /** Required with `onPress`: what the card opens. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** A white surface on the gray background, with a soft shadow. */
export function Card({
  children,
  variant = 'elevated',
  padding = 'lg',
  radius = 'lg',
  shadow = 'md',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
  testID,
}: CardProps) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: radii[radius],
    padding: padding === 0 ? 0 : spacing[padding],
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: theme.colors.border,
  };
  const elevation = variant === 'elevated' ? theme.shadow(shadow) : null;
  if (onPress) {
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        scaleTo={0.98}
        style={[base, elevation, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return (
    <View testID={testID} style={[base, elevation, style]}>
      {children}
    </View>
  );
}
