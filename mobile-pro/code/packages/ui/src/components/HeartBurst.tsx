import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { motion } from '../tokens/scale';
import { Icon } from './Icon';

export interface HeartBurstProps {
  /** Increment to play the burst (e.g. on every double-tap). 0 renders nothing. */
  trigger: number;
  size?: number;
}

const PARTICLES = 7;

function Particle({ progress, index, size }: { progress: SharedValue<number>; index: number; size: number }) {
  const angle = (index / PARTICLES) * Math.PI * 2 - Math.PI / 2;
  const distance = size * 0.9;
  const style = useAnimatedStyle(() => ({
    opacity: progress.value > 0 && progress.value < 1 ? 1 - progress.value : 0,
    transform: [
      { translateX: Math.cos(angle) * distance * progress.value },
      { translateY: Math.sin(angle) * distance * progress.value },
      { scale: 0.6 + progress.value * 0.4 },
    ],
  }));
  return (
    <Animated.View style={[styles.particle, style]}>
      <Icon name="heart" size={size * 0.2} color="like" />
    </Animated.View>
  );
}

/**
 * The double-tap like: a big heart pops over a photo while small hearts fly
 * out. Under reduce motion only the big heart fades in and out.
 */
export function HeartBurst({ trigger, size = 96 }: HeartBurstProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const particles = useSharedValue(0);

  useEffect(() => {
    if (trigger <= 0) return;
    if (reduceMotion) {
      scale.set(1);
      opacity.set(withSequence(withTiming(1, { duration: 120 }), withDelay(450, withTiming(0, { duration: 200 }))));
      return;
    }
    scale.set(withSequence(withTiming(0, { duration: 0 }), withSpring(1, motion.spring.pop), withDelay(260, withTiming(0.2, { duration: 180 }))));
    opacity.set(withSequence(withTiming(1, { duration: 80 }), withDelay(520, withTiming(0, { duration: 180 }))));
    particles.set(withSequence(withTiming(0, { duration: 0 }), withDelay(60, withTiming(1, { duration: 620 }))));
  }, [trigger, reduceMotion, scale, opacity, particles]);

  const heart = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View pointerEvents="none" style={styles.overlay} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {!reduceMotion
        ? Array.from({ length: PARTICLES }, (_, i) => <Particle key={i} index={i} progress={particles} size={size} />)
        : null}
      <Animated.View style={heart}>
        <Icon name="heart" size={size} color="textInverse" style={styles.shadow} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
  shadow: { textShadowColor: 'rgba(0, 0, 0, 0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
});
