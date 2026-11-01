import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text, type ColorToken } from './Text';

export interface QuantityStepperProps {
  /** Controlled quantity. Leave undefined to let the stepper hold its own state. */
  value?: number;
  defaultValue?: number;
  onChange?: (quantity: number) => void;
  min?: number;
  max?: number;
  /** Called when + is pressed at `max` (e.g. to show "Only 5 left" toast). */
  onLimitReached?: (max: number) => void;
  /** Item name for screen readers: "Add Paneer tikka". */
  itemName?: string;
  /** Label on the empty state. */
  addLabel?: string;
  /** Small note under ADD, e.g. "customisable". */
  hint?: string;
  /** outline: white with brand border (Platter). filled: brand fill (Minutely). */
  variant?: 'outline' | 'filled';
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const dims = { sm: { w: 84, h: 34 }, md: { w: 100, h: 40 } };

/** ADD, then − 1 +. Works controlled (`value`) or uncontrolled (`defaultValue`). */
export function QuantityStepper({
  value,
  defaultValue = 0,
  onChange,
  min = 0,
  max = 20,
  onLimitReached,
  itemName,
  addLabel = 'ADD',
  hint,
  variant = 'outline',
  size = 'md',
  disabled = false,
  style,
}: QuantityStepperProps) {
  const { colors } = useTheme();
  const [inner, setInner] = useState(defaultValue);
  const quantity = value ?? inner;
  const d = dims[size];
  const filled = variant === 'filled';
  const fg: ColorToken = filled ? 'onPrimary' : 'primary';
  const what = itemName ? ` ${itemName}` : '';

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped === quantity) return;
    if (value === undefined) setInner(clamped);
    onChange?.(clamped);
  };
  const increment = () => {
    if (quantity >= max) {
      onLimitReached?.(max);
      return;
    }
    set(quantity + 1);
  };

  const shell = [
    styles.shell,
    {
      width: d.w,
      height: d.h,
      backgroundColor: filled ? colors.primary : colors.surface,
      borderColor: filled ? colors.primary : colors.primary,
      opacity: disabled ? 0.45 : 1,
    },
  ];

  if (quantity <= 0) {
    return (
      <View style={[styles.wrap, style]}>
        <PressableScale
          onPress={increment}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Add${what}`}
          accessibilityState={{ disabled }}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          style={shell}
        >
          <Text variant="headline" weight={800} color={fg}>
            {addLabel}
          </Text>
          <Text variant="caption" weight={800} color={fg} style={styles.plus}>
            +
          </Text>
        </PressableScale>
        {hint ? (
          <Text variant="caption" color="textMuted" style={styles.hint}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  }

  const atMax = quantity >= max;
  return (
    <View style={[styles.wrap, style]}>
      <Animated.View
        entering={ZoomIn.duration(160)}
        style={[shell, styles.stepper]}
        // One adjustable element for screen readers (swipe up/down to change);
        // the − and + buttons stay pressable for touch.
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Quantity${what}`}
        accessibilityValue={{ min, max, now: quantity, text: `${quantity}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') increment();
          if (e.nativeEvent.actionName === 'decrement') set(quantity - 1);
        }}
      >
        <Pressable
          onPress={() => set(quantity - 1)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={quantity - 1 <= min && min === 0 ? `Remove${what}` : `Remove one${what}`}
          hitSlop={{ top: 6, bottom: 6, left: 6 }}
          style={styles.side}
        >
          <Icon name="remove" size={18} color={fg} />
        </Pressable>
        <Animated.View key={quantity} entering={FadeIn.duration(120)}>
          <Text variant="headline" weight={800} color={fg} tabular>
            {quantity}
          </Text>
        </Animated.View>
        <Pressable
          onPress={increment}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Add one more${what}`}
          accessibilityState={{ disabled: disabled || atMax }}
          hitSlop={{ top: 6, bottom: 6, right: 6 }}
          style={[styles.side, atMax && styles.dim]}
        >
          <Icon name="add" size={18} color={fg} />
        </Pressable>
      </Animated.View>
      {hint ? (
        <Text variant="caption" color="textMuted" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  shell: {
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  stepper: { justifyContent: 'space-between' },
  side: { height: '100%', paddingHorizontal: 10, justifyContent: 'center' },
  plus: { position: 'absolute', top: 2, right: 6 },
  hint: { marginTop: 4, fontSize: 10, lineHeight: 12 },
  dim: { opacity: 0.4 },
});
