import { ART_NAMES } from '../art/registry';
import { ART_TONE_NAMES } from '../tokens/colors';
import { PHOTO_FILTER_NAMES, composeScene, hashSeed, isPhotoFilter, photoBackdrop, photoFilters, seededRandom } from './photo';

describe('seeded randomness', () => {
  it('hashes strings stably and spreads nearby seeds apart', () => {
    expect(hashSeed('post_001')).toBe(hashSeed('post_001'));
    expect(hashSeed('post_001')).not.toBe(hashSeed('post_002'));
    expect(hashSeed('')).toBe(0x811c9dc5);
  });

  it('repeats the same sequence for a seed, in [0, 1)', () => {
    const a = seededRandom('x');
    const b = seededRandom('x');
    const seqA = Array.from({ length: 50 }, a);
    expect(Array.from({ length: 50 }, b)).toEqual(seqA);
    expect(seqA.every((n) => n >= 0 && n < 1)).toBe(true);
    expect(new Set(seqA).size).toBe(50);
    expect(seededRandom(7)()).toBe(seededRandom(7)());
  });
});

describe('photoBackdrop', () => {
  it('is deterministic per seed and differs between posts', () => {
    expect(photoBackdrop('post_001', 'sunset')).toEqual(photoBackdrop('post_001', 'sunset'));
    expect(photoBackdrop('post_001', 'sunset')).not.toEqual(photoBackdrop('post_002', 'sunset'));
  });

  it('keeps every element inside the frame', () => {
    for (let i = 0; i < 200; i++) {
      const tone = ART_TONE_NAMES[i % ART_TONE_NAMES.length]!;
      const b = photoBackdrop(`seed-${i}`, tone);
      expect(b.orbs.length).toBeGreaterThanOrEqual(3);
      for (const o of b.orbs) {
        expect(o.x).toBeGreaterThanOrEqual(0);
        expect(o.x).toBeLessThanOrEqual(1);
        expect(o.opacity).toBeLessThanOrEqual(0.3);
      }
      if (b.horizon !== null) expect(b.horizon).toBeGreaterThan(0.6);
      expect(b.glow.opacity).toBeGreaterThan(0);
      expect(b.vignette).toBeLessThan(0.5);
    }
  });

  it('gives night tones sparkles and a deeper vignette', () => {
    const seeds = Array.from({ length: 30 }, (_, i) => `s${i}`);
    expect(seeds.every((s) => photoBackdrop(s, 'night').sparkles.length >= 4)).toBe(true);
    expect(seeds.every((s) => photoBackdrop(s, 'peach').sparkles.length <= 2)).toBe(true);
    expect(photoBackdrop('a', 'night').vignette).toBeGreaterThan(photoBackdrop('a', 'peach').vignette);
  });
});

describe('composeScene', () => {
  const arts = [ART_NAMES[0]!, ART_NAMES[1]!, ART_NAMES[2]!];

  it('makes the first art a big hero and the rest small accents', () => {
    const { tone, layers } = composeScene(arts, 'new-post', 'sky');
    expect(tone).toBe('sky');
    expect(layers.map((l) => l.art)).toEqual(arts);
    expect(layers[0]!.size).toBeGreaterThan(0.5);
    expect(layers[1]!.size).toBeLessThan(0.3);
    expect(layers[0]!.flip).toBeUndefined();
  });

  it('caps at four layers, handles none, and varies with the seed', () => {
    expect(composeScene(ART_NAMES.slice(0, 6), 's', 'mint').layers).toHaveLength(4);
    expect(composeScene([], 's', 'mint').layers).toEqual([]);
    const xs = new Set(Array.from({ length: 12 }, (_, i) => composeScene(arts, `seed${i}`, 'mint').layers[1]!.x > 0.5));
    expect(xs.size).toBe(2); // mirrored on some seeds
  });
});

describe('photo filters', () => {
  it('names every filter and recognises filter names', () => {
    expect(PHOTO_FILTER_NAMES.map((f) => photoFilters[f].label)).toEqual(['Normal', 'Warm', 'Cool', 'Mono', 'Fade', 'Vivid', 'Dusk']);
    expect(photoFilters.normal.wash).toBeNull();
    expect(photoFilters.mono.wash?.blend).toBe('saturation');
    expect(isPhotoFilter('dusk')).toBe(true);
    expect(isPhotoFilter('sepia')).toBe(false);
  });
});
