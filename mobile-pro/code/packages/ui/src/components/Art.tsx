import { useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageStyle,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { artSources, ART_NAMES, type ArtName } from '../art/registry';
import { useTheme } from '../theme/ThemeProvider';
import { ART_TONE_NAMES, type ArtToneName } from '../tokens/colors';
import { radii } from '../tokens/scale';
import { humanize } from '../utils/format';
import { GradientFill } from './GradientFill';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export { ART_NAMES, type ArtName };

const artNameSet: ReadonlySet<string> = new Set(ART_NAMES);
export function isArtName(name: string): name is ArtName {
  return artNameSet.has(name);
}

export interface ArtProps {
  name: ArtName;
  /** Square size in px. Ignored when `fill` is set. */
  size?: number;
  /** Fill the parent instead of a fixed size. */
  fill?: boolean;
  style?: StyleProp<ImageStyle>;
  /** Defaults to the humanized art name ("Red apple"). */
  accessibilityLabel?: string;
  /** Hide from screen readers when the surrounding element already says what it is. */
  decorative?: boolean;
}

/** One of the 3D illustrations in packages/ui/art, by name. */
export function Art({ name, size = 64, fill, style, accessibilityLabel, decorative }: ArtProps) {
  return (
    <Image
      source={artSources[name]}
      resizeMode="contain"
      style={[fill ? styles.fill : { width: size, height: size }, style]}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : (accessibilityLabel ?? humanize(name))}
      importantForAccessibility={decorative ? 'no' : 'yes'}
    />
  );
}

/** A stable soft tone for an art name, so the same item always gets the same background. */
export function toneForArt(name: string): ArtToneName {
  const soft: ArtToneName[] = ['peach', 'mint', 'sky', 'lilac', 'butter', 'rose', 'sand', 'aqua'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return soft[hash % soft.length]!;
}

export interface ArtTileProps {
  art: ArtName;
  /** Tile size in px (the tile is square). */
  size?: number;
  shape?: 'circle' | 'rounded' | 'square';
  /** Background tone. Defaults to a stable soft tone picked from the art name. */
  tone?: ArtToneName;
  /** Fraction of the tile the art fills. */
  artScale?: number;
  /** Text under the tile ("Biryani"). */
  label?: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Hide from screen readers (ignored when pressable). */
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A 3D illustration on a soft gradient background, optionally labelled and pressable. */
export function ArtTile({
  art,
  size = 72,
  shape = 'rounded',
  tone,
  artScale = 0.72,
  label,
  selected,
  onPress,
  accessibilityLabel,
  decorative,
  style,
}: ArtTileProps) {
  const theme = useTheme();
  const radius = shape === 'circle' ? size / 2 : shape === 'rounded' ? Math.min(radii.lg, size / 4) : radii.sm;
  const name = accessibilityLabel ?? label ?? humanize(art);
  const tile = (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: radius },
        selected && { borderWidth: 2, borderColor: theme.colors.primary },
      ]}
    >
      <GradientFill colors={theme.tone(tone ?? toneForArt(art))} />
      <Art name={art} size={Math.round(size * artScale)} decorative />
    </View>
  );
  const content = (
    <>
      {tile}
      {label ? (
        <Text variant="caption" align="center" numberOfLines={2} style={[styles.label, { maxWidth: size + 16 }]}>
          {label}
        </Text>
      ) : null}
    </>
  );
  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityLabel={name}
        accessibilityState={{ selected: !!selected }}
        style={[styles.wrap, style]}
      >
        {content}
      </PressableScale>
    );
  }
  if (decorative) {
    return (
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.wrap, style]}>
        {content}
      </View>
    );
  }
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={name} style={[styles.wrap, style]}>
      {content}
    </View>
  );
}

export interface ArtLayer {
  art: ArtName;
  /** Center, as a fraction of the scene width (0 to 1). */
  x: number;
  /** Center, as a fraction of the scene height (0 to 1). */
  y: number;
  /** Layer size as a fraction of the scene width. */
  size: number;
  /** Degrees. */
  rotate?: number;
  opacity?: number;
  /** Mirror horizontally. */
  flip?: boolean;
}

export interface ArtSceneProps {
  tone: ArtToneName;
  layers: readonly ArtLayer[];
  /** width / height. Defaults to 1 (square). */
  aspectRatio?: number;
  radius?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * An illustrated composition: a gradient with art layered on top. Lumo
 * "photos", banners and posters are scenes.
 */
export function ArtScene({ tone, layers, aspectRatio = 1, radius = 0, accessibilityLabel, style, children }: ArtSceneProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const height = width / aspectRatio;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const label = accessibilityLabel ?? layers.map((l) => humanize(l.art)).join(', ');
  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={[styles.scene, { aspectRatio, borderRadius: radius }, style]}
    >
      <GradientFill colors={theme.tone(tone)} />
      {width > 0
        ? layers.map((layer, i) => {
            const px = layer.size * width;
            return (
              <View
                key={`${layer.art}-${i}`}
                style={{
                  position: 'absolute',
                  width: px,
                  height: px,
                  left: layer.x * width - px / 2,
                  top: layer.y * height - px / 2,
                  opacity: layer.opacity ?? 1,
                  transform: [{ rotate: `${layer.rotate ?? 0}deg` }, { scaleX: layer.flip ? -1 : 1 }],
                }}
              >
                <Art name={layer.art} fill decorative />
              </View>
            );
          })
        : null}
      {children}
    </View>
  );
}

export function isArtTone(name: string): name is ArtToneName {
  return (ART_TONE_NAMES as string[]).includes(name);
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  wrap: { alignItems: 'center' },
  tile: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { marginTop: 6 },
  scene: { width: '100%', overflow: 'hidden' },
});
