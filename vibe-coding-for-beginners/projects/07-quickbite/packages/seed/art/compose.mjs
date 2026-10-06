// Turns a dish drawing into a finished square dish photo or a wide restaurant cover.
import { createRng, Ctx, el, g, lighten, darken } from './svg.mjs';

export const BACKGROUNDS = {
  peach: '#fbe1cf',
  butter: '#f9ecc4',
  mint: '#d6efe0',
  blush: '#f8d9dc',
  sky: '#d8e8f7',
  lavender: '#e4def5',
  sand: '#efe2cf',
  sage: '#dfe9d3',
  coral: '#f9d3c4',
  slate: '#d9dee6',
};

/** Subtle linen texture so the background doesn't look flat and digital. */
function backdrop(ctx, rng, w, h, color) {
  const glow = ctx.radial(
    [
      [0, lighten(color, 0.45)],
      [0.6, color],
      [1, darken(color, 0.06)],
    ],
    { cx: 0.45, cy: 0.42, r: 0.75 },
  );
  const parts = [el('rect', { width: w, height: h, fill: glow })];
  for (let i = 0; i < Math.round((w * h) / 900); i++) {
    parts.push(
      el('circle', {
        cx: rng.range(0, w),
        cy: rng.range(0, h),
        r: rng.range(0.6, 1.6),
        fill: darken(color, 0.25),
        opacity: rng.range(0.05, 0.14),
      }),
    );
  }
  return parts.join('');
}

/** Square dish image. `draw(ctx, rng)` draws around (0,0) within ~155px. */
export function dishSvg(key, draw, { bg = 'peach', size = 400, scale = 1.26 } = {}) {
  const ctx = new Ctx('k');
  const rng = createRng(key);
  const body =
    backdrop(ctx, rng, size, size, BACKGROUNDS[bg]) +
    g(
      { transform: `translate(${size / 2} ${size / 2}) scale(${(size / 400) * scale})` },
      draw(ctx, rng),
    );
  return ctx.render(size, size, body);
}

/**
 * Wide restaurant cover: the hero dish large on the right, a second dish
 * peeking in from the left, on the brand's background colour.
 */
export function coverSvg(key, hero, side, { bg = 'peach', width = 800, height = 500 } = {}) {
  const ctx = new Ctx('c');
  const rng = createRng(`cover:${key}`);
  const parts = [backdrop(ctx, rng, width, height, BACKGROUNDS[bg])];
  // Fill the frame like a food photo: the hero dish is cropped by the edges.
  const heroScale = (height * 0.62) / 155;
  const sideScale = (height * 0.42) / 155;
  if (side)
    parts.push(
      g(
        {
          transform: `translate(${width * 0.17} ${height * 0.86}) scale(${sideScale}) rotate(-12)`,
        },
        side(ctx, rng),
      ),
    );
  parts.push(
    g(
      {
        transform: `translate(${width * 0.62} ${height * 0.47}) scale(${heroScale}) rotate(${rng.range(-10, 10)})`,
      },
      hero(ctx, rng),
    ),
  );
  return ctx.render(width, height, parts.join(''));
}
