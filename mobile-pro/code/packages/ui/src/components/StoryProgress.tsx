import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { photoColors } from '../tokens/colors';

/** How full segment `segment` is while story `current` is `progress` (0 to 1) through. */
export function segmentFill(segment: number, current: number, progress: number): number {
  'worklet';
  if (segment < current) return 1;
  if (segment > current) return 0;
  return Math.min(1, Math.max(0, progress));
}

export interface StoryProgressProps {
  count: number;
  /** The story on screen. */
  index: number;
  /** Progress through the current story, 0 to 1, driven by the viewer's timer. */
  progress: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
}

function Segment({ segment, index, progress }: { segment: number; index: number; progress: SharedValue<number> }) {
  const fill = useAnimatedStyle(() => ({ width: `${segmentFill(segment, index, progress.value) * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

/** The thin bars across the top of a story: done, playing and upcoming. */
export function StoryProgress({ count, index, progress, style }: StoryProgressProps) {
  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Story ${index + 1} of ${count}`}
      accessibilityValue={{ min: 1, max: count, now: index + 1 }}
    >
      {Array.from({ length: count }, (_, i) => (
        <Segment key={i} segment={i} index={index} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  track: { flex: 1, height: 2.5, borderRadius: 2, overflow: 'hidden', backgroundColor: photoColors.track },
  fill: { height: '100%', borderRadius: 2, backgroundColor: photoColors.light },
});
