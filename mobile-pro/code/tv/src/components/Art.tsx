import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { artSources, ART_NAMES, type ArtName } from '../art/registry';

export { ART_NAMES, type ArtName };

const artNameSet: ReadonlySet<string> = new Set(ART_NAMES);
export function isArtName(name: string): name is ArtName {
  return artNameSet.has(name);
}

export function humanize(name: string): string {
  const words = name.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface ArtProps {
  name: ArtName;
  /** Square size in dp. Ignored when `fill` is set. */
  size?: number;
  fill?: boolean;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  /** Hide from screen readers when the surrounding element already says what it is. */
  decorative?: boolean;
}

/** One of the 3D illustrations (Microsoft Fluent Emoji 3D, MIT), copied from @pro/ui. */
export function Art({ name, size = 64, fill, style, accessibilityLabel, decorative }: ArtProps) {
  return (
    <Image
      source={artSources[name]}
      resizeMode="contain"
      style={[fill ? { width: '100%', height: '100%' } : { width: size, height: size }, style]}
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : (accessibilityLabel ?? humanize(name))}
      importantForAccessibility={decorative ? 'no' : 'yes'}
    />
  );
}
