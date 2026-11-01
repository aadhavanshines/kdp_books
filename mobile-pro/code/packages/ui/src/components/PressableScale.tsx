import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { motion } from '../tokens/scale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Scale while pressed. Defaults to 0.97 (DESIGN.md). */
  scaleTo?: number;
}

/**
 * The base touchable: a Pressable that springs to 0.97 while pressed. The
 * spring follows the system reduce-motion setting (Reanimated default).
 * Defaults `accessibilityRole` to "button".
 */
export function PressableScale({
  scaleTo = motion.pressScale,
  style,
  onPressIn,
  onPressOut,
  disabled,
  accessibilityRole = 'button',
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) scale.set(withSpring(scaleTo, motion.spring.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.spring.press));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
