import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { motion, radii } from '../tokens/scale';
import { Icon, type IconSpec } from './Icon';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface TabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: IconSpec;
  /** Count shown after the label ("Reviews 128"). */
  count?: number;
}

export interface TabsProps<K extends string> {
  items: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
  /** Scroll horizontally instead of sharing the width equally. */
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

interface Box {
  x: number;
  width: number;
}

/** Text tabs with a sliding underline indicator. */
export function Tabs<K extends string>({ items, value, onChange, scrollable = false, style }: TabsProps<K>) {
  const { colors } = useTheme();
  const [boxes, setBoxes] = useState<Partial<Record<K, Box>>>({});
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const active = boxes[value];

  useEffect(() => {
    if (!active) return;
    // First placement jumps; later changes slide.
    if (w.get() === 0) {
      x.set(active.x);
      w.set(active.width);
    } else {
      x.set(withSpring(active.x, motion.spring.press));
      w.set(withTiming(active.width, { duration: motion.duration.fast }));
    }
  }, [active, x, w]);

  const indicator = useAnimatedStyle(() => ({ width: w.value, transform: [{ translateX: x.value }] }));

  const onTabLayout = (key: K) => (e: LayoutChangeEvent) => {
    const { x: lx, width } = e.nativeEvent.layout;
    setBoxes((prev) => (prev[key]?.x === lx && prev[key]?.width === width ? prev : { ...prev, [key]: { x: lx, width } }));
  };

  const row = (
    <View style={[styles.row, !scrollable && styles.equal]} accessibilityRole="tablist">
      {items.map((item) => {
        const selected = item.key === value;
        return (
          <PressableScale
            key={item.key}
            onLayout={onTabLayout(item.key)}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityLabel={item.count != null ? `${item.label}, ${item.count}` : item.label}
            accessibilityState={{ selected }}
            scaleTo={0.98}
            style={[styles.tab, !scrollable && styles.flex]}
          >
            {item.icon ? <Icon {...item.icon} size={18} color={selected ? 'primary' : 'textMuted'} /> : null}
            <Text variant="subhead" weight={selected ? 700 : 500} color={selected ? 'text' : 'textMuted'} numberOfLines={1}>
              {item.label}
            </Text>
            {item.count != null ? (
              <Text variant="caption" color="textMuted" tabular>
                {item.count}
              </Text>
            ) : null}
          </PressableScale>
        );
      })}
      <Animated.View style={[styles.indicator, { backgroundColor: colors.primary }, indicator]} />
    </View>
  );

  return (
    <View style={[{ borderBottomColor: colors.divider }, styles.container, style]}>
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {row}
        </ScrollView>
      ) : (
        row
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row' },
  equal: { width: '100%' },
  flex: { flex: 1 },
  tab: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: { position: 'absolute', left: 0, bottom: 0, height: 3, borderRadius: radii.pill },
});
