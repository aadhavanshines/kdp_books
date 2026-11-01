import { useId, useMemo, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { artTones, photoColors, type ArtToneName } from '../tokens/colors';
import { humanize } from '../utils/format';
import { photoBackdrop, photoFilters, type PhotoFilterName } from '../utils/photo';
import type { ArtLayer } from './Art';
import { Art } from './Art';

export interface PhotoSceneProps {
  scene: { tone: ArtToneName; layers: readonly ArtLayer[] };
  /** Seeds the backdrop (glow, bokeh, horizon, sparkles). Use the post or story id. */
  seed: string;
  filter?: PhotoFilterName;
  /** width / height. Defaults to 1 (square); stories use 9 / 16. */
  aspectRatio?: number;
  radius?: number;
  /** Fewer details for small grid tiles. */
  compact?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** A four-point sparkle, centered on 0,0 with radius 1. */
const SPARKLE = 'M0 -1 C0.12 -0.12 0.12 -0.12 1 0 C0.12 0.12 0.12 0.12 0 1 C-0.12 0.12 -0.12 0.12 -1 0 C-0.12 -0.12 -0.12 -0.12 0 -1 Z';

/**
 * A Lumo "photo": the scene's hero and accents over a seeded backdrop of
 * layered gradients, a soft light, bokeh, a horizon and sparkles, finished
 * with the photo filter. Photos keep their colors in dark mode.
 */
export function PhotoScene({ scene, seed, filter = 'normal', aspectRatio = 1, radius = 0, compact, accessibilityLabel, style, children }: PhotoSceneProps) {
  const uid = `p${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const width = size.width;
  // Stretched scenes (a story filling the screen) use their real height.
  const height = size.height > 0 ? size.height : width / aspectRatio;
  const backdrop = useMemo(() => photoBackdrop(seed, scene.tone), [seed, scene.tone]);
  const stops = artTones[scene.tone].light;
  const spec = photoFilters[filter];
  const hero = scene.layers[0];
  const label = accessibilityLabel ?? `Photo: ${scene.layers.map((l) => humanize(l.art)).join(', ')}`;
  const onLayout = (e: LayoutChangeEvent) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
  const cssFilter = spec.filter && Platform.OS !== 'ios' ? spec.filter : undefined;

  const W = width;
  const H = height;
  const washColors = spec.wash ? photoColors[spec.wash.colors] : null;

  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.scene, { aspectRatio, borderRadius: radius, backgroundColor: stops[0] }, style]}
    >
      {width > 0 ? (
        <View style={[StyleSheet.absoluteFill, cssFilter ? ({ filter: cssFilter } as ViewStyle) : null]}>
          <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={`${uid}base`} x1={backdrop.angle.x1} y1={backdrop.angle.y1} x2={backdrop.angle.x2} y2={backdrop.angle.y2}>
                {stops.map((c, i) => (
                  <Stop key={`${c}-${i}`} offset={i / Math.max(1, stops.length - 1)} stopColor={c} />
                ))}
              </LinearGradient>
              <RadialGradient id={`${uid}glow`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={photoColors.light} stopOpacity={backdrop.glow.opacity} />
                <Stop offset="1" stopColor={photoColors.light} stopOpacity={0} />
              </RadialGradient>
              <LinearGradient id={`${uid}ground`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={photoColors.light} stopOpacity={0.28} />
                <Stop offset="0.12" stopColor={stops[stops.length - 1]} stopOpacity={0.35} />
                <Stop offset="1" stopColor={photoColors.shade} stopOpacity={0.14} />
              </LinearGradient>
              <RadialGradient id={`${uid}shadow`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={photoColors.shade} stopOpacity={0.28} />
                <Stop offset="1" stopColor={photoColors.shade} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={`${uid}vig`} cx="50%" cy="48%" r="72%">
                <Stop offset="0.6" stopColor={photoColors.shade} stopOpacity={0} />
                <Stop offset="1" stopColor={photoColors.shade} stopOpacity={backdrop.vignette} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={W} height={H} fill={`url(#${uid}base)`} />
            <Ellipse
              cx={backdrop.glow.x * W}
              cy={backdrop.glow.y * H}
              rx={backdrop.glow.r * W}
              ry={backdrop.glow.r * W}
              fill={`url(#${uid}glow)`}
            />
            {backdrop.orbs.slice(0, compact ? 2 : undefined).map((o, i) => (
              <Circle key={`o${i}`} cx={o.x * W} cy={o.y * H} r={o.r * W} fill={photoColors.light} opacity={o.opacity} />
            ))}
            {backdrop.horizon !== null ? (
              <Rect x={0} y={backdrop.horizon * H} width={W} height={H - backdrop.horizon * H} fill={`url(#${uid}ground)`} />
            ) : null}
            {!compact
              ? backdrop.sparkles.map((s, i) => (
                  <G key={`s${i}`} transform={`translate(${s.x * W} ${s.y * H}) rotate(${s.rotate}) scale(${s.size * W})`}>
                    <Path d={SPARKLE} fill={photoColors.light} opacity={0.85} />
                  </G>
                ))
              : null}
            {hero ? (
              <Ellipse
                cx={hero.x * W}
                cy={Math.min(H - 4, hero.y * H + hero.size * W * 0.44)}
                rx={hero.size * W * 0.4}
                ry={hero.size * W * 0.075}
                fill={`url(#${uid}shadow)`}
              />
            ) : null}
          </Svg>
          {scene.layers.map((layer, i) => {
            const px = layer.size * W;
            return (
              <View
                key={`${layer.art}-${i}`}
                style={{
                  position: 'absolute',
                  width: px,
                  height: px,
                  left: layer.x * W - px / 2,
                  top: layer.y * H - px / 2,
                  opacity: layer.opacity ?? 1,
                  transform: [{ rotate: `${layer.rotate ?? 0}deg` }, { scaleX: layer.flip ? -1 : 1 }],
                }}
              >
                <Art name={layer.art} fill decorative />
              </View>
            );
          })}
          <Svg width={W} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Rect x={0} y={0} width={W} height={H} fill={`url(#${uid}vig)`} />
          </Svg>
          {spec.wash && washColors ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { opacity: spec.wash.opacity, mixBlendMode: spec.wash.blend },
                typeof washColors === 'string' ? { backgroundColor: washColors } : null,
              ]}
            >
              {typeof washColors !== 'string' ? (
                <Svg width={W} height={H}>
                  <Defs>
                    <LinearGradient id={`${uid}wash`} x1="0" y1="0" x2="0" y2="1">
                      {washColors.map((c, i) => (
                        <Stop key={c} offset={i / (washColors.length - 1)} stopColor={c} />
                      ))}
                    </LinearGradient>
                  </Defs>
                  <Rect x={0} y={0} width={W} height={H} fill={`url(#${uid}wash)`} />
                </Svg>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { width: '100%', overflow: 'hidden', isolation: 'isolate' },
});
