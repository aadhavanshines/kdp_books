import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { GradientFill } from './GradientFill';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  /** A circle of `height` (avatars). */
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A loading placeholder with a moving shimmer. Static under reduce motion.
 * Skeletons are hidden from screen readers; the screen announces "Loading" once.
 */
export function Skeleton({ width = '100%', height = 16, radius = radii.sm, circle, style }: SkeletonProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const [boxWidth, setBoxWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || boxWidth === 0) return;
    progress.set(0);
    progress.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, false));
    return () => cancelAnimation(progress);
  }, [reduceMotion, boxWidth, progress]);

  const shimmer = useAnimatedStyle(() => ({
    transform: [{ translateX: -boxWidth + progress.value * boxWidth * 2 }],
  }));

  const size: ViewStyle = circle
    ? { width: height, height, borderRadius: typeof height === 'number' ? height / 2 : radii.pill }
    : { width, height, borderRadius: radius };

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
      style={[styles.base, size, { backgroundColor: colors.skeleton }, style]}
    >
      {!reduceMotion && boxWidth > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, shimmer]}>
          <GradientFill
            direction="horizontal"
            colors={[colors.skeletonHighlight, colors.skeletonHighlight, colors.skeletonHighlight]}
            opacities={[0, 0.9, 0]}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
