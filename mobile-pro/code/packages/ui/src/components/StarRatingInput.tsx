import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { MIN_TOUCH } from '../tokens/scale';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export const STAR_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Loved it'] as const;

export interface StarRatingInputProps {
  /** 0 (none) to 5. */
  value: number;
  onChange: (stars: number) => void;
  size?: number;
  /** Show the word for the current value ("Loved it") under the stars. */
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Five tappable stars. */
export function StarRatingInput({ value, onChange, size = 40, showLabel = true, style }: StarRatingInputProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={styles.row}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Rating"
        accessibilityValue={{ min: 0, max: 5, now: value, text: value ? `${value} of 5, ${STAR_LABELS[value - 1]}` : 'Not rated' }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') onChange(Math.min(5, value + 1));
          if (e.nativeEvent.actionName === 'decrement') onChange(Math.max(1, value - 1));
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const on = n <= value;
          return (
            <PressableScale
              key={n}
              onPress={() => onChange(n)}
              scaleTo={0.85}
              accessibilityLabel={`${n} ${n === 1 ? 'star' : 'stars'}`}
              style={[styles.star, { minWidth: Math.max(size, MIN_TOUCH), minHeight: Math.max(size, MIN_TOUCH) }]}
            >
              {on ? (
                <Animated.View key={`on${n}`} entering={ZoomIn.springify().damping(12)}>
                  <Icon name="star" size={size} color="star" />
                </Animated.View>
              ) : (
                <Icon name="star-outline" size={size} color="border" />
              )}
            </PressableScale>
          );
        })}
      </View>
      {showLabel ? (
        <Text variant="subhead" weight={600} color={value ? 'text' : 'textMuted'} align="center">
          {value ? STAR_LABELS[value - 1] : 'Tap a star to rate'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', gap: 4 },
  star: { alignItems: 'center', justifyContent: 'center' },
});
