/**
 * Pure helpers behind Lumo "photos": seeded randomness, the backdrop a
 * photo is drawn on, how picked art becomes a hero plus accents, and the
 * photo filters. Everything is deterministic for a seed (usually a post id),
 * so a post looks the same on every device and every render.
 */
import type { ArtName } from '../art/registry';
import type { ArtToneName } from '../tokens/colors';

/** 32-bit FNV-1a hash of a string. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A small, fast seeded generator (mulberry32) returning numbers in [0, 1). */
export function seededRandom(seed: string | number): () => number {
  let a = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const between = (rand: () => number, min: number, max: number) => min + rand() * (max - min);

export interface BackdropOrb {
  /** Center and radius as fractions of the photo width / height. */
  x: number;
  y: number;
  r: number;
  opacity: number;
}

export interface BackdropSparkle {
  x: number;
  y: number;
  /** Fraction of the width. */
  size: number;
  rotate: number;
}

export interface PhotoBackdrop {
  /** Base gradient vector, in fractions (SVG x1/y1/x2/y2). */
  angle: { x1: number; y1: number; x2: number; y2: number };
  /** A soft light source. */
  glow: { x: number; y: number; r: number; opacity: number };
  /** Out-of-focus light circles. */
  orbs: BackdropOrb[];
  /** Where the ground starts (fraction of height), or null for an open sky. */
  horizon: number | null;
  sparkles: BackdropSparkle[];
  /** Edge darkening, 0 to 1. */
  vignette: number;
}

/** Deep tones read as night or dusk: they get more sparkles and a stronger glow. */
const DEEP_TONES: ReadonlySet<ArtToneName> = new Set(['dusk', 'night', 'aurora', 'ocean', 'sunset', 'ember']);

/** The seeded layers a photo is drawn on: gradient angle, glow, bokeh, horizon and sparkles. */
export function photoBackdrop(seed: string, tone: ArtToneName): PhotoBackdrop {
  const rand = seededRandom(`${seed}:backdrop`);
  const deep = DEEP_TONES.has(tone);
  const theta = between(rand, 0.15, 0.85) * Math.PI;
  const dx = Math.cos(theta) / 2;
  const dy = Math.sin(theta) / 2;
  const glowLeft = rand() < 0.5;
  const orbCount = 3 + Math.floor(rand() * 4);
  const orbs = Array.from({ length: orbCount }, () => ({
    x: r3(rand()),
    y: r3(between(rand, 0.02, 0.55)),
    r: r3(between(rand, 0.025, 0.11)),
    opacity: r3(between(rand, deep ? 0.08 : 0.12, deep ? 0.2 : 0.3)),
  }));
  const sparkleCount = deep ? 4 + Math.floor(rand() * 4) : Math.floor(rand() * 3);
  const sparkles = Array.from({ length: sparkleCount }, () => ({
    x: r3(between(rand, 0.06, 0.94)),
    y: r3(between(rand, 0.05, 0.5)),
    size: r3(between(rand, 0.018, 0.04)),
    rotate: Math.round(between(rand, -20, 20)),
  }));
  return {
    angle: { x1: r3(0.5 - dx), y1: r3(0.5 - dy), x2: r3(0.5 + dx), y2: r3(0.5 + dy) },
    glow: {
      x: r3(glowLeft ? between(rand, 0.1, 0.35) : between(rand, 0.65, 0.9)),
      y: r3(between(rand, 0.08, 0.3)),
      r: r3(between(rand, 0.45, 0.7)),
      opacity: r3(deep ? between(rand, 0.35, 0.5) : between(rand, 0.5, 0.75)),
    },
    orbs,
    horizon: rand() < 0.7 ? r3(between(rand, 0.68, 0.8)) : null,
    sparkles,
    vignette: r3(deep ? between(rand, 0.3, 0.42) : between(rand, 0.12, 0.22)),
  };
}

export interface ComposedLayer {
  art: ArtName;
  x: number;
  y: number;
  size: number;
  rotate?: number;
  flip?: boolean;
}

/** Hero first, then accent slots around it (fractions of the photo). */
const SLOTS: Record<number, { x: number; y: number; size: number; rotate: number }[]> = {
  1: [{ x: 0.5, y: 0.56, size: 0.66, rotate: 0 }],
  2: [
    { x: 0.44, y: 0.58, size: 0.58, rotate: 0 },
    { x: 0.78, y: 0.26, size: 0.3, rotate: 10 },
  ],
  3: [
    { x: 0.5, y: 0.6, size: 0.54, rotate: 0 },
    { x: 0.2, y: 0.25, size: 0.26, rotate: -8 },
    { x: 0.8, y: 0.27, size: 0.24, rotate: 12 },
  ],
  4: [
    { x: 0.5, y: 0.6, size: 0.5, rotate: 0 },
    { x: 0.18, y: 0.24, size: 0.24, rotate: -10 },
    { x: 0.82, y: 0.22, size: 0.22, rotate: 8 },
    { x: 0.83, y: 0.8, size: 0.2, rotate: -6 },
  ],
};

/**
 * Lays out up to four arts as a photo: the first is the hero, the rest are
 * small accents. The seed nudges positions, sizes and tilt, and may mirror
 * the composition, so the same arts still make distinct photos.
 */
export function composeScene(arts: readonly ArtName[], seed: string, tone: ArtToneName): { tone: ArtToneName; layers: ComposedLayer[] } {
  const used = arts.slice(0, 4);
  if (used.length === 0) return { tone, layers: [] };
  const rand = seededRandom(`${seed}:compose`);
  const mirror = rand() < 0.5;
  const slots = SLOTS[used.length]!;
  const jitter = (amount: number) => (rand() - 0.5) * 2 * amount;
  const layers = used.map((art, i): ComposedLayer => {
    const slot = slots[i]!;
    const hero = i === 0;
    const x = slot.x + jitter(hero ? 0.02 : 0.04);
    const layer: ComposedLayer = {
      art,
      x: r3(mirror ? 1 - x : x),
      y: r3(slot.y + jitter(hero ? 0.02 : 0.04)),
      size: r3(slot.size + jitter(0.025)),
      rotate: Math.round((mirror ? -slot.rotate : slot.rotate) + jitter(hero ? 2 : 6)),
    };
    if (!hero && rand() < 0.3) layer.flip = true;
    return layer;
  });
  return { tone, layers };
}

export const PHOTO_FILTER_NAMES = ['normal', 'warm', 'cool', 'mono', 'fade', 'vivid', 'dusk'] as const;
export type PhotoFilterName = (typeof PHOTO_FILTER_NAMES)[number];

export type PhotoBlend = 'normal' | 'overlay' | 'soft-light' | 'saturation' | 'multiply' | 'screen';

export interface PhotoFilterSpec {
  label: string;
  /** A color wash over the photo; `colors` with 2 stops is a top-to-bottom gradient. */
  wash: { colors: 'warm' | 'cool' | 'mono' | 'fade' | 'dusk'; opacity: number; blend: PhotoBlend } | null;
  /** CSS-style filter for platforms that support it (web, Android); iOS uses the wash only. */
  filter: string | null;
}

export const photoFilters: Record<PhotoFilterName, PhotoFilterSpec> = {
  normal: { label: 'Normal', wash: null, filter: null },
  warm: { label: 'Warm', wash: { colors: 'warm', opacity: 0.32, blend: 'soft-light' }, filter: 'saturate(1.1)' },
  cool: { label: 'Cool', wash: { colors: 'cool', opacity: 0.3, blend: 'soft-light' }, filter: 'hue-rotate(-6deg)' },
  mono: { label: 'Mono', wash: { colors: 'mono', opacity: 1, blend: 'saturation' }, filter: 'grayscale(1) contrast(1.08)' },
  fade: { label: 'Fade', wash: { colors: 'fade', opacity: 0.32, blend: 'normal' }, filter: 'contrast(0.9)' },
  vivid: { label: 'Vivid', wash: null, filter: 'saturate(1.45) contrast(1.08)' },
  dusk: { label: 'Dusk', wash: { colors: 'dusk', opacity: 0.45, blend: 'soft-light' }, filter: 'saturate(1.15)' },
};

export function isPhotoFilter(name: string): name is PhotoFilterName {
  return (PHOTO_FILTER_NAMES as readonly string[]).includes(name);
}
