// Indian dishes, drawn top-down around (0, 0).
import {
  BOWLS,
  bowl,
  butter,
  chili,
  chunk,
  contactShadow,
  coriander,
  corianderScatter,
  creamSwirl,
  cube,
  dots,
  dropShadow,
  flatbread,
  friedOnions,
  grains,
  katori,
  leaf,
  lemonWedge,
  onionRing,
  plate,
  steelPlate,
} from './primitives.mjs';
import { blobPath, darken, el, g, lighten } from './svg.mjs';

const RICE = ['#fffaf0', '#fffaf0', '#fbf3df', '#f6e3b5'];
const SAFFRON_RICE = ['#fffaf0', '#fffaf0', '#fbefd2', '#f5c25c', '#f0a032', '#e5832a'];

const PROTEIN = {
  chicken: '#c9702f',
  mutton: '#7d3c1c',
  tandoori: '#c94a22',
  fish: '#e0a764',
  prawn: '#ef8448',
};

export function biryani(ctx, rng, { protein = 'chicken' } = {}) {
  const handi = bowl(ctx, 150, { ...BOWLS.copper, rimWidth: 0.1 });
  const inner = handi.inner;
  const rice = ctx.radial([
    [0, '#fbefd0'],
    [1, '#e7c98c'],
  ]);
  const parts = [el('circle', { r: inner, fill: rice })];
  parts.push(grains(rng, 520, 0, 0, inner, SAFFRON_RICE));
  if (protein === 'veg') {
    for (let i = 0; i < 9; i++) {
      const [x, y] = rng.inCircle(inner * 0.75);
      parts.push(
        cube(
          ctx,
          x,
          y,
          rng.range(10, 14),
          rng.pick(['#f08a24', '#f2c14e', '#6ab04c']),
          rng.int(0, 90),
        ),
      );
    }
    parts.push(dots(rng, 25, 0, 0, inner * 0.8, ['#58a83a', '#4a9630'], 3.2));
  } else if (protein === 'egg') {
    for (const [x, y] of [
      [-40, -30],
      [35, 20],
      [-10, 55],
    ]) {
      parts.push(
        contactShadow(x, y, 22, 17),
        el('ellipse', { cx: x, cy: y, rx: 22, ry: 17, fill: '#fffdf6' }),
        el('circle', { cx: x + 2, cy: y + 1, r: 10, fill: '#f6b51c' }),
      );
    }
  } else {
    const positions = [
      [-45, -35],
      [40, -40],
      [10, 35],
      [-50, 45],
      [60, 30],
    ];
    for (const [x, y] of positions)
      parts.push(chunk(ctx, rng, x, y, rng.range(20, 26), PROTEIN[protein], { char: 0.5 }));
  }
  parts.push(friedOnions(rng, 40, 0, 0, inner * 0.85));
  for (let i = 0; i < 8; i++) {
    const [x, y] = rng.inCircle(inner * 0.8);
    parts.push(leaf(x, y, 13, 8, rng.int(0, 360), '#2f9e57'));
  }
  parts.push(corianderScatter(rng, 5, 0, 0, inner * 0.7, 6));
  return handi.svg + g({ 'clip-path': handi.clip }, parts);
}

const CURRY_CHUNKS = {
  chicken: (ctx, rng, x, y) => chunk(ctx, rng, x, y, rng.range(17, 22), '#d06a2c', { char: 0.5 }),
  mutton: (ctx, rng, x, y) => chunk(ctx, rng, x, y, rng.range(17, 21), '#7a3a1c', { char: 0.3 }),
  paneer: (ctx, rng, x, y) => cube(ctx, x, y, rng.range(20, 24), '#fff1d2', rng.int(-20, 20)),
  'paneer-tikka': (ctx, rng, x, y) =>
    cube(ctx, x, y, rng.range(20, 24), '#f2a35c', rng.int(-20, 20), { char: true }),
  fish: (ctx, rng, x, y) => chunk(ctx, rng, x, y, 24, '#efc58e', { char: 0.1, ry: 15 }),
  prawn: (ctx, rng, x, y) => prawnShape(x, y, 15, rng.int(0, 360)),
  kofta: (ctx, rng, x, y) => chunk(ctx, rng, x, y, 18, '#9b5a2a', { char: 0.2 }),
  egg: (ctx, rng, x, y) =>
    contactShadow(x, y, 20, 15) +
    el('ellipse', { cx: x, cy: y, rx: 20, ry: 15, fill: '#fffaf0' }) +
    el('circle', { cx: x + 1, cy: y, r: 9, fill: '#f5ad18' }),
  potato: (ctx, rng, x, y) => chunk(ctx, rng, x, y, 15, '#f2c867', { char: 0 }),
  chickpea: (ctx, rng, x, y) => dots(rng, 5, x, y, 14, ['#d9a35a', '#c98f45'], 5),
};

export function prawnShape(x, y, s, rot) {
  const segs = [];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 1.1 * i) / 4 - 0.2;
    segs.push(
      el('circle', {
        cx: Math.cos(a) * s * 0.75,
        cy: Math.sin(a) * s * 0.75,
        r: s * (0.42 - i * 0.04),
        fill: i % 2 ? '#f39a5c' : '#ee8443',
      }),
    );
  }
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    contactShadow(0, 0, s, s),
    ...segs,
    el('path', {
      d: `M${-s * 0.9},${s * 0.1} l${-s * 0.45},${-s * 0.3} l${s * 0.05},${s * 0.55}Z`,
      fill: '#e2582a',
    }),
  ]);
}

/**
 * A bowl of curry: gravy colour + chunks + finishing (cream swirl, tadka, coriander).
 */
export function curry(
  ctx,
  rng,
  {
    gravy = '#e3742b',
    chunks = 'chicken',
    count = 6,
    cream = true,
    bowlStyle = 'white',
    finish = 'coriander',
    butterCube = false,
  } = {},
) {
  const b = bowl(ctx, 148, { ...BOWLS[bowlStyle] });
  const sauce = ctx.radial(
    [
      [0, lighten(gravy, 0.18)],
      [0.7, gravy],
      [1, darken(gravy, 0.18)],
    ],
    { fx: 0.42, fy: 0.4 },
  );
  const parts = [el('circle', { r: b.inner + 4, fill: sauce })];
  // Oil glisten near the edge, typical of a good curry.
  for (let i = 0; i < 16; i++) {
    const a = rng.range(0, Math.PI * 2);
    const d = b.inner * rng.range(0.78, 0.95);
    parts.push(
      el('circle', {
        cx: Math.cos(a) * d,
        cy: Math.sin(a) * d,
        r: rng.range(2, 5),
        fill: darken(gravy, 0.05),
        stroke: lighten(gravy, 0.35),
        'stroke-width': 0.8,
        opacity: 0.8,
      }),
    );
  }
  if (chunks === 'dal') {
    parts.push(
      dots(rng, 140, 0, 0, b.inner * 0.9, [darken(gravy, 0.15), lighten(gravy, 0.12)], 2.2),
    );
  } else if (chunks !== 'none') {
    const draw = CURRY_CHUNKS[chunks];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rng.range(-0.3, 0.3);
      const d = b.inner * (i % 3 === 0 ? 0.18 : 0.55);
      parts.push(draw(ctx, rng, Math.cos(a) * d, Math.sin(a) * d));
    }
  }
  if (cream)
    parts.push(creamSwirl(rng.range(-8, 8), rng.range(-8, 8), b.inner * 0.5, { width: 5 }));
  if (butterCube) parts.push(butter(ctx, 18, -22, 18));
  if (finish === 'coriander') parts.push(corianderScatter(rng, 9, 0, 0, b.inner * 0.75, 6.5));
  if (finish === 'tadka') {
    parts.push(dots(rng, 40, 0, 0, b.inner * 0.5, ['#3a2410', '#5a3818'], 1.6));
    parts.push(chili(-20, -10, 34, 20, '#a8221a'), chili(15, 15, 30, -150, '#b62a1d'));
    parts.push(corianderScatter(rng, 5, 0, 0, b.inner * 0.6, 6));
  }
  if (finish === 'curryleaf') {
    for (let i = 0; i < 6; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.6);
      parts.push(leaf(x, y, 22, 9, rng.int(0, 360), '#2d6b2a'));
    }
    parts.push(chili(-30, 20, 30, -40, '#a8221a'));
  }
  if (finish === 'onions') {
    parts.push(friedOnions(rng, 35, 0, 0, b.inner * 0.55));
    parts.push(lemonWedge(ctx, 45, -40, 18, 30));
    for (let i = 0; i < 4; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.5);
      parts.push(leaf(x, y, 12, 7, rng.int(0, 360), '#2f9e57'));
    }
  }
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

function dosaRoll(ctx, rng, len, thick) {
  const fill = ctx.linear([
    [0, '#f6c66c'],
    [0.5, '#e4a347'],
    [1, '#c97d2a'],
  ]);
  const parts = [
    dropShadow(0, 6, len / 2, thick * 0.6, 0.25),
    el('path', {
      d: `M${-len / 2},${-thick / 2} L${len / 2 - thick * 0.3},${-thick * 0.32} Q${len / 2},0 ${len / 2 - thick * 0.3},${thick * 0.32} L${-len / 2},${thick / 2} Z`,
      fill,
    }),
  ];
  // Lacy, crispy browning across the dosa.
  for (let i = 0; i < 26; i++) {
    const x = rng.range(-len / 2 + 8, len / 2 - 20);
    const y = rng.range(-thick * 0.35, thick * 0.35);
    parts.push(
      el('path', {
        d: blobPath(rng, x, y, rng.range(3, 8), {
          points: 5,
          wobble: 0.5,
          ry: rng.range(1.5, 3.5),
        }),
        fill: '#a8601f',
        opacity: 0.5,
      }),
    );
  }
  // Open end showing the potato masala inside.
  parts.push(
    el('ellipse', { cx: -len / 2, cy: 0, rx: thick * 0.22, ry: thick / 2, fill: '#f0b85a' }),
    el('ellipse', { cx: -len / 2 + 2, cy: 0, rx: thick * 0.15, ry: thick * 0.38, fill: '#e9b730' }),
    dots(rng, 8, -len / 2 + 2, 0, thick * 0.25, ['#f6d04d', '#3d8b2f', '#d9a520'], 2),
    el('path', {
      d: `M${-len / 2 + 10},${-thick * 0.32} L${len / 2 - 30},${-thick * 0.22}`,
      stroke: '#fff3c4',
      'stroke-width': 3,
      opacity: 0.6,
      'stroke-linecap': 'round',
    }),
  );
  return parts.join('');
}

export function dosa(ctx, rng) {
  const p = steelPlate(ctx, 152);
  return [
    p.svg,
    g({ transform: 'rotate(-18) translate(0 -38)' }, dosaRoll(ctx, rng, 270, 62)),
    katori(ctx, rng, -70, 70, 38, '#d9772f', {
      bits: [
        { count: 10, color: '#f2c14e', size: 6 },
        { count: 6, color: '#6aa84f', size: 5 },
      ],
    }),
    katori(ctx, rng, 15, 92, 32, '#f6f1e3', {
      bits: [
        { count: 18, color: '#3a2410', size: 1.4, shape: 'dot' },
        { count: 3, color: '#3d7a2a', size: 6 },
      ],
    }),
    katori(ctx, rng, 88, 50, 30, '#d8492a', {
      bits: [{ count: 12, color: '#3a2410', size: 1.2, shape: 'dot' }],
    }),
  ].join('');
}

export function idliVada(ctx, rng) {
  const p = steelPlate(ctx, 152);
  const idli = (x, y) => {
    const fill = ctx.radial(
      [
        [0, '#ffffff'],
        [0.75, '#f7f4ec'],
        [1, '#e2dccd'],
      ],
      { fx: 0.4, fy: 0.35 },
    );
    return (
      contactShadow(x, y, 36, 32) +
      el('ellipse', { cx: x, cy: y, rx: 36, ry: 32, fill }) +
      dots(rng, 25, x, y, 26, ['#e8e1d2', '#efe9dc'], 1.1)
    );
  };
  const vada = (x, y) => {
    const fill = ctx.radial(
      [
        [0, '#e8a24a'],
        [0.6, '#c87a2a'],
        [1, '#8c4a16'],
      ],
      { fx: 0.4, fy: 0.35 },
    );
    return (
      contactShadow(x, y, 38, 36) +
      el('path', { d: blobPath(rng, x, y, 38, { points: 9, wobble: 0.06 }), fill }) +
      el('circle', { cx: x, cy: y, r: 10, fill: '#d5dbe1' }) +
      el('circle', { cx: x, cy: y, r: 10, fill: 'none', stroke: '#6b3510', 'stroke-width': 3 }) +
      dots(rng, 14, x, y, 30, ['#6b3510', '#f0b860'], 1.6)
    );
  };
  return [
    p.svg,
    idli(-55, -55),
    idli(20, -75),
    idli(-80, 15),
    vada(50, -5),
    katori(ctx, rng, -25, 85, 38, '#d9772f', {
      bits: [
        { count: 10, color: '#f2c14e', size: 6 },
        { count: 5, color: '#6aa84f', size: 5 },
      ],
    }),
    katori(ctx, rng, 70, 80, 30, '#f6f1e3', {
      bits: [
        { count: 18, color: '#3a2410', size: 1.4, shape: 'dot' },
        { count: 3, color: '#3d7a2a', size: 6 },
      ],
    }),
  ].join('');
}

export function tikka(ctx, rng, { kind = 'chicken' } = {}) {
  const p = plate(ctx, 150, { color: '#2e2b29' });
  const parts = [p.svg];
  // Bed of onion rings and shredded cabbage.
  for (let i = 0; i < 7; i++) {
    const [x, y] = rng.inCircle(p.inner * 0.7);
    parts.push(onionRing(x, y, rng.range(12, 18), rng.int(0, 180)));
  }
  if (kind === 'seekh') {
    for (const dy of [-38, 0, 38]) {
      parts.push(
        g({ transform: `translate(0 ${dy}) rotate(${rng.range(-8, 8)})` }, [
          contactShadow(0, 0, 90, 14),
          el('rect', {
            x: -88,
            y: -13,
            width: 176,
            height: 26,
            rx: 13,
            fill: ctx.linear([
              [0, '#b56a36'],
              [0.5, '#8a4a22'],
              [1, '#5e2d12'],
            ]),
          }),
          ...[-60, -30, 0, 30, 60].map((x) =>
            el('path', {
              d: `M${x},-12 q4,12 0,24`,
              stroke: '#3a1a08',
              'stroke-width': 3,
              fill: 'none',
              opacity: 0.55,
            }),
          ),
          el('rect', {
            x: -80,
            y: -9,
            width: 150,
            height: 4,
            rx: 2,
            fill: '#e3a06a',
            opacity: 0.5,
          }),
        ]),
      );
    }
  } else {
    const positions = [
      [-55, -40],
      [-5, -55],
      [45, -30],
      [-45, 15],
      [10, 5],
      [55, 25],
      [-15, 55],
    ];
    for (const [x, y] of positions) {
      parts.push(
        kind === 'paneer'
          ? cube(ctx, x, y, 28, '#f3ad66', rng.int(-25, 25), { char: true })
          : chunk(
              ctx,
              rng,
              x,
              y,
              rng.range(20, 25),
              kind === 'fish' ? '#e48a3e' : PROTEIN.tandoori,
              { char: 0.9 },
            ),
      );
    }
    if (kind === 'paneer') {
      for (let i = 0; i < 6; i++) {
        const [x, y] = rng.inCircle(p.inner * 0.65);
        parts.push(
          cube(ctx, x, y, 14, rng.pick(['#4c9a3a', '#d63a2a', '#e8c13a']), rng.int(0, 90)),
        );
      }
    }
  }
  parts.push(lemonWedge(ctx, 75, 60, 20, -30));
  parts.push(
    katori(ctx, rng, -88, 62, 26, '#5fae4a', {
      bits: [{ count: 8, color: '#f6f1e3', size: 1.5, shape: 'dot' }],
    }),
  );
  parts.push(corianderScatter(rng, 6, 0, 0, p.inner * 0.6, 6));
  return parts.join('');
}

export function naanBasket(ctx, rng, { kind = 'butter' } = {}) {
  const basketFill = ctx.radial([
    [0, '#d9b07a'],
    [1, '#9c6b38'],
  ]);
  const parts = [dropShadow(0, 0, 150), el('circle', { r: 150, fill: basketFill })];
  for (let i = 0; i < 12; i++)
    parts.push(
      el('circle', {
        r: 150 - i * 4,
        fill: 'none',
        stroke: '#7a4f24',
        'stroke-width': 1.2,
        opacity: 0.4,
      }),
    );
  parts.push(el('circle', { r: 138, fill: '#f7f1e6' }));
  parts.push(
    flatbread(ctx, rng, -25, -20, 85, {
      ry: 105,
      rot: -30,
      butter: kind !== 'roti',
      color: kind === 'roti' ? '#e3b980' : '#efc987',
    }),
    flatbread(ctx, rng, 30, 25, 82, {
      ry: 100,
      rot: 25,
      butter: kind !== 'roti',
      color: kind === 'roti' ? '#e0b57b' : '#f0cb8c',
    }),
  );
  if (kind === 'garlic') {
    parts.push(
      corianderScatter(rng, 14, 20, 20, 60, 5),
      dots(rng, 24, 20, 20, 60, ['#fff8e6', '#f3e6c4'], 2.2),
    );
  }
  return parts.join('');
}

export function paratha(ctx, rng, { side = 'curd' } = {}) {
  const p = plate(ctx, 150);
  return [
    p.svg,
    flatbread(ctx, rng, -18, -10, 88, { ry: 86, layers: true, color: '#e9b866', spots: 18 }),
    butter(ctx, -20, -18, 24),
    katori(ctx, rng, 78, 70, 32, side === 'curd' ? '#fbf8f0' : '#d65a22', { bowlColor: 'steel' }),
    katori(ctx, rng, 98, -10, 24, '#c2401c', { bits: [{ count: 6, color: '#e9a63a', size: 5 }] }),
  ].join('');
}

export function pavBhaji(ctx, rng) {
  const p = plate(ctx, 152);
  const bhajiFill = ctx.radial(
    [
      [0, '#e96d3a'],
      [0.8, '#c9471f'],
      [1, '#a8361a'],
    ],
    { fx: 0.4, fy: 0.4 },
  );
  const pav = (x, y, rot) => {
    const fill = ctx.radial(
      [
        [0, '#f6c77a'],
        [0.7, '#df9a48'],
        [1, '#b46b25'],
      ],
      { fx: 0.4, fy: 0.35 },
    );
    return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
      contactShadow(0, 0, 60, 34),
      el('rect', { x: -58, y: -32, width: 56, height: 64, rx: 24, fill }),
      el('rect', { x: 2, y: -32, width: 56, height: 64, rx: 24, fill }),
      el('ellipse', { cx: -30, cy: -12, rx: 16, ry: 8, fill: '#fff4cf', opacity: 0.45 }),
      el('ellipse', { cx: 30, cy: -12, rx: 16, ry: 8, fill: '#fff4cf', opacity: 0.45 }),
    ]);
  };
  return [
    p.svg,
    contactShadow(-28, -28, 72, 66),
    el('path', { d: blobPath(rng, -28, -28, 72, { points: 9, wobble: 0.1 }), fill: bhajiFill }),
    dots(rng, 40, -28, -28, 60, ['#8f2a12', '#f08a50', '#5a9a3a'], 2.4),
    butter(ctx, -30, -40, 24),
    corianderScatter(rng, 8, -28, -28, 55, 6),
    pav(40, 70, -20),
    lemonWedge(ctx, 85, -40, 20, 40),
    ...Array.from({ length: 5 }, () =>
      onionRing(rng.range(55, 105), rng.range(-5, 25), 9, rng.int(0, 180)),
    ),
  ].join('');
}

export function thali(ctx, rng) {
  const p = steelPlate(ctx, 155);
  const ring = [
    ['#f0b429', [{ count: 6, color: '#3d8b2f', size: 4 }]],
    ['#e2622b', [{ count: 6, color: '#fff1d2', size: 8 }]],
    ['#5f9e3a', [{ count: 6, color: '#fff1d2', size: 7 }]],
    ['#fbf6ea', []],
    ['#f4d36b', [{ count: 10, color: '#3a2410', size: 1.2, shape: 'dot' }]],
    ['#8a3a18', [{ count: 4, color: '#5a1d0b', size: 10 }]],
  ];
  const parts = [p.svg];
  ring.forEach(([color, bits], i) => {
    const a = Math.PI * 1.05 + (i / (ring.length - 1)) * Math.PI * 0.95;
    parts.push(katori(ctx, rng, Math.cos(a) * 102, Math.sin(a) * 102, 30, color, { bits }));
  });
  const riceFill = ctx.radial([
    [0, '#ffffff'],
    [1, '#efe7d6'],
  ]);
  parts.push(
    contactShadow(-30, 50, 48, 38),
    el('path', { d: blobPath(rng, -30, 50, 48, { ry: 38, wobble: 0.08 }), fill: riceFill }),
    grains(rng, 120, -30, 50, 42, RICE, { len: 5.5, width: 2 }),
  );
  parts.push(flatbread(ctx, rng, 45, 38, 42, { color: '#e3b980', spots: 8 }));
  parts.push(flatbread(ctx, rng, 55, 55, 42, { color: '#e6be86', spots: 8 }));
  parts.push(lemonWedge(ctx, -5, 105, 14, 10), chili(15, 100, 28, -20));
  return parts.join('');
}

export function chaat(ctx, rng, { kind = 'papdi' } = {}) {
  const p = plate(ctx, 150, { color: kind === 'panipuri' ? '#f7f3ea' : '#ffffff' });
  const parts = [p.svg];
  if (kind === 'panipuri') {
    const puri = (x, y) => {
      const fill = ctx.radial(
        [
          [0, '#f9d48a'],
          [0.7, '#e2a64e'],
          [1, '#b8772a'],
        ],
        { fx: 0.35, fy: 0.3 },
      );
      return (
        contactShadow(x, y, 25, 25) +
        el('circle', { cx: x, cy: y, r: 25, fill }) +
        el('ellipse', { cx: x + 3, cy: y - 2, rx: 11, ry: 9, fill: '#c98f3c' }) +
        dots(rng, 4, x + 3, y - 2, 7, ['#e8b83a', '#6b3a18', '#58a83a'], 2.2)
      );
    };
    for (const [x, y] of [
      [-60, -50],
      [-5, -70],
      [50, -45],
      [-75, 5],
      [-25, -10],
      [-50, 55],
    ])
      parts.push(puri(x, y));
    parts.push(
      katori(ctx, rng, 50, 35, 42, '#8bc34a', {
        bowlColor: 'clay',
        bits: [
          { count: 6, color: '#2f7d32', size: 6 },
          { count: 12, color: '#d7e9b8', size: 1.6, shape: 'dot' },
        ],
      }),
    );
    parts.push(katori(ctx, rng, 15, 100, 24, '#6d3a1c', { bowlColor: 'clay' }));
  } else if (kind === 'samosa') {
    const samosa = (x, y, rot) => {
      const fill = ctx.radial(
        [
          [0, '#f3c26e'],
          [0.75, '#d99539'],
          [1, '#a8661f'],
        ],
        { fx: 0.4, fy: 0.35 },
      );
      return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
        contactShadow(0, 6, 46, 36),
        el('path', {
          d: 'M0,-50 C10,-48 46,22 44,32 C42,40 -42,40 -44,32 C-46,22 -10,-48 0,-50Z',
          fill,
        }),
        dots(rng, 22, 0, 8, 30, ['#f7d79a', '#b8772a'], 1.8),
        el('path', { d: 'M0,-46 L0,30', stroke: '#b8772a', 'stroke-width': 2, opacity: 0.5 }),
      ]);
    };
    parts.push(samosa(-45, -30, -15), samosa(30, -45, 20), samosa(-10, 40, 190));
    parts.push(
      katori(ctx, rng, 75, 45, 26, '#5fae4a'),
      katori(ctx, rng, 75, -5 + 100, 22, '#7a3b1a'),
    );
    for (let i = 0; i < 4; i++)
      parts.push(onionRing(rng.range(-100, -60), rng.range(30, 80), 9, rng.int(0, 180)));
    parts.push(chili(-95, -80, 34, 40));
  } else {
    // Papdi chaat: crisp papdi under yoghurt with chutneys, sev and pomegranate.
    for (let i = 0; i < 9; i++) {
      const [x, y] = rng.inCircle(p.inner * 0.75);
      parts.push(
        el('circle', {
          cx: x,
          cy: y,
          r: 22,
          fill: '#e8b25a',
          stroke: '#c58b38',
          'stroke-width': 2,
        }),
      );
    }
    parts.push(
      el('path', {
        d: blobPath(rng, 0, 0, p.inner * 0.72, { points: 10, wobble: 0.12 }),
        fill: '#fffcf3',
        opacity: 0.95,
      }),
    );
    for (let i = 0; i < 4; i++) {
      parts.push(
        el('path', {
          d: `M${rng.range(-70, -30)},${rng.range(-70, 70)} C${rng.range(-20, 20)},${rng.range(-70, 70)} ${rng.range(0, 40)},${rng.range(-70, 70)} ${rng.range(40, 75)},${rng.range(-60, 60)}`,
          stroke: i % 2 ? '#6d3a1c' : '#4f9a3a',
          'stroke-width': 5,
          fill: 'none',
          'stroke-linecap': 'round',
          opacity: 0.9,
        }),
      );
    }
    parts.push(
      grains(rng, 160, 0, 0, p.inner * 0.65, ['#f5c542', '#e8a922'], { len: 3.5, width: 1.1 }),
    );
    parts.push(dots(rng, 26, 0, 0, p.inner * 0.65, ['#c2182b', '#e0303f'], 3));
    parts.push(corianderScatter(rng, 7, 0, 0, p.inner * 0.6, 6));
  }
  return parts.join('');
}

export function dhokla(ctx, rng) {
  const p = plate(ctx, 150);
  const parts = [p.svg];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = (col - 1) * 52 + rng.range(-3, 3);
      const y = (row - 1) * 52 + rng.range(-3, 3);
      parts.push(cube(ctx, x, y, 46, '#f3cf55', rng.int(-6, 6)));
      parts.push(dots(rng, 6, x, y, 16, ['#2a1a0a'], 1.5));
    }
  }
  for (let i = 0; i < 5; i++) {
    const [x, y] = rng.inCircle(85);
    parts.push(chili(x, y, 26, rng.int(0, 360), '#3e9a3a'));
  }
  parts.push(dots(rng, 30, 0, 0, 95, ['#ffffff', '#f6f1e3'], 2.2));
  parts.push(corianderScatter(rng, 8, 0, 0, 90, 6));
  return parts.join('');
}

export function appam(ctx, rng) {
  const p = plate(ctx, 150);
  const hopper = (x, y) => {
    const fill = ctx.radial([
      [0, '#fffdf7'],
      [0.55, '#f7efdc'],
      [0.8, '#e8c88f'],
      [1, '#c99a52'],
    ]);
    return (
      contactShadow(x, y, 58, 58) +
      el('circle', { cx: x, cy: y, r: 58, fill }) +
      dots(rng, 30, x, y, 54, ['#d8b06a', '#e9cd95'], 1.6) +
      el('circle', { cx: x, cy: y, r: 26, fill: '#fffef9' })
    );
  };
  return [
    p.svg,
    hopper(-45, -40),
    hopper(35, -55),
    katori(ctx, rng, 15, 62, 50, '#f7eedb', {
      bowlColor: 'clay',
      bits: [
        { count: 6, color: '#f08a24', size: 9 },
        { count: 6, color: '#7fb04a', size: 7 },
        { count: 4, color: '#2d6b2a', size: 8 },
      ],
    }),
  ].join('');
}

export function sweetsBowl(ctx, rng, { kind = 'gulab-jamun' } = {}) {
  const b = bowl(ctx, 140, { ...BOWLS[kind === 'gulab-jamun' ? 'white' : 'clay'] });
  const parts = [];
  if (kind === 'gulab-jamun') {
    parts.push(
      el('circle', {
        r: b.inner,
        fill: ctx.radial([
          [0, '#f2b45a'],
          [1, '#c6782a'],
        ]),
      }),
    );
    for (const [x, y] of [
      [-35, -30],
      [32, -35],
      [-30, 35],
      [35, 30],
    ]) {
      const fill = ctx.radial(
        [
          [0, '#b8551f'],
          [0.65, '#7a2f10'],
          [1, '#4a1a08'],
        ],
        { fx: 0.35, fy: 0.3 },
      );
      parts.push(
        contactShadow(x, y, 36, 36),
        el('circle', { cx: x, cy: y, r: 36, fill }),
        el('ellipse', {
          cx: x - 12,
          cy: y - 14,
          rx: 10,
          ry: 6,
          fill: '#fff',
          opacity: 0.4,
          transform: `rotate(-35 ${x} ${y})`,
        }),
      );
    }
    parts.push(grains(rng, 20, 0, 0, 70, ['#8fbf4a', '#a6cf5a'], { len: 5, width: 1.8 }));
  } else {
    // Rasmalai / kheer: saffron milk with pistachio and almond slivers.
    parts.push(
      el('circle', {
        r: b.inner,
        fill: ctx.radial([
          [0, '#fff6d8'],
          [1, '#f3d98f'],
        ]),
      }),
    );
    if (kind === 'rasmalai') {
      for (const [x, y] of [
        [-30, -25],
        [30, -25],
        [0, 35],
      ]) {
        parts.push(
          contactShadow(x, y, 34, 30),
          el('ellipse', {
            cx: x,
            cy: y,
            rx: 34,
            ry: 30,
            fill: ctx.radial([
              [0, '#fffdf5'],
              [1, '#f1e6c8'],
            ]),
          }),
        );
      }
    } else {
      parts.push(
        grains(rng, 160, 0, 0, b.inner * 0.9, ['#fffaf0', '#f8efd5'], { len: 4, width: 1.6 }),
      );
    }
    parts.push(
      grains(rng, 22, 0, 0, b.inner * 0.7, ['#8fbf4a', '#a6cf5a'], { len: 5, width: 1.8 }),
    );
    parts.push(grains(rng, 10, 0, 0, b.inner * 0.7, ['#f3e2c0'], { len: 7, width: 2.4 }));
    for (let i = 0; i < 12; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.7);
      parts.push(
        el('path', {
          d: `M${x},${y} q4,-6 9,-2`,
          stroke: '#e0561c',
          'stroke-width': 1.2,
          fill: 'none',
        }),
      );
    }
  }
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function raita(ctx, rng) {
  return katori(ctx, rng, 0, 0, 60, '#fbf8f0', {
    bowlColor: 'clay',
    bits: [
      { count: 10, color: '#7fb04a', size: 5 },
      { count: 20, color: '#6b3a18', size: 1.2, shape: 'dot' },
    ],
  });
}

export { coriander };
