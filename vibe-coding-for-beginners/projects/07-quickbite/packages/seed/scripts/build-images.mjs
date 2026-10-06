#!/usr/bin/env node
// Builds every seed image into apps/web/public/images/seed as responsive WebP.
//
//   pnpm images            build missing images
//   pnpm images --force    rebuild everything
//   pnpm images --sheet    also write a contact sheet (art-preview.png) for review
//
// Real photos win over artwork: put packages/seed/photos/dishes/<key>.jpg (or
// photos/restaurants/<brandId>.jpg) in place and they are cropped and resized
// with exactly the same sizes and names, so the app needs no changes.

import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ART } from '../art/index.mjs';
import { coverSvg, dishSvg } from '../art/compose.mjs';
import { BRANDS } from '../src/brands.ts';
import { COVER_IMAGE_WIDTHS, DISH_IMAGE_WIDTHS, DISH_IMAGES } from '../src/images.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const outDir = join(root, 'apps', 'web', 'public', 'images', 'seed');
const photoDir = join(here, '..', 'photos');
const force = process.argv.includes('--force');
const sheet = process.argv.includes('--sheet');

function findPhoto(kind, key) {
  const dir = join(photoDir, kind);
  if (!existsSync(dir)) return null;
  const file = readdirSync(dir).find((f) => f.replace(/\.(jpe?g|png|webp|avif)$/i, '') === key);
  return file ? join(dir, file) : null;
}

const drawDish = (key) => {
  const spec = DISH_IMAGES[key];
  const draw = ART[spec.art];
  if (!draw) throw new Error(`Unknown art "${spec.art}" for ${key}`);
  return (ctx, rng) => draw(ctx, rng, spec.opts ?? {});
};

async function writeSizes(input, kind, key, widths, aspect) {
  const dir = join(outDir, kind);
  mkdirSync(dir, { recursive: true });
  let written = 0;
  for (const w of widths) {
    const file = join(dir, `${key}-${w}.webp`);
    if (!force && existsSync(file)) continue;
    await sharp(input, { density: 144 })
      .resize(w, Math.round(w / aspect), { fit: 'cover', position: 'attention' })
      .webp({ quality: 78, effort: 5 })
      .toFile(file);
    written += 1;
  }
  return written;
}

let count = 0;
for (const key of Object.keys(DISH_IMAGES)) {
  const photo = findPhoto('dishes', key);
  const input =
    photo ?? Buffer.from(dishSvg(key, drawDish(key), { bg: DISH_IMAGES[key].bg, size: 640 }));
  count += await writeSizes(input, 'dishes', key, DISH_IMAGE_WIDTHS, 1);
}
for (const brand of BRANDS) {
  const photo = findPhoto('restaurants', brand.id);
  const { hero, side, bg } = brand.cover;
  const input =
    photo ??
    Buffer.from(
      coverSvg(brand.id, drawDish(hero), side ? drawDish(side) : null, {
        bg,
        width: 960,
        height: 600,
      }),
    );
  count += await writeSizes(input, 'restaurants', brand.id, COVER_IMAGE_WIDTHS, 1.6);
}
console.log(`Seed images ready in ${outDir} (${count} written).`);

if (sheet) {
  const tiles = await Promise.all(
    BRANDS.map((b) =>
      sharp(join(outDir, 'restaurants', `${b.id}-480.webp`))
        .resize(320, 200)
        .png()
        .toBuffer(),
    ),
  );
  const cols = 4;
  await sharp({
    create: {
      width: cols * 320,
      height: Math.ceil(tiles.length / cols) * 200,
      channels: 3,
      background: '#fff',
    },
  })
    .composite(
      tiles.map((t, i) => ({ input: t, left: (i % cols) * 320, top: Math.floor(i / cols) * 200 })),
    )
    .png()
    .toFile(join(root, 'art-preview.png'));
  console.log('Contact sheet: art-preview.png');
}
