/**
 * Posters, backdrops, cards and episode stills, composed from the 3D art on
 * a rich gradient: a tone gradient, a soft light behind the hero object, the
 * title's main art large and its accent art scattered around it.
 */
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { ArtName } from '../art/registry';
import { tones, type ToneName } from '../theme/tokens';
import { Art } from './Art';
import { Glow, GradientFill } from './GradientFill';

export type KeyArtVariant = 'backdrop' | 'landscape' | 'poster' | 'square';

interface Layer {
  art: ArtName;
  /** Centre and size as fractions of width (x, size) and height (y). */
  x: number;
  y: number;
  size: number;
  rotate?: number;
  opacity?: number;
}

/** Layer layout per variant. `shift` varies the composition (episode stills). Exported for tests. */
export function layersFor(variant: KeyArtVariant, art: ArtName, accents: readonly ArtName[], shift = 0): Layer[] {
  const a0 = accents[0];
  const a1 = accents[1] ?? accents[0];
  const flip = shift % 2 === 1;
  const mx = (x: number) => (flip ? 1 - x : x);
  const layers: (Layer | null)[] =
    variant === 'backdrop'
      ? [
          a1 ? { art: a1, x: mx(0.6), y: 0.7, size: 0.09, rotate: -12, opacity: 0.7 } : null,
          { art, x: mx(0.77), y: 0.42, size: 0.3 },
          a0 ? { art: a0, x: mx(0.93), y: 0.18, size: 0.12, rotate: 14 } : null,
        ]
      : variant === 'poster'
        ? [
            a1 ? { art: a1, x: 0.18, y: 0.27, size: 0.26, rotate: -14, opacity: 0.85 } : null,
            { art, x: 0.52, y: 0.45, size: 0.78 },
            a0 ? { art: a0, x: 0.82, y: 0.62, size: 0.32, rotate: 12 } : null,
          ]
        : variant === 'square'
          ? [{ art, x: 0.5, y: 0.5, size: 0.62 }]
          : [
              a1 ? { art: a1, x: mx(0.4 + (shift % 3) * 0.04), y: 0.24, size: 0.15, rotate: -14, opacity: 0.85 } : null,
              { art, x: mx(0.7 - (shift % 3) * 0.03), y: 0.5 + (shift % 2) * 0.04, size: 0.44 + (shift % 3) * 0.04 },
              a0 ? { art: a0, x: mx(0.92), y: 0.74, size: 0.2, rotate: 12 } : null,
            ];
  return layers.filter((l): l is Layer => l !== null);
}

export interface KeyArtProps {
  tone: ToneName;
  art: ArtName;
  accents?: readonly ArtName[];
  variant: KeyArtVariant;
  width: number;
  height: number;
  shift?: number;
  style?: StyleProp<ViewStyle>;
}

export function KeyArt({ tone, art, accents = [], variant, width, height, shift = 0, style }: KeyArtProps) {
  const layers = layersFor(variant, art, accents, shift);
  const main = layers.find((l) => l.art === art && !l.rotate) ?? layers[0]!;
  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <GradientFill colors={tones[tone]} direction="diagonal" />
      <Glow color="#FFFFFF" cx={main.x} cy={main.y} r={variant === 'backdrop' ? 0.34 : 0.48} opacity={variant === 'backdrop' ? 0.22 : 0.26} />
      {layers.map((l, i) => {
        const px = l.size * width;
        return (
          <View
            key={`${l.art}-${i}`}
            style={[
              styles.layer,
              {
                width: px,
                height: px,
                left: l.x * width - px / 2,
                top: l.y * height - px / 2,
                opacity: l.opacity ?? 1,
                transform: [{ rotate: `${l.rotate ?? 0}deg` }],
              },
            ]}
          >
            <Art name={l.art} fill decorative />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
