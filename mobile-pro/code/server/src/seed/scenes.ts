import type { ArtName, ArtTone, Scene, SceneLayer } from '@pro/api/types';

import type { Rng } from '../lib/rng';

/** Big, scenic art that should fill the frame. */
const LANDSCAPES = new Set<ArtName>([
  'snow-capped-mountain',
  'mount-fuji',
  'sunrise',
  'sunrise-over-mountains',
  'sunset-over-buildings',
  'night-with-stars',
  'cityscape',
  'bridge-at-night',
  'desert-island',
  'beach-with-umbrella',
  'volcano',
  'rainbow',
  'water-wave',
  'ferris-wheel',
  'roller-coaster',
  'european-castle',
  'camping',
]);

type Slot = Omit<SceneLayer, 'art'>;

const LAYOUTS: Record<number, Slot[]> = {
  1: [{ x: 0.5, y: 0.55, size: 0.64 }],
  2: [
    { x: 0.42, y: 0.57, size: 0.58 },
    { x: 0.77, y: 0.27, size: 0.3, rotate: 10 },
  ],
  3: [
    { x: 0.5, y: 0.6, size: 0.54 },
    { x: 0.2, y: 0.25, size: 0.26, rotate: -8 },
    { x: 0.8, y: 0.27, size: 0.24, rotate: 12 },
  ],
  4: [
    { x: 0.5, y: 0.6, size: 0.5 },
    { x: 0.18, y: 0.24, size: 0.24, rotate: -10 },
    { x: 0.82, y: 0.22, size: 0.22, rotate: 8 },
    { x: 0.83, y: 0.8, size: 0.2, rotate: -6 },
  ],
};

const jitter = (rng: Rng, amount: number) => (rng.next() - 0.5) * 2 * amount;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Lays out 1 to 4 arts as an illustrated photo: a hero plus accents. */
export function composeScene(tone: ArtTone, arts: readonly ArtName[], rng: Rng): Scene {
  const used = arts.slice(0, 4);
  const slots = LAYOUTS[Math.max(1, used.length)]!;
  const layers = used.map((art, i): SceneLayer => {
    const slot = slots[i]!;
    const hero = i === 0;
    const landscape = hero && LANDSCAPES.has(art);
    const size = landscape ? Math.min(0.86, slot.size + 0.18) : slot.size;
    return {
      art,
      x: r3(slot.x + jitter(rng, hero ? 0.03 : 0.05)),
      y: r3((landscape ? 0.6 : slot.y) + jitter(rng, hero ? 0.03 : 0.05)),
      size: r3(size + jitter(rng, 0.03)),
      rotate: Math.round((slot.rotate ?? 0) + jitter(rng, hero ? 3 : 6)),
      ...(rng.chance(hero ? 0.15 : 0.3) ? { flip: true } : {}),
    };
  });
  return { tone, layers };
}
