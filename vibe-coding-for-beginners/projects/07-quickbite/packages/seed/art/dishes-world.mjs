// Pizza, burgers, Chinese, pan-Asian, Middle Eastern, café: drawn top-down around (0, 0).
import {
  BOWLS,
  bowl,
  chili,
  chunk,
  contactShadow,
  corianderScatter,
  creamSwirl,
  cube,
  dots,
  dropShadow,
  grains,
  katori,
  leaf,
  lemonWedge,
  onionRing,
  plate,
  sesame,
} from './primitives.mjs';
import { blobPath, darken, el, g, lighten } from './svg.mjs';

function woodBoard(ctx, rng, r) {
  const fill = ctx.radial(
    [
      [0, '#d9a56b'],
      [0.85, '#bf8650'],
      [1, '#93602f'],
    ],
    { fx: 0.4, fy: 0.35 },
  );
  const parts = [dropShadow(0, 0, r), el('circle', { r, fill })];
  for (let i = 0; i < 9; i++) {
    const y = -r + (i + 0.5) * ((2 * r) / 9);
    parts.push(
      el('path', {
        d: `M${-r},${y} C${-r / 3},${y + rng.range(-8, 8)} ${r / 3},${y + rng.range(-8, 8)} ${r},${y}`,
        stroke: '#8a5a2b',
        'stroke-width': 1,
        fill: 'none',
        opacity: 0.25,
      }),
    );
  }
  return g({ 'clip-path': ctx.clip(el('circle', { r })) }, parts);
}

export function pizza(ctx, rng, { toppings = 'margherita' } = {}) {
  const crust = ctx.radial([
    [0.8, '#f0c37a'],
    [0.93, '#d9953f'],
    [1, '#a9662a'],
  ]);
  const sauce = ctx.radial([
    [0, '#e2512f'],
    [1, '#b8301a'],
  ]);
  const parts = [
    woodBoard(ctx, rng, 155),
    contactShadow(0, 0, 138, 138),
    el('circle', { r: 138, fill: crust }),
  ];
  parts.push(dots(rng, 30, 0, 0, 136, ['#a9662a', '#8a4f1c'], 2.4));
  parts.push(el('circle', { r: 118, fill: sauce }));
  // One melted cheese layer with sauce peeking through at the edges, then golden blisters.
  const cheese = ctx.radial(
    [
      [0, '#fff3c8'],
      [0.7, '#fbe38f'],
      [1, '#f2c75e'],
    ],
    { fx: 0.42, fy: 0.4 },
  );
  parts.push(
    el('path', { d: blobPath(rng, 0, 0, 106, { points: 16, wobble: 0.08 }), fill: cheese }),
  );
  for (let i = 0; i < 9; i++) {
    const [x, y] = rng.inCircle(85);
    parts.push(
      el('path', {
        d: blobPath(rng, x, y, rng.range(5, 10), { points: 6, wobble: 0.3 }),
        fill: '#d0452a',
        opacity: 0.8,
      }),
    );
  }
  parts.push(dots(rng, 22, 0, 0, 100, ['#d98a2b', '#c47321'], 3));
  const add = (n, fn) => {
    for (let i = 0; i < n; i++) {
      const [x, y] = rng.inCircle(98);
      parts.push(fn(x, y, rng.int(0, 360)));
    }
  };
  if (toppings === 'pepperoni') {
    add(
      14,
      (x, y) =>
        contactShadow(x, y, 15, 15) +
        el('circle', {
          cx: x,
          cy: y,
          r: 15,
          fill: ctx.radial([
            [0, '#c53a2a'],
            [1, '#8f1f14'],
          ]),
        }) +
        dots(rng, 4, x, y, 10, ['#e0705a'], 1.6),
    );
  }
  if (toppings === 'veggie' || toppings === 'paneer' || toppings === 'chicken') {
    add(10, (x, y, r) =>
      el('path', {
        d: `M${x},${y} a12,12 0 0 1 22,4`,
        stroke: '#3f9a3a',
        'stroke-width': 5,
        fill: 'none',
        'stroke-linecap': 'round',
        transform: `rotate(${r} ${x} ${y})`,
      }),
    );
    add(8, (x, y, r) => onionRing(x, y, 9, r, '#9b4f96'));
    add(16, (x, y) => el('circle', { cx: x, cy: y, r: 3.5, fill: '#f6c331' }));
    add(9, (x, y) =>
      el('circle', { cx: x, cy: y, r: 6, fill: 'none', stroke: '#2a2a2a', 'stroke-width': 3.5 }),
    );
  }
  if (toppings === 'paneer') add(9, (x, y, r) => cube(ctx, x, y, 15, '#f2a35c', r, { char: true }));
  if (toppings === 'chicken') add(9, (x, y) => chunk(ctx, rng, x, y, 10, '#b5541f', { char: 0.6 }));
  if (toppings === 'margherita' || toppings === 'pepperoni')
    add(toppings === 'margherita' ? 8 : 5, (x, y, r) => leaf(x, y, 24, 15, r, '#2f8a3a'));
  // Slice cuts.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + 0.3;
    parts.push(
      el('line', {
        x1: Math.cos(a) * 138,
        y1: Math.sin(a) * 138,
        x2: -Math.cos(a) * 138,
        y2: -Math.sin(a) * 138,
        stroke: '#7a3a14',
        'stroke-width': 2,
        opacity: 0.35,
      }),
    );
  }
  return parts.join('');
}

function fryPile(ctx, rng, x, y, r, n = 22) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = rng.inCircle(r);
    const fill = ctx.linear(
      [
        [0, '#ffd56a'],
        [1, '#e6a43a'],
      ],
      { x2: 1, y2: 0 },
    );
    out.push(
      g({ transform: `translate(${x + dx} ${y + dy}) rotate(${rng.int(0, 180)})` }, [
        contactShadow(0, 0, 24, 5),
        el('rect', { x: -24, y: -5, width: 48, height: 10, rx: 3, fill }),
        el('rect', { x: 18, y: -5, width: 6, height: 10, rx: 2, fill: '#c98a2e', opacity: 0.6 }),
      ]),
    );
  }
  return out.join('');
}

export function burger(ctx, rng, { kind = 'classic' } = {}) {
  const p = plate(ctx, 152, { color: '#f4f1ec' });
  const bun = ctx.radial(
    [
      [0, '#f6c169'],
      [0.6, '#e09a3c'],
      [1, '#a9621f'],
    ],
    { fx: 0.38, fy: 0.32 },
  );
  const parts = [p.svg];
  parts.push(fryPile(ctx, rng, 70, 55, 40, 16));
  // Lettuce frill and cheese corners peeking out from under the bun.
  parts.push(contactShadow(-25, -20, 92, 92));
  parts.push(
    el('path', { d: blobPath(rng, -25, -20, 92, { points: 16, wobble: 0.07 }), fill: '#6cbf3c' }),
  );
  if (kind !== 'veg-crispy') {
    parts.push(
      g(
        { transform: 'translate(-25 -20) rotate(20)' },
        el('rect', { x: -72, y: -72, width: 144, height: 144, rx: 12, fill: '#f8c22c' }),
      ),
    );
  }
  if (kind === 'chicken')
    parts.push(
      el('path', {
        d: blobPath(rng, -25, -20, 94, { points: 12, wobble: 0.1 }),
        fill: '#d9932f',
        opacity: 0.9,
      }),
    );
  parts.push(el('circle', { cx: -25, cy: -20, r: 82, fill: bun }));
  parts.push(sesame(rng, 46, -25, -20, 62, '#fff4d6'));
  parts.push(
    el('ellipse', {
      cx: -50,
      cy: -50,
      rx: 30,
      ry: 16,
      fill: '#fff',
      opacity: 0.25,
      transform: 'rotate(-35 -50 -50)',
    }),
  );
  parts.push(katori(ctx, rng, 95, -55, 26, '#c8281e'));
  return parts.join('');
}

export function fries(ctx, rng) {
  const parts = [dropShadow(0, 0, 130, 130)];
  // Paper-lined basket.
  parts.push(el('rect', { x: -130, y: -130, width: 260, height: 260, rx: 30, fill: '#c0392b' }));
  const check = [];
  for (let i = 0; i < 10; i++)
    for (let j = 0; j < 10; j++)
      if ((i + j) % 2 === 0)
        check.push(
          el('rect', {
            x: -120 + i * 24,
            y: -120 + j * 24,
            width: 24,
            height: 24,
            fill: '#ffffff',
            opacity: 0.9,
          }),
        );
  parts.push(
    g(
      { 'clip-path': ctx.clip(el('rect', { x: -120, y: -120, width: 240, height: 240, rx: 22 })) },
      [el('rect', { x: -120, y: -120, width: 240, height: 240, fill: '#e74c3c' }), ...check],
    ),
  );
  parts.push(fryPile(ctx, rng, -10, -5, 75, 40));
  parts.push(katori(ctx, rng, 78, 80, 34, '#c8281e'));
  return parts.join('');
}

function noodleStrands(rng, n, r, color) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [x, y] = rng.inCircle(r * 0.7);
    const a = rng.range(0, Math.PI);
    const len = rng.range(50, 110);
    const dx = Math.cos(a) * len;
    const dy = Math.sin(a) * len;
    const w = rng.range(-30, 30);
    const d = `M${x - dx / 2},${y - dy / 2} C${x - dx / 4 + w},${y - dy / 4 - w} ${x + dx / 4 - w},${y + dy / 4 + w} ${x + dx / 2},${y + dy / 2}`;
    out.push(
      el('path', {
        d,
        stroke: darken(color, 0.2),
        'stroke-width': 5.5,
        fill: 'none',
        'stroke-linecap': 'round',
      }),
    );
    out.push(
      el('path', { d, stroke: color, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
    );
    out.push(
      el('path', {
        d,
        stroke: lighten(color, 0.5),
        'stroke-width': 1.2,
        fill: 'none',
        'stroke-linecap': 'round',
        opacity: 0.6,
      }),
    );
  }
  return out.join('');
}

function veggieBits(rng, r, count = 12) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const [x, y] = rng.inCircle(r);
    const kind = rng.int(0, 2);
    const color = ['#f08a24', '#7cc04a', '#e23b2e'][kind];
    out.push(
      el('rect', {
        x,
        y,
        width: rng.range(14, 22),
        height: 4.5,
        rx: 2,
        fill: color,
        transform: `rotate(${rng.int(0, 180)} ${x} ${y})`,
      }),
    );
  }
  for (let i = 0; i < 10; i++) {
    const [x, y] = rng.inCircle(r);
    out.push(
      el('circle', { cx: x, cy: y, r: 4, fill: 'none', stroke: '#4caf50', 'stroke-width': 2.4 }),
    );
  }
  return out.join('');
}

function chopsticks() {
  return g({ transform: 'rotate(-38)' }, [
    contactShadow(0, 0, 170, 5),
    el('rect', { x: -175, y: -12, width: 350, height: 7, rx: 3.5, fill: '#2b2420' }),
    el('rect', { x: -175, y: 4, width: 350, height: 7, rx: 3.5, fill: '#2b2420' }),
    el('rect', { x: 100, y: -12, width: 75, height: 7, rx: 3.5, fill: '#b23a2a' }),
    el('rect', { x: 100, y: 4, width: 75, height: 7, rx: 3.5, fill: '#b23a2a' }),
  ]);
}

export function noodles(ctx, rng, { color = '#e6b765', protein = 'veg' } = {}) {
  const b = bowl(ctx, 146, BOWLS.black);
  const parts = [
    el('circle', { r: b.inner + 4, fill: darken(color, 0.35) }),
    noodleStrands(rng, 70, b.inner, color),
    veggieBits(rng, b.inner * 0.75),
  ];
  if (protein === 'chicken')
    for (let i = 0; i < 6; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.6);
      parts.push(chunk(ctx, rng, x, y, 12, '#c98a4a', { ry: 7, char: 0.2 }));
    }
  if (protein === 'egg')
    for (let i = 0; i < 7; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.6);
      parts.push(el('path', { d: blobPath(rng, x, y, 10, { wobble: 0.35 }), fill: '#ffd84d' }));
    }
  return b.svg + g({ 'clip-path': b.clip }, parts) + chopsticks();
}

export function friedRice(ctx, rng, { tint = '#efd9a8', protein = 'veg' } = {}) {
  const b = bowl(ctx, 146, BOWLS.white);
  const parts = [
    el('circle', { r: b.inner + 4, fill: darken(tint, 0.08) }),
    grains(rng, 520, 0, 0, b.inner, [tint, lighten(tint, 0.4), darken(tint, 0.08)]),
  ];
  parts.push(dots(rng, 22, 0, 0, b.inner * 0.85, ['#58a83a', '#4c9a30'], 4));
  parts.push(veggieBits(rng, b.inner * 0.8, 8));
  if (protein === 'egg' || protein === 'chicken')
    for (let i = 0; i < 8; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.7);
      parts.push(el('path', { d: blobPath(rng, x, y, 9, { wobble: 0.4 }), fill: '#ffd84d' }));
    }
  if (protein === 'chicken')
    for (let i = 0; i < 6; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.6);
      parts.push(chunk(ctx, rng, x, y, 11, '#d3a067', { char: 0.1 }));
    }
  return b.svg + g({ 'clip-path': b.clip }, parts) + chopsticks();
}

export function indoChinese(ctx, rng, { piece = 'ball', sauce = '#6b2410' } = {}) {
  const b = bowl(ctx, 146, BOWLS.white);
  const glaze = ctx.radial([
    [0, lighten(sauce, 0.25)],
    [1, darken(sauce, 0.2)],
  ]);
  const parts = [el('circle', { r: b.inner + 4, fill: glaze })];
  const positions = [
    [-45, -40],
    [10, -55],
    [55, -15],
    [-55, 15],
    [0, 0],
    [40, 40],
    [-20, 55],
    [-60, -5],
  ];
  for (const [x, y] of positions) {
    if (piece === 'paneer') parts.push(cube(ctx, x, y, 28, '#d8803a', rng.int(-30, 30)));
    else
      parts.push(
        chunk(
          ctx,
          rng,
          x,
          y,
          piece === 'ball' ? 22 : 20,
          piece === 'ball' ? '#7a3010' : '#a8421c',
          { char: 0.2 },
        ),
      );
  }
  for (let i = 0; i < 10; i++) {
    const [x, y] = rng.inCircle(b.inner * 0.75);
    parts.push(cube(ctx, x, y, 15, rng.pick(['#3f9a3a', '#e8c13a', '#d63a2a']), rng.int(0, 90)));
  }
  for (let i = 0; i < 14; i++) {
    const [x, y] = rng.inCircle(b.inner * 0.8);
    parts.push(
      el('circle', { cx: x, cy: y, r: 4, fill: 'none', stroke: '#66bb3a', 'stroke-width': 2.6 }),
    );
  }
  parts.push(sesame(rng, 30, 0, 0, b.inner * 0.7));
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function momos(ctx, rng, { kind = 'steamed' } = {}) {
  const basket = ctx.radial([
    [0, '#e6c28c'],
    [0.9, '#c79a5c'],
    [1, '#9c7038'],
  ]);
  const parts = [dropShadow(0, 0, 150), el('circle', { r: 150, fill: basket })];
  for (let i = 0; i < 6; i++)
    parts.push(
      el('circle', {
        r: 150 - i * 3,
        fill: 'none',
        stroke: '#8a6232',
        'stroke-width': 1,
        opacity: 0.5,
      }),
    );
  parts.push(el('circle', { r: 128, fill: '#cfe7b0' }));
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    parts.push(
      el('line', {
        x1: 0,
        y1: 0,
        x2: Math.cos(a) * 128,
        y2: Math.sin(a) * 128,
        stroke: '#a8cc84',
        'stroke-width': 1.2,
      }),
    );
  }
  const color = { steamed: '#fbf6ec', fried: '#e9b05a', tandoori: '#d9652e' }[kind];
  const momo = (x, y, rot) => {
    const fill = ctx.radial(
      [
        [0, lighten(color, 0.4)],
        [0.7, color],
        [1, darken(color, 0.12)],
      ],
      { fx: 0.4, fy: 0.35 },
    );
    const pleats = [];
    for (let i = -3; i <= 3; i++)
      pleats.push(
        el('path', {
          d: `M${i * 6},-6 Q${i * 9},${8} ${i * 12},${24}`,
          stroke: darken(color, 0.18),
          'stroke-width': 1.6,
          fill: 'none',
          opacity: 0.7,
        }),
      );
    return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
      contactShadow(0, 4, 34, 30),
      el('path', {
        d: 'M0,-14 C22,-16 34,6 32,18 C28,32 -28,32 -32,18 C-34,6 -22,-16 0,-14Z',
        fill,
      }),
      ...pleats,
      el('circle', { cx: 0, cy: -10, r: 5, fill: darken(color, 0.12) }),
      kind === 'tandoori' ? dots(rng, 6, 0, 10, 20, ['#7a2a0e'], 2.5) : '',
    ]);
  };
  for (const [x, y, r] of [
    [-50, -45, -20],
    [15, -60, 10],
    [65, -15, 40],
    [-65, 20, -40],
    [0, 5, 0],
    [45, 55, 70],
    [-25, 65, -70],
  ])
    parts.push(momo(x, y, r));
  return (
    parts.join('') +
    katori(ctx, rng, 112, 100, 30, '#d8341e', {
      bits: [{ count: 10, color: '#8a1a0e', size: 1.6, shape: 'dot' }],
    })
  );
}

export function wrap(ctx, rng, { kind = 'roll', filling = 'chicken' } = {}) {
  const parts = [];
  const isShawarma = kind === 'shawarma';
  const wrapFill = isShawarma
    ? ctx.linear(
        [
          [0, '#e9edf0'],
          [0.5, '#bfc7ce'],
          [1, '#f5f7f8'],
        ],
        { x2: 1, y2: 0 },
      )
    : ctx.linear(
        [
          [0, '#fbfbf7'],
          [1, '#e9e4d8'],
        ],
        { x2: 1, y2: 0 },
      );
  const rollFill = ctx.linear(
    [
      [0, '#f1c983'],
      [1, '#d59a4a'],
    ],
    { x2: 0, y2: 1 },
  );
  const fillColors = {
    chicken: ['#c9672b', '#b2501f'],
    paneer: ['#f3ad66', '#fff1d2'],
    egg: ['#ffd84d', '#fff8e1'],
    veg: ['#7cc04a', '#f08a24'],
  }[filling];
  for (const [dx, rot] of [
    [-55, -28],
    [55, -28],
  ]) {
    const r = [];
    r.push(dropShadow(0, 10, 50, 120, 0.22));
    r.push(el('rect', { x: -46, y: -120, width: 92, height: 240, rx: 40, fill: rollFill }));
    r.push(dots(rng, 14, 0, -20, 40, ['#a8601f'], 3));
    // Wrapper on the lower half.
    r.push(el('path', { d: 'M-50,0 L50,-12 L50,124 Q0,134 -50,124Z', fill: wrapFill }));
    if (!isShawarma)
      for (let i = 0; i < 4; i++)
        r.push(
          el('path', {
            d: `M-50,${20 + i * 26} L50,${8 + i * 26}`,
            stroke: '#d64532',
            'stroke-width': 5,
            opacity: 0.85,
          }),
        );
    else
      for (let i = 0; i < 6; i++)
        r.push(
          el('path', {
            d: `M-50,${10 + i * 20} L50,${i * 20 + 4}`,
            stroke: '#ffffff',
            'stroke-width': 2,
            opacity: 0.6,
          }),
        );
    // Open end with filling.
    r.push(el('ellipse', { cx: 0, cy: -116, rx: 44, ry: 18, fill: '#e3b06a' }));
    r.push(el('ellipse', { cx: 0, cy: -116, rx: 37, ry: 13, fill: fillColors[0] }));
    r.push(dots(rng, 14, 0, -116, 14, [fillColors[1], '#5aa83a', '#c77fb0'], 3.2));
    if (isShawarma)
      r.push(
        el('path', {
          d: 'M-25,-112 q12,-8 26,0 t26,0',
          stroke: '#fffdf4',
          'stroke-width': 5,
          fill: 'none',
          'stroke-linecap': 'round',
        }),
      );
    parts.push(g({ transform: `translate(${dx} 0) rotate(${rot})` }, r));
  }
  for (let i = 0; i < 5; i++)
    parts.push(onionRing(rng.range(60, 120), rng.range(70, 120), 11, rng.int(0, 180)));
  parts.push(lemonWedge(ctx, -110, 100, 18, 20));
  return parts.join('');
}

export function saladBowl(ctx, rng, { protein = 'chicken' } = {}) {
  const b = bowl(ctx, 148, BOWLS.white);
  const parts = [el('circle', { r: b.inner + 4, fill: '#e9dfc8' })];
  // Quinoa base.
  parts.push(
    grains(rng, 260, 0, 0, b.inner, ['#f3e7c9', '#e9d6a6', '#d8c08c'], { len: 3, width: 2.4 }),
  );
  const sector = (angle, fn) => {
    const x = Math.cos(angle) * 60;
    const y = Math.sin(angle) * 60;
    parts.push(fn(x, y));
  };
  sector(-2.2, (x, y) =>
    Array.from({ length: 7 }, () => {
      const [dx, dy] = rng.inCircle(30);
      return leaf(
        x + dx,
        y + dy,
        34,
        22,
        rng.int(0, 360),
        rng.pick(['#5daa3a', '#76c043', '#3f8f2f']),
      );
    }).join(''),
  );
  sector(-0.9, (x, y) =>
    Array.from({ length: 5 }, () => {
      const [dx, dy] = rng.inCircle(26);
      return (
        contactShadow(x + dx, y + dy, 13, 13) +
        el('circle', { cx: x + dx, cy: y + dy, r: 13, fill: '#e33a2c' }) +
        el('circle', { cx: x + dx, cy: y + dy, r: 8, fill: '#f47a5c' })
      );
    }).join(''),
  );
  sector(0.4, (x, y) =>
    Array.from({ length: 6 }, () => {
      const [dx, dy] = rng.inCircle(26);
      return (
        el('circle', {
          cx: x + dx,
          cy: y + dy,
          r: 14,
          fill: '#9ccc65',
          stroke: '#3b7a2a',
          'stroke-width': 2.5,
        }) + el('circle', { cx: x + dx, cy: y + dy, r: 6, fill: '#e6f2c8' })
      );
    }).join(''),
  );
  sector(1.7, (x, y) => {
    if (protein === 'chickpea') return dots(rng, 26, x, y, 30, ['#e0b06a', '#cf9c52'], 6);
    if (protein === 'paneer')
      return Array.from({ length: 5 }, () => {
        const [dx, dy] = rng.inCircle(26);
        return cube(ctx, x + dx, y + dy, 20, '#f2b06a', rng.int(0, 60), { char: true });
      }).join('');
    return Array.from({ length: 6 }, () => {
      const [dx, dy] = rng.inCircle(26);
      return chunk(ctx, rng, x + dx, y + dy, 14, '#d39a5a', { char: 0.5, ry: 9 });
    }).join('');
  });
  sector(3, (x, y) =>
    [0, 1, 2]
      .map((i) =>
        el('path', {
          d: `M${x - 30},${y - 10 + i * 14} a30,18 0 0 0 60,0`,
          fill: '#9cc36a',
          stroke: '#4f7a2a',
          'stroke-width': 3,
          opacity: 0.95,
        }),
      )
      .join(''),
  );
  parts.push(sesame(rng, 30, 0, 0, b.inner * 0.8, '#3a2a1a'));
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function pasta(ctx, rng, { shape = 'penne', sauce = 'red' } = {}) {
  const b = bowl(ctx, 148, { ...BOWLS.white, rimWidth: 0.2 });
  const sauceColor = { red: '#d2452a', white: '#f6ecd4', pesto: '#6f9e3a' }[sauce];
  const pastaColor = sauce === 'white' ? '#f3d99a' : '#f0c76e';
  const parts = [el('circle', { r: b.inner * 0.9, fill: sauceColor })];
  if (shape === 'penne') {
    for (let i = 0; i < 34; i++) {
      const [x, y] = rng.inCircle(b.inner * 0.75);
      const tube = ctx.linear([
        [0, lighten(pastaColor, 0.25)],
        [1, darken(pastaColor, 0.12)],
      ]);
      parts.push(
        g({ transform: `translate(${x} ${y}) rotate(${rng.int(0, 180)})` }, [
          contactShadow(0, 0, 18, 7),
          el('path', { d: 'M-18,-7 L14,-7 L20,7 L-12,7Z', fill: tube }),
          el('ellipse', { cx: 17, cy: 0, rx: 3, ry: 7, fill: darken(sauceColor, 0.1) }),
        ]),
      );
    }
  } else {
    parts.push(noodleStrands(rng, 50, b.inner * 0.95, pastaColor));
  }
  parts.push(dots(rng, 14, 0, 0, b.inner * 0.6, [lighten(sauceColor, 0.2)], 4));
  parts.push(grains(rng, 30, 0, 0, b.inner * 0.6, ['#fff8dc', '#f7eec8'], { len: 5, width: 2.5 }));
  for (let i = 0; i < 3; i++)
    parts.push(leaf(rng.range(-30, 30), rng.range(-30, 30), 30, 20, rng.int(0, 360), '#2f8a3a'));
  parts.push(dots(rng, 40, 0, 0, b.inner * 0.7, ['#2a1a0a'], 0.9));
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function bao(ctx, rng, { filling = 'chicken' } = {}) {
  const p = plate(ctx, 150, { color: '#f1ede6' });
  const parts = [p.svg];
  const fillColor = { chicken: '#b8541f', paneer: '#e88a3c', mushroom: '#7a5a3a' }[filling];
  for (const [x, y, rot] of [
    [-50, -35, -20],
    [45, -45, 15],
    [0, 50, 5],
  ]) {
    parts.push(
      g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
        contactShadow(0, 6, 55, 34),
        el('ellipse', {
          cx: 0,
          cy: 6,
          rx: 55,
          ry: 32,
          fill: ctx.radial([
            [0, '#ffffff'],
            [1, '#ede6d8'],
          ]),
        }),
        el('path', { d: 'M-50,-4 C-30,-22 30,-22 50,-4 C30,14 -30,14 -50,-4Z', fill: fillColor }),
        dots(rng, 10, 0, -4, 30, [darken(fillColor, 0.3), lighten(fillColor, 0.3)], 2.5),
        ...Array.from({ length: 5 }, (_, i) =>
          leaf(-30 + i * 15, -6, 16, 9, 80 + i * 10, '#5daa3a'),
        ),
        dots(rng, 6, 0, -6, 30, ['#f3f0e8'], 1.6),
        el('path', {
          d: 'M-52,-14 C-40,-44 40,-44 52,-14 C30,-22 -30,-22 -52,-14Z',
          fill: ctx.radial([
            [0, '#ffffff'],
            [1, '#efe9de'],
          ]),
        }),
        el('path', {
          d: 'M-36,6 q12,-8 24,0 t24,0 t24,0',
          stroke: '#fff7e0',
          'stroke-width': 3,
          fill: 'none',
          'stroke-linecap': 'round',
        }),
      ]),
    );
  }
  parts.push(chili(85, 70, 30, -30, '#c62a1d'));
  return parts.join('');
}

export function sandwich(ctx, rng, { kind = 'grilled' } = {}) {
  const p = plate(ctx, 150);
  const parts = [p.svg];
  const bread = ctx.linear(
    [
      [0, '#f4d39a'],
      [1, '#e2ab5a'],
    ],
    { x2: 1, y2: 1 },
  );
  for (const [x, y, rot] of [
    [-30, -25, -10],
    [40, 30, 170],
  ]) {
    parts.push(
      g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
        el('path', {
          d: 'M-80,-62 L82,-62 L-80,92Z',
          fill: '#4a2c1a',
          opacity: 0.18,
          filter: 'url(#softShadow)',
          transform: 'translate(8 10)',
        }),
        el('path', {
          d: 'M-80,-62 L82,-62 L-80,92Z',
          fill: '#6cbf3c',
          transform: 'translate(4 6)',
        }),
        el('path', {
          d: 'M-80,-62 L82,-62 L-80,92Z',
          fill: '#f8c22c',
          transform: 'translate(2 3)',
        }),
        el('path', {
          d: 'M-80,-62 L82,-62 L-80,92Z',
          fill: bread,
          stroke: '#c78a3a',
          'stroke-width': 6,
          'stroke-linejoin': 'round',
        }),
        ...(kind === 'grilled'
          ? [-40, -10, 20].map((o) =>
              el('path', {
                d: `M-70,${o} L${10 - o},-55`,
                stroke: '#8a4a1c',
                'stroke-width': 5,
                opacity: 0.55,
                'stroke-linecap': 'round',
              }),
            )
          : []),
      ]),
    );
  }
  parts.push(katori(ctx, rng, 95, -70, 24, '#5fae4a'));
  return parts.join('');
}

export function soup(ctx, rng, { color = '#c0532a', kind = 'tomato' } = {}) {
  const b = bowl(ctx, 146, { ...BOWLS.white, rimWidth: 0.22 });
  const parts = [
    el('circle', {
      r: b.inner + 4,
      fill: ctx.radial([
        [0, lighten(color, 0.15)],
        [1, darken(color, 0.12)],
      ]),
    }),
  ];
  if (kind === 'tomato')
    parts.push(
      creamSwirl(0, 0, b.inner * 0.45, { width: 4 }),
      dots(rng, 12, 0, 0, b.inner * 0.7, ['#e7b06a'], 5),
    );
  if (kind === 'manchow') {
    parts.push(veggieBits(rng, b.inner * 0.7, 10));
    for (let i = 0; i < 18; i++) {
      const [x, y] = rng.inCircle(30);
      parts.push(
        el('path', {
          d: `M${x},${y} q8,-6 16,0 t16,0`,
          stroke: '#e3b04a',
          'stroke-width': 3.2,
          fill: 'none',
        }),
      );
    }
  }
  parts.push(corianderScatter(rng, 6, 0, 0, b.inner * 0.6, 6));
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function friedChicken(ctx, rng) {
  const parts = [dropShadow(0, 0, 150)];
  const basket = ctx.radial([
    [0, '#f6f1e6'],
    [1, '#e1d6c0'],
  ]);
  parts.push(el('circle', { r: 150, fill: '#c0392b' }), el('circle', { r: 136, fill: basket }));
  const drum = (x, y, rot) => {
    const coat = ctx.radial(
      [
        [0, '#f2b65a'],
        [0.7, '#d48a2e'],
        [1, '#9c5a1a'],
      ],
      { fx: 0.35, fy: 0.35 },
    );
    return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
      contactShadow(0, 0, 58, 38),
      el('rect', { x: 26, y: -8, width: 46, height: 16, rx: 8, fill: '#f5ecd8' }),
      el('circle', { cx: 74, cy: -8, r: 10, fill: '#f8f1e2' }),
      el('circle', { cx: 74, cy: 8, r: 10, fill: '#f8f1e2' }),
      el('path', {
        d: blobPath(rng, -10, 0, 50, { ry: 38, points: 11, wobble: 0.14 }),
        fill: coat,
      }),
      dots(rng, 40, -10, 0, 42, ['#f7c977', '#b46a1f', '#e7a548'], 2.6),
    ]);
  };
  for (const [x, y, r] of [
    [-40, -50, 20],
    [40, -30, 150],
    [-50, 30, -30],
    [30, 55, 200],
  ])
    parts.push(drum(x, y, r));
  parts.push(katori(ctx, rng, 95, 95, 28, '#f6eedc'));
  return parts.join('');
}

export function seafoodPlate(ctx, rng, { kind = 'fish-fry' } = {}) {
  const p = plate(ctx, 150, { color: '#eef3f6' });
  const parts = [p.svg];
  if (kind === 'fish-fry') {
    for (const [x, y, rot] of [
      [-30, -35, -20],
      [25, 30, -20],
    ]) {
      const coat = ctx.radial(
        [
          [0, '#e8823a'],
          [0.8, '#b9441a'],
          [1, '#7a2a0e'],
        ],
        { fx: 0.4, fy: 0.35 },
      );
      parts.push(
        g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
          contactShadow(0, 0, 80, 36),
          el('path', {
            d: blobPath(rng, 0, 0, 80, { ry: 36, points: 10, wobble: 0.08 }),
            fill: coat,
          }),
          dots(rng, 30, 0, 0, 30, ['#f2a35c', '#5a1a08'], 2.4),
        ]),
      );
    }
  } else {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      parts.push(prawn(Math.cos(a) * 62, Math.sin(a) * 62, 22, (a * 180) / Math.PI));
    }
    parts.push(dots(rng, 30, 0, 0, 40, ['#f7e6a3', '#e9cf6a'], 3));
  }
  for (let i = 0; i < 5; i++) {
    const [x, y] = rng.inCircle(90);
    parts.push(leaf(x, y, 20, 8, rng.int(0, 360), '#2d6b2a'));
  }
  for (let i = 0; i < 4; i++)
    parts.push(onionRing(rng.range(-110, -70), rng.range(40, 90), 10, rng.int(0, 180)));
  parts.push(lemonWedge(ctx, 85, -60, 22, 30));
  return parts.join('');
}

function prawn(x, y, s, rot) {
  const segs = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 1.2 * i) / 5 - 0.3;
    segs.push(
      el('circle', {
        cx: Math.cos(a) * s * 0.75,
        cy: Math.sin(a) * s * 0.75,
        r: s * (0.42 - i * 0.04),
        fill: i % 2 ? '#f6a46a' : '#ee8443',
        stroke: '#d0602a',
        'stroke-width': 0.8,
      }),
    );
  }
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    contactShadow(0, 0, s, s),
    ...segs.reverse(),
    el('path', {
      d: `M${s * 0.6},${-s * 0.55} l${s * 0.55},${-s * 0.25} l${-s * 0.15},${s * 0.5}Z`,
      fill: '#d94a1e',
    }),
  ]);
}

export function hummusPlatter(ctx, rng) {
  const p = plate(ctx, 150, { color: '#eef0ec' });
  const parts = [p.svg];
  parts.push(
    el('circle', {
      cx: -20,
      cy: -10,
      r: 70,
      fill: ctx.radial([
        [0, '#f6e7c4'],
        [1, '#e2c891'],
      ]),
    }),
  );
  parts.push(creamSwirl(-20, -10, 45, { color: '#ead19a', width: 6 }));
  parts.push(
    el('path', { d: blobPath(rng, -20, -10, 18, { wobble: 0.3 }), fill: '#d9a72a', opacity: 0.85 }),
  );
  parts.push(dots(rng, 20, -20, -10, 50, ['#c0392b', '#a83224'], 1.6));
  parts.push(dots(rng, 8, -20, -10, 40, ['#d4a95a'], 6));
  for (let i = 0; i < 4; i++) {
    const a = 0.2 + i * 0.4;
    parts.push(
      g(
        {
          transform: `translate(${Math.cos(a) * 95} ${Math.sin(a) * 95}) rotate(${(a * 180) / Math.PI + 90})`,
        },
        [
          contactShadow(0, 0, 30, 24),
          el('path', {
            d: 'M-30,20 L0,-34 L30,20 Q0,30 -30,20Z',
            fill: '#f3d39a',
            stroke: '#d9a95f',
            'stroke-width': 3,
          }),
          dots(rng, 5, 0, 5, 14, ['#b4732e'], 2.4),
        ],
      ),
    );
  }
  return parts.join('');
}

export function waffle(ctx, rng) {
  const p = plate(ctx, 150);
  const grid = [];
  for (let i = -3; i <= 3; i++) {
    grid.push(
      el('line', {
        x1: i * 20,
        y1: -70,
        x2: i * 20,
        y2: 70,
        stroke: '#a8621f',
        'stroke-width': 6,
        opacity: 0.55,
      }),
    );
    grid.push(
      el('line', {
        x1: -70,
        y1: i * 20,
        x2: 70,
        y2: i * 20,
        stroke: '#a8621f',
        'stroke-width': 6,
        opacity: 0.55,
      }),
    );
  }
  return [
    p.svg,
    g({ transform: 'rotate(12)' }, [
      contactShadow(0, 0, 80, 80),
      el('rect', {
        x: -80,
        y: -80,
        width: 160,
        height: 160,
        rx: 18,
        fill: ctx.radial([
          [0, '#f5c56f'],
          [1, '#d48a32'],
        ]),
      }),
      g(
        { 'clip-path': ctx.clip(el('rect', { x: -78, y: -78, width: 156, height: 156, rx: 16 })) },
        grid,
      ),
    ]),
    el('path', {
      d: 'M-60,-40 C-20,-60 20,-20 60,-40 M-60,10 C-20,-10 20,30 60,10',
      stroke: '#4a1f0c',
      'stroke-width': 7,
      fill: 'none',
      'stroke-linecap': 'round',
      opacity: 0.9,
    }),
    scoop(ctx, rng, 40, 40, 34, '#fff3d6'),
    dots(rng, 6, -50, 70, 20, ['#d6243a'], 6),
  ].join('');
}

export function scoop(ctx, rng, x, y, r, color) {
  const fill = ctx.radial(
    [
      [0, lighten(color, 0.5)],
      [0.75, color],
      [1, darken(color, 0.15)],
    ],
    { fx: 0.38, fy: 0.35 },
  );
  return (
    contactShadow(x, y, r, r) +
    el('path', { d: blobPath(rng, x, y, r, { points: 10, wobble: 0.08 }), fill }) +
    dots(rng, 6, x, y, r * 0.6, [darken(color, 0.1)], 2)
  );
}

export { creamSwirl, cube, dots, katori };
