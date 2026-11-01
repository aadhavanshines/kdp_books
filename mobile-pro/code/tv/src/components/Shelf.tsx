/**
 * A horizontal row of cards. The row is a focus group (it remembers its last
 * focused card) and scrolls itself so the focused card sits at the row's
 * focus line (scroll.ts), the way TV rows glide under a steady focus. Its
 * viewport starts at the collapsed rail's edge, so cards scrolled off to the
 * left are clipped there instead of showing through the rail.
 */
import { useCallback, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle, type ScrollViewInstance } from 'react-native';

import { FocusGroup } from '../focus/FocusGroup';
import { clippedRow, rowOffsetForIndex } from '../focus/scroll';
import { CANVAS_WIDTH, s } from '../theme/scale';
import { spacing } from '../theme/tokens';
import { CONTENT_LEFT, GAP, RAIL_COLLAPSED } from './layout';
import { Text } from './Text';

export interface ShelfProps<T> {
  id: string;
  title?: string;
  data: readonly T[];
  keyOf: (item: T) => string;
  /** Card width and the height of the card area (canvas units). */
  itemWidth: number;
  height: number;
  gap?: number;
  /** Where the first card (and the focus line) sits, from the screen's left edge. */
  inset?: number;
  renderItem: (item: T, index: number, onFocus: () => void) => ReactNode;
  onFocusRow?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Extra headroom above/below cards for the focus scale and glow. */
  bleed?: number;
  /** Where the row's viewport starts (cards clip there): the rail's edge by default, 0 on screens without a rail. */
  clipLeft?: number;
}

export function Shelf<T>({ id, title, data, keyOf, itemWidth, height, gap = GAP, inset = CONTENT_LEFT, renderItem, onFocusRow, style, bleed = 28, clipLeft = RAIL_COLLAPSED }: ShelfProps<T>) {
  const [scroller, setScroller] = useState<ScrollViewInstance | null>(null);
  // Scroll math stays in screen units: the clipped viewport plus its left offset is the full canvas.
  const viewportWidth = CANVAS_WIDTH;
  const clip = clippedRow(inset, clipLeft);

  const focusIndex = useCallback(
    (index: number) => {
      const x = rowOffsetForIndex({ itemWidth, gap, count: data.length, viewportWidth, inset }, index);
      scroller?.scrollTo({ x: s(x), animated: true });
      onFocusRow?.();
    },
    [itemWidth, gap, data.length, viewportWidth, inset, scroller, onFocusRow],
  );

  return (
    <View style={style}>
      {title ? (
        <Text variant="headline" style={{ marginLeft: s(inset), marginBottom: s(spacing.xxs) }} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <FocusGroup id={id}>
        <ScrollView
          ref={setScroller}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ height: s(height + bleed * 2), marginLeft: s(clip.left) }}
          contentContainerStyle={[
            styles.content,
            { paddingLeft: s(clip.paddingStart), paddingRight: s(inset), paddingVertical: s(bleed), gap: s(gap) },
          ]}
        >
          {data.map((item, i) => (
            <View key={keyOf(item)}>{renderItem(item, i, () => focusIndex(i))}</View>
          ))}
        </ScrollView>
      </FocusGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'flex-start' },
});
