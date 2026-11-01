import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../tokens/scale';

export interface CarouselProps<T> {
  data: readonly T[];
  renderItem: (item: T, index: number) => ReactElement;
  keyExtractor: (item: T, index: number) => string;
  /** Slide width as a fraction of the carousel width (< 1 lets the next slide peek). */
  itemWidthRatio?: number;
  /** Space between slides and at the edges. */
  gap?: number;
  /** Auto-advance every N ms; 0 to turn off. Paused while touched and under reduce motion. */
  autoPlayMs?: number;
  showDots?: boolean;
  onIndexChange?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Which slide is showing for a scroll offset. */
export function slideIndexForOffset(offset: number, interval: number, count: number): number {
  if (interval <= 0 || count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(offset / interval)));
}

/** A horizontal, snapping carousel with page dots. */
export function Carousel<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidthRatio = 0.88,
  gap = 12,
  autoPlayMs = 0,
  showDots = true,
  onIndexChange,
  style,
  testID,
}: CarouselProps<T>) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const scroller = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [touching, setTouching] = useState(false);
  const itemWidth = Math.round(width * itemWidthRatio);
  const interval = itemWidth + gap;
  const count = data.length;

  useEffect(() => {
    if (!autoPlayMs || reduceMotion || touching || count < 2 || interval <= 0) return;
    const timer = setInterval(() => {
      const next = (index + 1) % count;
      scroller.current?.scrollTo({ x: next * interval, animated: true });
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [autoPlayMs, reduceMotion, touching, count, interval, index]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = slideIndexForOffset(e.nativeEvent.contentOffset.x, interval, count);
    if (next !== index) {
      setIndex(next);
      onIndexChange?.(next);
    }
  };

  return (
    <View style={style} testID={testID} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scroller}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={interval > 0 ? interval : undefined}
        snapToAlignment="start"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={32}
        onTouchStart={() => setTouching(true)}
        onTouchEnd={() => setTouching(false)}
        contentContainerStyle={{ paddingHorizontal: gap, gap }}
      >
        {width > 0
          ? data.map((item, i) => (
              <View key={keyExtractor(item, i)} style={{ width: itemWidth }}>
                {renderItem(item, i)}
              </View>
            ))
          : null}
      </ScrollView>
      {showDots && count > 1 ? (
        <View
          style={styles.dots}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Slide ${index + 1} of ${count}`}
        >
          {data.map((item, i) => (
            <View
              key={keyExtractor(item, i)}
              style={[
                styles.dot,
                i === index ? { width: 18, backgroundColor: colors.primary } : { backgroundColor: colors.border },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: radii.pill },
});
