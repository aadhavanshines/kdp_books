/**
 * Seed images are generated at fixed widths ("<base>-320.webp"). Real uploaded
 * photos later come from a CDN with full URLs and are used as-is.
 */
const WIDTHS = {
  dish: [320, 640],
  cover: [480, 960],
} as const;

export type ImageKind = keyof typeof WIDTHS;

export function isSeedImage(url: string) {
  return url.startsWith('/images/seed/');
}

export function imageSources(url: string, kind: ImageKind): { src: string; srcSet?: string } {
  if (!isSeedImage(url)) return { src: url };
  const widths = WIDTHS[kind];
  return {
    src: `${url}-${widths[0]}.webp`,
    srcSet: widths.map((w) => `${url}-${w}.webp ${w}w`).join(', '),
  };
}
