import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal' | 'up' | 'left';

const vectors: Record<GradientDirection, { x1: string; y1: string; x2: string; y2: string }> = {
  vertical: { x1: '0', y1: '0', x2: '0', y2: '1' },
  up: { x1: '0', y1: '1', x2: '0', y2: '0' },
  horizontal: { x1: '0', y1: '0', x2: '1', y2: '0' },
  left: { x1: '1', y1: '0', x2: '0', y2: '0' },
  diagonal: { x1: '0', y1: '0', x2: '1', y2: '1' },
};

export interface GradientFillProps {
  colors: readonly string[];
  direction?: GradientDirection;
  /** Per-stop opacity, same length as `colors`. */
  opacities?: readonly number[];
  /** Per-stop offsets 0..1; evenly spaced by default. */
  offsets?: readonly number[];
  style?: StyleProp<ViewStyle>;
}

/**
 * A linear gradient drawn with react-native-svg (copied from @pro/ui), so it
 * renders the same on Android TV and web without a native gradient module.
 */
export function GradientFill({ colors, direction = 'diagonal', opacities, offsets, style }: GradientFillProps) {
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
                offset={offsets?.[i] ?? i / (stops.length - 1)}
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

/** A soft radial glow (light behind the art), centred at cx, cy (fractions). */
export function Glow({ color, cx = 0.5, cy = 0.5, r = 0.5, opacity = 0.6 }: { color: string; cx?: number; cy?: number; r?: number; opacity?: number }) {
  const id = `r${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={id} cx={String(cx)} cy={String(cy)} r={String(r)}>
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
