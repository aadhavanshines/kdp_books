// Desserts and drinks, drawn top-down around (0, 0).
import {
  BOWLS,
  bowl,
  contactShadow,
  dots,
  dropShadow,
  grains,
  leaf,
  plate,
} from './primitives.mjs';
import { scoop } from './dishes-world.mjs';
import { blobPath, darken, el, g, lighten } from './svg.mjs';

export function iceCream(
  ctx,
  rng,
  { flavors = ['#f7c6d0', '#6b3f24', '#fff3d6'], sauce = '#4a1f0c' } = {},
) {
  const b = bowl(ctx, 140, BOWLS.blue);
  const parts = [el('circle', { r: b.inner + 4, fill: '#f7f1e6' })];
  const spots = [
    [-38, -25],
    [35, -30],
    [0, 38],
  ];
  flavors.forEach((color, i) => parts.push(scoop(ctx, rng, spots[i][0], spots[i][1], 46, color)));
  parts.push(
    el('path', {
      d: 'M-70,-10 C-30,-40 10,10 60,-15 M-40,40 C-10,20 20,60 60,30',
      stroke: sauce,
      'stroke-width': 6,
      fill: 'none',
      'stroke-linecap': 'round',
      opacity: 0.85,
    }),
  );
  parts.push(
    grains(rng, 40, 0, 0, 70, ['#e84a5f', '#f6c331', '#4fc3f7', '#81c784'], { len: 4, width: 1.6 }),
  );
  return (
    b.svg +
    g({ 'clip-path': b.clip }, parts) +
    g({ transform: 'translate(70 -70) rotate(35)' }, [
      contactShadow(0, 0, 14, 50),
      el('rect', { x: -12, y: -55, width: 24, height: 110, rx: 4, fill: '#e9b45f' }),
      ...[-40, -20, 0, 20, 40].map((y) =>
        el('line', { x1: -12, y1: y, x2: 12, y2: y, stroke: '#c48a38', 'stroke-width': 2 }),
      ),
    ])
  );
}

export function cakeSlice(
  ctx,
  rng,
  { sponge = '#5a2e1a', frosting = '#7a3f22', topping = '#d6243a' } = {},
) {
  const p = plate(ctx, 150);
  // A wedge: the "side" layer drawn offset below the top gives a 3/4 view.
  const wedge = 'M-70,-60 L90,-20 L-40,90 Z';
  const layers = [];
  for (let i = 0; i < 3; i++)
    layers.push(
      el('path', {
        d: wedge,
        fill: i % 2 ? lighten(frosting, 0.6) : sponge,
        transform: `translate(${10 - i * 3} ${22 - i * 7})`,
      }),
    );
  return [
    p.svg,
    el('path', {
      d: wedge,
      fill: '#4a2c1a',
      opacity: 0.2,
      filter: 'url(#softShadow)',
      transform: 'translate(16 30)',
    }),
    ...layers,
    el('path', {
      d: wedge,
      fill: ctx.radial(
        [
          [0, lighten(frosting, 0.2)],
          [1, frosting],
        ],
        { fx: 0.4, fy: 0.4 },
      ),
    }),
    dots(rng, 26, 0, 0, 40, [darken(frosting, 0.3), lighten(frosting, 0.4)], 1.8),
    el('circle', { cx: -15, cy: -10, r: 16, fill: topping }),
    el('ellipse', { cx: -20, cy: -15, rx: 5, ry: 3, fill: '#fff', opacity: 0.5 }),
    leaf(-5, -25, 16, 8, 30, '#3f8f2f'),
    el('path', {
      d: 'M60,70 C80,60 100,80 120,60',
      stroke: frosting,
      'stroke-width': 6,
      fill: 'none',
      'stroke-linecap': 'round',
      opacity: 0.8,
    }),
  ].join('');
}

export function brownie(ctx, rng) {
  const p = plate(ctx, 150, { color: '#f3efe8' });
  const square = (x, y, rot) =>
    g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
      contactShadow(4, 6, 50, 50),
      el('rect', { x: -46, y: -40, width: 96, height: 92, rx: 10, fill: '#3a1a0c' }),
      el('rect', {
        x: -50,
        y: -46,
        width: 96,
        height: 92,
        rx: 10,
        fill: ctx.radial([
          [0, '#6b3a1e'],
          [1, '#4a2410'],
        ]),
      }),
      ...Array.from({ length: 6 }, () =>
        el('path', {
          d: `M${rng.range(-40, 30)},${rng.range(-35, 35)} l${rng.range(8, 20)},${rng.range(-6, 6)}`,
          stroke: '#8a5a3a',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          opacity: 0.7,
        }),
      ),
    ]);
  return [
    p.svg,
    square(-35, -25, -8),
    square(45, 10, 12),
    scoop(ctx, rng, -10, 60, 34, '#fff3d6'),
    dots(rng, 12, 0, 0, 100, ['#5a2a10'], 3),
  ].join('');
}

function cup(ctx, x, y, r, { liquid, handle = true, saucer = true, cupColor = '#ffffff' }) {
  const parts = [];
  if (saucer)
    parts.push(
      dropShadow(x, y, r * 1.55),
      el('circle', {
        cx: x,
        cy: y,
        r: r * 1.55,
        fill: ctx.radial([
          [0, '#ffffff'],
          [1, '#e7e2da'],
        ]),
      }),
    );
  if (handle)
    parts.push(
      el('rect', {
        x: x + r * 0.85,
        y: y - r * 0.18,
        width: r * 0.55,
        height: r * 0.36,
        rx: r * 0.18,
        fill: cupColor,
        stroke: darken(cupColor, 0.12),
        'stroke-width': 2,
      }),
    );
  parts.push(
    contactShadow(x, y, r * 1.04, r * 1.04),
    el('circle', { cx: x, cy: y, r, fill: cupColor }),
    el('circle', { cx: x, cy: y, r: r * 0.86, fill: liquid }),
  );
  return parts.join('');
}

export function coffee(ctx, rng, { kind = 'latte' } = {}) {
  const parts = [];
  if (kind === 'cold') {
    parts.push(
      dropShadow(0, 0, 110),
      el('circle', { r: 110, fill: '#e8eef2', opacity: 0.9 }),
      el('circle', {
        r: 100,
        fill: ctx.radial([
          [0, '#d9b48a'],
          [1, '#a7774a'],
        ]),
      }),
    );
    parts.push(
      el('path', { d: blobPath(rng, 0, 0, 70, { points: 10, wobble: 0.12 }), fill: '#fbf3e6' }),
    );
    parts.push(dots(rng, 30, 0, 0, 60, ['#5a2e14', '#7a4220'], 2.2));
    parts.push(
      el('circle', { cx: 40, cy: -40, r: 9, fill: '#2e7d32' }),
      el('rect', {
        x: 40,
        y: -50,
        width: 130,
        height: 16,
        rx: 8,
        fill: '#2e7d32',
        transform: 'rotate(-30 40 -40)',
      }),
    );
    return parts.join('');
  }
  const crema = ctx.radial([
    [0, '#c98e55'],
    [0.75, '#9c6232'],
    [1, '#6b3a17'],
  ]);
  parts.push(
    cup(ctx, -10, -5, 88, { liquid: crema, cupColor: kind === 'filter' ? '#cfd6dc' : '#ffffff' }),
  );
  if (kind === 'latte') {
    // Rosetta latte art.
    for (let i = 0; i < 6; i++)
      parts.push(
        el('path', {
          d: `M${-10 - 40 + i * 4},${-5 - 40 + i * 13} q${40 - i * 4},${-18} ${80 - i * 8},0`,
          stroke: '#fbf1e2',
          'stroke-width': 7,
          fill: 'none',
          'stroke-linecap': 'round',
        }),
      );
    parts.push(el('path', { d: 'M-10,-55 L-10,45', stroke: '#fbf1e2', 'stroke-width': 4 }));
  } else {
    parts.push(
      el('circle', {
        cx: -10,
        cy: -5,
        r: 65,
        fill: ctx.radial([
          [0, '#e6c69a'],
          [1, '#c99a62'],
        ]),
      }),
      dots(rng, 40, -10, -5, 60, ['#f3e2c4', '#d9b07a'], 2),
    );
  }
  for (const [x, y] of [
    [100, 95],
    [70, 120],
  ])
    parts.push(
      contactShadow(x, y, 26, 26),
      el('circle', { cx: x, cy: y, r: 26, fill: '#e2b46a' }),
      dots(rng, 6, x, y, 18, ['#b67a35'], 2),
    );
  return parts.join('');
}

export function chai(ctx, rng) {
  const parts = [];
  const kulhad = (x, y) =>
    [
      dropShadow(x, y, 62),
      el('circle', {
        cx: x,
        cy: y,
        r: 62,
        fill: ctx.radial([
          [0, '#d0774a'],
          [1, '#9b4a26'],
        ]),
      }),
      el('circle', {
        cx: x,
        cy: y,
        r: 50,
        fill: ctx.radial([
          [0, '#d9a26a'],
          [0.8, '#c48a52'],
          [1, '#a26a38'],
        ]),
      }),
      el('circle', {
        cx: x,
        cy: y,
        r: 50,
        fill: 'none',
        stroke: '#e8c49a',
        'stroke-width': 5,
        opacity: 0.8,
      }),
    ].join('');
  parts.push(kulhad(-45, -30), kulhad(60, 40));
  for (const [x, y] of [
    [-60, 85],
    [-10, 105],
  ])
    parts.push(
      contactShadow(x, y, 30, 30),
      el('circle', { cx: x, cy: y, r: 30, fill: '#e9bf72' }),
      dots(rng, 8, x, y, 20, ['#a8692a'], 2.4),
    );
  parts.push(grains(rng, 5, 80, -70, 20, ['#8aa84a', '#7a9a3a'], { len: 7, width: 3.5 }));
  return parts.join('');
}

export function drink(
  ctx,
  rng,
  { liquid = '#f2d16b', topping = 'cream', garnish = '#f6a623' } = {},
) {
  const parts = [
    dropShadow(0, 0, 110),
    el('circle', { r: 110, fill: '#eef3f6', opacity: 0.95 }),
    el('circle', {
      r: 98,
      fill: ctx.radial([
        [0, lighten(liquid, 0.25)],
        [1, liquid],
      ]),
    }),
  ];
  if (topping === 'cream')
    parts.push(
      el('path', { d: blobPath(rng, 0, 0, 70, { points: 12, wobble: 0.12 }), fill: '#fffaf0' }),
      el('path', { d: blobPath(rng, 0, 0, 40, { points: 9, wobble: 0.15 }), fill: '#ffffff' }),
    );
  if (topping === 'ice') {
    for (let i = 0; i < 6; i++) {
      const [x, y] = rng.inCircle(60);
      parts.push(
        el('rect', {
          x: x - 18,
          y: y - 18,
          width: 36,
          height: 36,
          rx: 8,
          fill: '#ffffff',
          opacity: 0.45,
          transform: `rotate(${rng.int(0, 90)} ${x} ${y})`,
        }),
      );
    }
    parts.push(
      g({ transform: 'translate(-30 20)' }, [
        el('circle', { r: 30, fill: '#9ccc3a' }),
        el('circle', { r: 25, fill: '#dcef9a' }),
        ...[0, 60, 120].map((a) =>
          el('line', {
            x1: -25,
            y1: 0,
            x2: 25,
            y2: 0,
            stroke: '#9ccc3a',
            'stroke-width': 2,
            transform: `rotate(${a})`,
          }),
        ),
      ]),
    );
    for (let i = 0; i < 5; i++)
      parts.push(leaf(rng.range(0, 50), rng.range(-50, 0), 26, 16, rng.int(0, 360), '#2f9e57'));
  }
  if (topping === 'cream') parts.push(dots(rng, 14, 0, 0, 40, [garnish], 3.5));
  parts.push(
    el('circle', { cx: 45, cy: -45, r: 9, fill: '#e84a5f' }),
    el('rect', {
      x: 45,
      y: -54,
      width: 130,
      height: 18,
      rx: 9,
      fill: '#e84a5f',
      transform: 'rotate(-35 45 -45)',
    }),
  );
  return parts.join('');
}
