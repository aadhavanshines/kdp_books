// Tiny SVG-building helpers used by the seed artwork generator.
// Everything is deterministic: the same seed always draws the same picture.

/** Seeded pseudo-random generator (mulberry32) from any string. */
export function createRng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    /** Uniform random point inside a circle. */
    inCircle: (r) => {
      const angle = next() * Math.PI * 2;
      const dist = Math.sqrt(next()) * r;
      return [Math.cos(angle) * dist, Math.sin(angle) * dist];
    },
  };
}

const fmt = (n) => (typeof n === 'number' ? +n.toFixed(2) : n);

/** Builds an element string: el('circle', { cx: 1, r: 2 }) → <circle cx="1" r="2"/> */
export function el(tag, attrs = {}, children = '') {
  const attrText = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${fmt(v)}"`)
    .join(' ');
  const body = Array.isArray(children) ? children.join('') : children;
  return body ? `<${tag} ${attrText}>${body}</${tag}>` : `<${tag} ${attrText}/>`;
}

export const g = (attrs, children) => el('g', attrs, children);

/** Collects <defs> (gradients, clip paths) with unique ids for one SVG document. */
export class Ctx {
  constructor(prefix = 'd') {
    this.prefix = prefix;
    this.count = 0;
    this.defs = [];
    this.defs.push(
      el(
        'filter',
        { id: 'shadow', x: '-50%', y: '-50%', width: '200%', height: '200%' },
        el('feGaussianBlur', { stdDeviation: 9 }),
      ),
      el(
        'filter',
        { id: 'softShadow', x: '-50%', y: '-50%', width: '200%', height: '200%' },
        el('feGaussianBlur', { stdDeviation: 3 }),
      ),
      el(
        'filter',
        { id: 'blur', x: '-50%', y: '-50%', width: '200%', height: '200%' },
        el('feGaussianBlur', { stdDeviation: 1.2 }),
      ),
    );
  }

  id() {
    this.count += 1;
    return `${this.prefix}${this.count}`;
  }

  /** Radial gradient; stops are [offset, color, opacity?]. Returns a url(#id) fill. */
  radial(stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
    const id = this.id();
    this.defs.push(
      el(
        'radialGradient',
        { id, cx, cy, r, fx, fy },
        stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })),
      ),
    );
    return `url(#${id})`;
  }

  linear(stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
    const id = this.id();
    this.defs.push(
      el(
        'linearGradient',
        { id, x1, y1, x2, y2 },
        stops.map(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op })),
      ),
    );
    return `url(#${id})`;
  }

  /** Clip path from raw SVG shapes. Returns url(#id). */
  clip(shapes) {
    const id = this.id();
    this.defs.push(el('clipPath', { id }, shapes));
    return `url(#${id})`;
  }

  render(width, height, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${this.defs.join('')}</defs>${body}</svg>`;
  }
}

/**
 * Smooth closed blob around (cx, cy): good for chicken pieces, potatoes, dollops.
 * `wobble` 0..1 controls how irregular it is.
 */
export function blobPath(rng, cx, cy, r, { points = 7, wobble = 0.25, ry } = {}) {
  const yr = ry ?? r;
  const pts = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + rng.range(-0.15, 0.15);
    const k = 1 + rng.range(-wobble, wobble);
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * yr * k]);
  }
  // Catmull-Rom → cubic Bézier for a smooth closed outline.
  let d = `M${fmt(pts[0][0])},${fmt(pts[0][1])}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${fmt(c1[0])},${fmt(c1[1])} ${fmt(c2[0])},${fmt(c2[1])} ${fmt(p2[0])},${fmt(p2[1])}`;
  }
  return `${d}Z`;
}

/** Mixes two hex colours: t=0 → a, t=1 → b. */
export function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p, s) => (p >> s) & 255;
  const c = [16, 8, 0].map((s) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const lighten = (c, t) => mix(c, '#ffffff', t);
export const darken = (c, t) => mix(c, '#000000', t);
