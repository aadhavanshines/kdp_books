// Reusable pieces for the dish illustrations: vessels, garnishes, textures.
// Convention: every dish is drawn around (0, 0) and fits in a ~155px radius.
// Light comes from the top-left, so shadows fall to the bottom-right.

import { blobPath, darken, el, g, lighten } from './svg.mjs';

export const SHADOW = '#4a2c1a';

export function dropShadow(cx, cy, rx, ry = rx, opacity = 0.28) {
  return el('ellipse', {
    cx: cx + rx * 0.05,
    cy: cy + ry * 0.08,
    rx: rx * 1.02,
    ry: ry * 1.02,
    fill: SHADOW,
    opacity,
    filter: 'url(#shadow)',
  });
}

export function contactShadow(cx, cy, rx, ry = rx) {
  return el('ellipse', {
    cx: cx + 1.5,
    cy: cy + 2.5,
    rx,
    ry,
    fill: SHADOW,
    opacity: 0.35,
    filter: 'url(#softShadow)',
  });
}

/** A ceramic plate. Returns { svg, inner } where inner is the usable food radius. */
export function plate(ctx, r, { color = '#ffffff', x = 0, y = 0 } = {}) {
  const rim = ctx.radial(
    [
      [0, lighten(color, 0.4)],
      [0.72, color],
      [0.9, darken(color, 0.06)],
      [1, darken(color, 0.14)],
    ],
    { fx: 0.4, fy: 0.38 },
  );
  const well = ctx.radial(
    [
      [0, lighten(color, 0.5)],
      [0.85, color],
      [1, darken(color, 0.08)],
    ],
    { fx: 0.42, fy: 0.4 },
  );
  return {
    inner: r * 0.74,
    svg: [
      dropShadow(x, y, r),
      el('circle', { cx: x, cy: y, r, fill: rim }),
      el('circle', {
        cx: x,
        cy: y,
        r: r * 0.76,
        fill: well,
        stroke: darken(color, 0.1),
        'stroke-opacity': 0.35,
        'stroke-width': 1.2,
      }),
      el('path', {
        d: arcPath(x, y, r * 0.88, 200, 250),
        stroke: '#ffffff',
        'stroke-width': r * 0.05,
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: 0.7,
      }),
    ].join(''),
  };
}

/** A polished steel plate (thali / South Indian style). */
export function steelPlate(ctx, r, { x = 0, y = 0 } = {}) {
  const metal = ctx.radial(
    [
      [0, '#f4f6f8'],
      [0.6, '#d7dde3'],
      [0.88, '#b9c2cb'],
      [0.94, '#eef1f4'],
      [1, '#9aa5b0'],
    ],
    { fx: 0.35, fy: 0.3 },
  );
  return {
    inner: r * 0.86,
    svg: [
      dropShadow(x, y, r),
      el('circle', { cx: x, cy: y, r, fill: metal }),
      el('circle', {
        cx: x,
        cy: y,
        r: r * 0.9,
        fill: 'none',
        stroke: '#ffffff',
        'stroke-opacity': 0.6,
        'stroke-width': 1.5,
      }),
      el('path', {
        d: arcPath(x, y, r * 0.6, 200, 245),
        stroke: '#ffffff',
        'stroke-width': r * 0.12,
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: 0.35,
        filter: 'url(#blur)',
      }),
    ].join(''),
  };
}

/** A bowl seen from above. Returns { svg, inner, clip } – draw food inside `clip`. */
export function bowl(
  ctx,
  r,
  { color = '#ffffff', innerColor, x = 0, y = 0, rimWidth = 0.1, shadow = true } = {},
) {
  const ic = innerColor ?? color;
  const outer = ctx.radial(
    [
      [0, lighten(color, 0.3)],
      [0.8, color],
      [1, darken(color, 0.2)],
    ],
    { fx: 0.35, fy: 0.32 },
  );
  const inner = r * (1 - rimWidth);
  // The inner wall is darker on the top-left (the rim blocks the light there).
  const wall = ctx.linear(
    [
      [0, darken(ic, 0.16)],
      [0.55, ic],
      [1, lighten(ic, 0.25)],
    ],
    { x1: 0.15, y1: 0.1, x2: 0.85, y2: 0.95 },
  );
  return {
    inner: inner * 0.94,
    clip: ctx.clip(el('circle', { cx: x, cy: y, r: inner * 0.95 })),
    svg: [
      shadow ? dropShadow(x, y, r) : '',
      el('circle', { cx: x, cy: y, r, fill: outer }),
      el('circle', { cx: x, cy: y, r: inner, fill: wall }),
      el('path', {
        d: arcPath(x, y, r * (1 - rimWidth / 2), 195, 255),
        stroke: '#ffffff',
        'stroke-width': r * rimWidth * 0.35,
        'stroke-linecap': 'round',
        fill: 'none',
        opacity: 0.55,
      }),
    ].join(''),
  };
}

export const BOWLS = {
  white: { color: '#fbfaf7', innerColor: '#f2eee7' },
  black: { color: '#2d2d2f', innerColor: '#3a3a3d' },
  copper: { color: '#c06a32', innerColor: '#9a4f22' },
  clay: { color: '#b5653a', innerColor: '#9b4f2b' },
  steel: { color: '#d5dbe1', innerColor: '#c3cbd3' },
  blue: { color: '#3c6e9e', innerColor: '#f4f1ea' },
  green: { color: '#7fa37a', innerColor: '#f1efe6' },
  mustard: { color: '#d9a43a', innerColor: '#f6efe0' },
};

/** Small bowl (katori) filled with a liquid colour, e.g. chutney or raita. */
export function katori(
  ctx,
  rng,
  x,
  y,
  r,
  fill,
  { bowlColor = 'steel', bits = [], swirl = false } = {},
) {
  const b = bowl(ctx, r, { ...BOWLS[bowlColor], x, y, rimWidth: 0.16 });
  const liquid = ctx.radial(
    [
      [0, lighten(fill, 0.18)],
      [1, darken(fill, 0.12)],
    ],
    { fx: 0.4, fy: 0.38 },
  );
  const parts = [el('circle', { cx: x, cy: y, r: b.inner, fill: liquid })];
  for (const bit of bits) {
    for (let i = 0; i < bit.count; i++) {
      const [dx, dy] = rng.inCircle(b.inner * 0.85);
      parts.push(
        bit.shape === 'dot'
          ? el('circle', {
              cx: x + dx,
              cy: y + dy,
              r: bit.size,
              fill: bit.color,
              opacity: bit.opacity ?? 1,
            })
          : el('rect', {
              x: x + dx,
              y: y + dy,
              width: bit.size,
              height: bit.size * 0.8,
              rx: bit.size * 0.25,
              fill: bit.color,
              transform: `rotate(${rng.int(0, 90)} ${x + dx} ${y + dy})`,
            }),
      );
    }
  }
  if (swirl) parts.push(creamSwirl(x, y, b.inner * 0.55, { width: r * 0.06 }));
  parts.push(
    el('ellipse', {
      cx: x - b.inner * 0.35,
      cy: y - b.inner * 0.4,
      rx: b.inner * 0.3,
      ry: b.inner * 0.12,
      fill: '#fff',
      opacity: 0.25,
      transform: `rotate(-35 ${x} ${y})`,
    }),
  );
  return b.svg + g({ 'clip-path': b.clip }, parts);
}

export function arcPath(cx, cy, r, startDeg, endDeg) {
  const a0 = (startDeg * Math.PI) / 180;
  const a1 = (endDeg * Math.PI) / 180;
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} A${r},${r} 0 ${large} 1 ${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r}`;
}

/** Spiral of cream or ghee, the classic finishing touch on a curry. */
export function creamSwirl(
  cx,
  cy,
  r,
  { color = '#fffaf0', width = 4, turns = 1.7, opacity = 0.9 } = {},
) {
  let d = '';
  const steps = 70;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2 + 0.6;
    // A slight wobble so it looks poured by hand rather than drawn by a compass.
    const rr = r * (0.12 + 0.88 * t) * (1 + Math.sin(t * 17) * 0.06);
    d += `${i === 0 ? 'M' : 'L'}${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr * 0.92} `;
  }
  return g({ opacity }, [
    el('path', {
      d,
      stroke: color,
      'stroke-width': width * 1.6,
      fill: 'none',
      'stroke-linecap': 'round',
      opacity: 0.35,
    }),
    el('path', {
      d,
      stroke: color,
      'stroke-width': width,
      fill: 'none',
      'stroke-linecap': 'round',
    }),
  ]);
}

/** Coriander sprig: three soft lobes. */
export function coriander(x, y, s, rot = 0) {
  const lobe = (a) => {
    const rad = (a * Math.PI) / 180;
    return el('circle', { cx: Math.cos(rad) * s * 0.5, cy: Math.sin(rad) * s * 0.5, r: s * 0.48 });
  };
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    g({ fill: '#3d8b2f' }, [lobe(-90), lobe(30), lobe(150)]),
    g({ fill: '#62b046', transform: 'scale(0.62)' }, [lobe(-90), lobe(30), lobe(150)]),
  ]);
}

/** Generic pointed leaf (mint, basil, curry leaf, lettuce bits). */
export function leaf(x, y, len, width, rot, color = '#2f9e57') {
  const h = len / 2;
  const w = width / 2;
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    el('path', {
      d: `M0,${-h} C${w * 1.3},${-h * 0.4} ${w * 1.1},${h * 0.5} 0,${h} C${-w * 1.1},${h * 0.5} ${-w * 1.3},${-h * 0.4} 0,${-h}Z`,
      fill: color,
    }),
    el('path', {
      d: `M0,${-h * 0.85} L0,${h * 0.9}`,
      stroke: lighten(color, 0.35),
      'stroke-width': Math.max(0.6, width * 0.07),
      opacity: 0.8,
    }),
  ]);
}

export function onionRing(x, y, r, rot = 0, color = '#c77fb0') {
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    el('ellipse', {
      rx: r,
      ry: r * 0.82,
      fill: 'none',
      stroke: color,
      'stroke-width': r * 0.2,
      opacity: 0.95,
    }),
    el('ellipse', {
      rx: r * 0.78,
      ry: r * 0.62,
      fill: 'none',
      stroke: '#f6e4f0',
      'stroke-width': r * 0.12,
      opacity: 0.9,
    }),
  ]);
}

export function lemonWedge(ctx, x, y, r, rot = 0) {
  const flesh = ctx.radial(
    [
      [0, '#fff6b8'],
      [1, '#f7d64a'],
    ],
    { cy: 0.1, r: 0.9 },
  );
  const segs = [30, 60, 90, 120, 150].map((a) => {
    const rad = (a * Math.PI) / 180;
    return el('line', {
      x1: 0,
      y1: 0,
      x2: Math.cos(rad) * r * 0.8,
      y2: Math.sin(rad) * r * 0.8,
      stroke: '#fffbe0',
      'stroke-width': r * 0.06,
    });
  });
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    contactShadow(0, r * 0.3, r, r * 0.55),
    el('path', { d: `M${-r},0 A${r},${r} 0 0 0 ${r},0 Z`, fill: '#f2b81c' }),
    el('path', {
      d: `M${-r * 0.88},0 A${r * 0.88},${r * 0.88} 0 0 0 ${r * 0.88},0 Z`,
      fill: flesh,
    }),
    ...segs,
  ]);
}

export function chili(x, y, len, rot, color = '#2f8f3a') {
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    el('path', {
      d: `M0,0 C${len * 0.3},${-len * 0.12} ${len * 0.75},${-len * 0.05} ${len},${len * 0.12} C${len * 0.7},${len * 0.06} ${len * 0.3},${len * 0.12} 0,${len * 0.1} Z`,
      fill: color,
    }),
    el('path', {
      d: `M${len * 0.1},${len * 0.02} C${len * 0.35},${-len * 0.06} ${len * 0.6},${-len * 0.03} ${len * 0.8},${len * 0.04}`,
      stroke: lighten(color, 0.4),
      'stroke-width': len * 0.025,
      fill: 'none',
      opacity: 0.7,
    }),
    el('path', {
      d: `M0,${len * 0.05} l${-len * 0.12},${-len * 0.06}`,
      stroke: '#4c7a2a',
      'stroke-width': len * 0.05,
      'stroke-linecap': 'round',
    }),
  ]);
}

/** Rice grains (or similar small elongated bits) scattered inside a circle. */
export function grains(rng, n, cx, cy, r, colors, { len = 6.5, width = 2.4 } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = rng.inCircle(r);
    out.push(
      el('ellipse', {
        cx: cx + dx,
        cy: cy + dy,
        rx: width,
        ry: len * rng.range(0.85, 1.1),
        fill: rng.pick(colors),
        transform: `rotate(${rng.int(0, 180)} ${cx + dx} ${cy + dy})`,
      }),
    );
  }
  return out.join('');
}

export function dots(rng, n, cx, cy, r, colors, size = 1.2) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = rng.inCircle(r);
    out.push(
      el('circle', {
        cx: cx + dx,
        cy: cy + dy,
        r: size * rng.range(0.7, 1.2),
        fill: rng.pick(colors),
      }),
    );
  }
  return out.join('');
}

/** A golden-brown chunk (chicken, potato, fritter) with a highlight and char spots. */
export function chunk(ctx, rng, x, y, r, base, { char = 0.4, ry } = {}) {
  const fill = ctx.radial(
    [
      [0, lighten(base, 0.25)],
      [0.65, base],
      [1, darken(base, 0.3)],
    ],
    { fx: 0.35, fy: 0.32 },
  );
  const parts = [
    contactShadow(x, y, r * 0.95, (ry ?? r) * 0.95),
    el('path', { d: blobPath(rng, x, y, r, { ry, wobble: 0.18 }), fill }),
  ];
  const spots = Math.round(char * 6);
  for (let i = 0; i < spots; i++) {
    const [dx, dy] = rng.inCircle(r * 0.6);
    parts.push(
      el('path', {
        d: blobPath(rng, x + dx, y + dy, r * rng.range(0.08, 0.16), { points: 5, wobble: 0.4 }),
        fill: darken(base, 0.55),
        opacity: 0.55,
      }),
    );
  }
  parts.push(
    el('ellipse', {
      cx: x - r * 0.3,
      cy: y - r * 0.32,
      rx: r * 0.28,
      ry: r * 0.14,
      fill: '#fff',
      opacity: 0.28,
      transform: `rotate(-30 ${x} ${y})`,
    }),
  );
  return parts.join('');
}

/** Rounded cube seen from above at a slight angle: paneer, tofu, cake squares. */
export function cube(ctx, x, y, s, base, rot = 0, { char = false } = {}) {
  const top = ctx.linear(
    [
      [0, lighten(base, 0.25)],
      [1, base],
    ],
    { x1: 0, y1: 0, x2: 1, y2: 1 },
  );
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, [
    contactShadow(0, 0, s * 0.6, s * 0.6),
    el('rect', {
      x: -s / 2 + s * 0.08,
      y: -s / 2 + s * 0.12,
      width: s,
      height: s,
      rx: s * 0.2,
      fill: darken(base, 0.18),
    }),
    el('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: s * 0.2, fill: top }),
    char
      ? el('path', {
          d: `M${-s * 0.4},${-s * 0.15} L${s * 0.3},${-s * 0.35} M${-s * 0.35},${s * 0.2} L${s * 0.38},${0}`,
          stroke: '#5a2a10',
          'stroke-width': s * 0.1,
          'stroke-linecap': 'round',
          opacity: 0.6,
        })
      : '',
  ]);
}

/** Flatbread (naan / roti / paratha) with toasted spots. */
export function flatbread(
  ctx,
  rng,
  x,
  y,
  r,
  { color = '#efc987', spots = 14, ry, rot = 0, layers = false, butter = false } = {},
) {
  const fill = ctx.radial(
    [
      [0, lighten(color, 0.25)],
      [0.75, color],
      [1, darken(color, 0.2)],
    ],
    { fx: 0.4, fy: 0.38 },
  );
  const parts = [
    dropShadow(0, 0, r, ry ?? r * 0.85, 0.2),
    el('path', {
      d: blobPath(rng, 0, 0, r, { ry: ry ?? r * 0.85, points: 9, wobble: 0.08 }),
      fill,
    }),
  ];
  if (layers) {
    for (let i = 1; i <= 3; i++) {
      parts.push(
        el('path', {
          d: arcPath(0, 0, r * (0.25 * i), rng.int(0, 360), rng.int(400, 560)),
          stroke: darken(color, 0.22),
          'stroke-width': 1.6,
          fill: 'none',
          opacity: 0.45,
        }),
      );
    }
  }
  for (let i = 0; i < spots; i++) {
    const [dx, dy] = rng.inCircle(r * 0.8);
    parts.push(
      el('path', {
        d: blobPath(rng, dx, dy * 0.85, rng.range(2.5, 7), { points: 6, wobble: 0.45 }),
        fill: rng.pick(['#8a4b1c', '#a65e25', '#6e3812']),
        opacity: rng.range(0.35, 0.7),
      }),
    );
  }
  if (butter)
    parts.push(
      el('ellipse', {
        cx: -r * 0.1,
        cy: -r * 0.15,
        rx: r * 0.55,
        ry: r * 0.35,
        fill: '#fff6c9',
        opacity: 0.35,
        filter: 'url(#blur)',
      }),
    );
  return g({ transform: `translate(${x} ${y}) rotate(${rot})` }, parts);
}

/** Butter cube melting. */
export function butter(ctx, x, y, s) {
  return g({ transform: `translate(${x} ${y})` }, [
    el('ellipse', {
      cx: s * 0.1,
      cy: s * 0.25,
      rx: s * 0.95,
      ry: s * 0.75,
      fill: '#ffe38a',
      opacity: 0.55,
    }),
    el('rect', {
      x: -s / 2,
      y: -s / 2,
      width: s,
      height: s,
      rx: s * 0.18,
      fill: ctx.linear(
        [
          [0, '#fffbe0'],
          [1, '#ffe27a'],
        ],
        { x2: 1, y2: 1 },
      ),
    }),
  ]);
}

export function sesame(rng, n, cx, cy, r, color = '#fbf1d6') {
  return grains(rng, n, cx, cy, r, [color], { len: 2.6, width: 1.3 });
}

/** Short curved brown slivers: crispy fried onions (birista). */
export function friedOnions(rng, n, cx, cy, r) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = rng.inCircle(r);
    const x = cx + dx;
    const y = cy + dy;
    const len = rng.range(6, 11);
    out.push(
      el('path', {
        d: `M${x},${y} q${len / 2},${-len / 2.5} ${len},0`,
        stroke: rng.pick(['#7a3f12', '#9c5420', '#5e2d0c']),
        'stroke-width': 2.2,
        fill: 'none',
        'stroke-linecap': 'round',
        transform: `rotate(${rng.int(0, 360)} ${x} ${y})`,
      }),
    );
  }
  return out.join('');
}

export function corianderScatter(rng, n, cx, cy, r, size = 7) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const [dx, dy] = rng.inCircle(r);
    out.push(coriander(cx + dx, cy + dy, size * rng.range(0.8, 1.2), rng.int(0, 360)));
  }
  return out.join('');
}
