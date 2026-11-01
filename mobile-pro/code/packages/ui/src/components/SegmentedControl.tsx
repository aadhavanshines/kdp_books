import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii } from '../tokens/scale';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SegmentOption<K extends string = string> {
  key: K;
  label: string;
}

export interface SegmentedControlProps<K extends string> {
  options: readonly SegmentOption<K>[];
  value: K;
  onChange: (key: K) => void;
  style?: StyleProp<ViewStyle>;
}

const PAD = 3;

/** Equal-width segments with a sliding thumb ("Delivery | Pickup"). */
export function SegmentedControl<K extends string>({ options, value, onChange, style }: SegmentedControlProps<K>) {
  const theme = useTheme();
  const { colors } = theme;
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const segment = options.length > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.set(withSpring(index * segment, motion.spring.press));
  }, [index, segment, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: colors.surfaceMuted }, style]}
    >
      {segment > 0 ? (
        <Animated.View
          style={[styles.thumb, { width: segment, backgroundColor: colors.surface }, theme.shadow('sm'), thumb]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <PressableScale
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            scaleTo={0.98}
            style={styles.segment}
          >
            <Text variant="subhead" weight={selected ? 700 : 500} color={selected ? 'text' : 'textSecondary'} numberOfLines={1}>
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radii.md, padding: PAD, minHeight: 44 },
  thumb: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: radii.md - 2 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 38 },
});
