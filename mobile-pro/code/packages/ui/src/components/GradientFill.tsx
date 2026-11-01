import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

const vectors: Record<GradientDirection, { x1: string; y1: string; x2: string; y2: string }> = {
  vertical: { x1: '0', y1: '0', x2: '0', y2: '1' },
  horizontal: { x1: '0', y1: '0', x2: '1', y2: '0' },
  diagonal: { x1: '0', y1: '0', x2: '1', y2: '1' },
};

export interface GradientFillProps {
  colors: readonly string[];
  direction?: GradientDirection;
  /** Per-stop opacity, same length as `colors`. */
  opacities?: readonly number[];
  style?: StyleProp<ViewStyle>;
}

/**
 * A linear gradient drawn with react-native-svg, so it renders the same on
 * Android, iOS and web without a native gradient module. Fills its parent
 * by default; the parent clips it with `overflow: 'hidden'` and a radius.
 */
export function GradientFill({ colors, direction = 'diagonal', opacities, style }: GradientFillProps) {
  // SVG ids are document-global on web, so each gradient needs its own.
  const id = `g${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const stops = colors.length === 1 ? [colors[0]!, colors[0]!] : colors;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} {...vectors[direction]}>
            {stops.map((color, i) => (
              <Stop
                key={`${color}-${i}`}
                offset={stops.length === 1 ? 0 : i / (stops.length - 1)}
                stopColor={color}
                stopOpacity={opacities?.[i] ?? 1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
