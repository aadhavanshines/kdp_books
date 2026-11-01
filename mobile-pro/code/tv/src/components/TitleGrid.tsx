/**
 * A vertical grid of landscape cards (search results, My list). It scrolls
 * the minimum needed to keep the focused card's row in view.
 */
import { useRef } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle, type ScrollViewInstance } from 'react-native';

import type { Title } from '../data/types';
import { FocusGroup } from '../focus/FocusGroup';
import { revealOffset } from '../focus/scroll';
import { s } from '../theme/scale';
import { LandscapeCard } from './Cards';
import { GAP } from './layout';

export interface TitleGridProps {
  id: string;
  titles: readonly Title[];
  columns: number;
  cardWidth: number;
  /** Visible height of the grid (canvas units). */
  height: number;
  onPress: (t: Title) => void;
  /** Take the screen's initial focus on the first card. */
  autoFocusFirst?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TitleGrid({ id, titles, columns, cardWidth, height, onPress, autoFocusFirst, style }: TitleGridProps) {
  const scroller = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);
  const rowHeight = Math.round((cardWidth * 9) / 16) + 48 + GAP;
  const bleed = 28;

  const onFocusIndex = (i: number) => {
    const row = Math.floor(i / columns);
    const next = revealOffset(offset.current, bleed + row * rowHeight, rowHeight, height, bleed);
    offset.current = next;
    scroller.current?.scrollTo({ y: s(next), animated: true });
  };

  return (
    <FocusGroup id={id} style={[{ height: s(height) }, style]}>
      <ScrollView ref={scroller} scrollEnabled={false} showsVerticalScrollIndicator={false}>
        <View style={[styles.grid, { padding: s(bleed), gap: s(GAP), width: s(columns * cardWidth + (columns - 1) * GAP + bleed * 2) }]}>
          {titles.map((t, i) => (
            <LandscapeCard
              key={t.id}
              title={t}
              width={cardWidth}
              focusKey={`${id}:${t.id}`}
              autoFocus={autoFocusFirst && i === 0}
              onFocus={() => onFocusIndex(i)}
              onPress={() => onPress(t)}
            />
          ))}
        </View>
      </ScrollView>
    </FocusGroup>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
