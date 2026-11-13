"""Tiny drawing language for step-by-step pictures.

Every subject is drawn on a 200 x 200 canvas. A subject is a list of
steps; each step is a list of shapes. When step N is shown, steps before
it are drawn in light gray and step N in black, which is how the reader
sees exactly which lines are new.

Shapes are plain dicts made by the helpers below. ``fill`` may be None
(outline only), "white" (hides lines behind it) or "ink" (solid, used for
eyes and noses).
"""
from __future__ import annotations

OLD = "#b3b3b3"
NEW = "#111111"
W_OLD = 3.0
W_NEW = 3.6


def _s(kind: str, attrs: dict, fill=None, w: float = 1.0) -> dict:
    return {"kind": kind, "attrs": attrs, "fill": fill, "w": w}


def c(cx, cy, r, fill=None, w=1.0):
    """Circle."""
    return _s("circle", {"cx": cx, "cy": cy, "r": r}, fill, w)


def e(cx, cy, rx, ry, rot=0, fill=None, w=1.0):
    """Ellipse, optionally rotated by ``rot`` degrees."""
    a = {"cx": cx, "cy": cy, "rx": rx, "ry": ry}
    if rot:
        a["transform"] = f"rotate({rot} {cx} {cy})"
    return _s("ellipse", a, fill, w)


def p(d, fill=None, w=1.0):
    """Any SVG path."""
    return _s("path", {"d": d}, fill, w)


def l(x1, y1, x2, y2, w=1.0):
    """Straight line."""
    return _s("line", {"x1": x1, "y1": y1, "x2": x2, "y2": y2}, None, w)


def r(x, y, w_, h, rx=0, fill=None, w=1.0):
    """Rectangle with optional rounded corners."""
    return _s("rect", {"x": x, "y": y, "width": w_, "height": h, "rx": rx}, fill, w)


def dot(cx, cy, rad=4.5):
    """A solid dot: eyes, noses, spots."""
    return c(cx, cy, rad, fill="ink", w=0.6)


def eye(cx, cy, rad=5.5):
    """A cute eye: a solid dot with a white sparkle."""
    return _s("eye", {"cx": cx, "cy": cy, "r": rad}, "ink", 0.6)


def smile(cx, cy, wd=10, depth=6):
    return p(f"M{cx-wd} {cy} Q{cx} {cy+depth*2} {cx+wd} {cy}")


def poly(*pts, closed=True, fill=None, w=1.0):
    d = "M" + " L".join(f"{x} {y}" for x, y in pts) + (" Z" if closed else "")
    return p(d, fill, w)


def _attrs(a: dict) -> str:
    return " ".join(f'{k}="{v}"' for k, v in a.items())


def shape_svg(s: dict, color: str, width: float) -> str:
    sw = width * s["w"]
    fill = {"white": "#ffffff", "ink": color, None: "none"}[s["fill"]]
    if s["kind"] == "eye":
        a = s["attrs"]
        rr = a["r"]
        return (f'<circle cx="{a["cx"]}" cy="{a["cy"]}" r="{rr}" fill="{color}"/>'
                f'<circle cx="{a["cx"] - rr*0.35:.2f}" cy="{a["cy"] - rr*0.35:.2f}" '
                f'r="{rr*0.36:.2f}" fill="#ffffff"/>')
    return (f'<{s["kind"]} {_attrs(s["attrs"])} fill="{fill}" stroke="{color}" '
            f'stroke-width="{sw:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')


def step_svg(steps: list, upto: int, final: bool = False, wmul: float = 1.0) -> str:
    """SVG group (200 x 200 units) showing steps[0..upto], the last one new.
    ``wmul`` scales line widths (to keep them even when a drawing is enlarged)."""
    out = []
    n = 0
    for i, step in enumerate(steps[: upto + 1]):
        new = final or i == upto
        col, wid = (NEW, W_NEW) if new else (OLD, W_OLD)
        for s in step:
            out.append((s.get("z", 0), n, shape_svg(s, col, wid * wmul)))
            n += 1
    out.sort()
    return "".join(t[2] for t in out)


def standalone(steps: list, upto: int | None = None, size: int = 400) -> str:
    """A complete SVG document, used for previews."""
    upto = len(steps) - 1 if upto is None else upto
    body = step_svg(steps, upto, final=upto == len(steps) - 1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
            f'viewBox="0 0 200 200"><rect width="200" height="200" fill="#fff"/>{body}</svg>')


# ---------------------------------------------------------------- helpers
import math as _m
import re as _re


def on(cx, cy, rad, deg):
    """Point on a circle; 0 deg is right, 90 deg is down (SVG direction)."""
    a = _m.radians(deg)
    return (round(cx + rad * _m.cos(a), 1), round(cy + rad * _m.sin(a), 1))


def _mirror_d(d: str, ax: float) -> str:
    toks = _re.findall(r"[MLQCTSZHVAmlqctszhva]|-?\d*\.?\d+", d)
    out, i, cmd, k = [], 0, "", 0
    for t in toks:
        if t.isalpha():
            if t in "mlqctshvaA":
                raise ValueError("mirror supports absolute M L Q C T S Z H V only")
            cmd, k = t, 0
            out.append(t)
            continue
        v = float(t)
        if cmd == "H" or (cmd in "MLQCTS" and k % 2 == 0):
            v = 2 * ax - v
        k += 1
        out.append(f"{v:g}")
    return " ".join(out)


def mirror(s: dict, ax: float = 100) -> dict:
    """Mirror a shape left-right around x = ax."""
    a = dict(s["attrs"])
    k = s["kind"]
    if k in ("circle", "ellipse", "eye"):
        a["cx"] = 2 * ax - a["cx"]
        if "transform" in a:
            rot = float(_re.search(r"rotate\((-?[\d.]+)", a["transform"]).group(1))
            a["transform"] = f"rotate({-rot:g} {a['cx']} {a['cy']})"
    elif k == "line":
        a["x1"], a["x2"] = 2 * ax - a["x1"], 2 * ax - a["x2"]
    elif k == "rect":
        a["x"] = 2 * ax - a["x"] - a["width"]
    elif k == "path":
        a["d"] = _mirror_d(a["d"], ax)
    return {**s, "attrs": a}


def sym(*shapes, ax: float = 100) -> list:
    """The shapes plus their mirror images: ears, eyes, legs, wings."""
    out = list(shapes)
    out += [mirror(s, ax) for s in shapes]
    return out


def behind(*shapes, z: float = -1) -> list:
    """Shapes drawn under everything else (give the front shape fill="white")."""
    return [{**s, "z": z} for s in shapes]


def front(*shapes, z: float = 1) -> list:
    return [{**s, "z": z} for s in shapes]


def cloud(cx, cy, rx, ry, n=10, bump=0.22, fill=None, w=1.0, start=0):
    """A fluffy outline (sheep wool, clouds, bushes) made of n bumps."""
    pts = [(cx + rx * _m.cos(_m.radians(start + 360 * k / n)),
            cy + ry * _m.sin(_m.radians(start + 360 * k / n))) for k in range(n)]
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for k in range(n):
        a = _m.radians(start + 360 * (k + 0.5) / n)
        qx = cx + rx * (1 + bump * 2) * _m.cos(a)
        qy = cy + ry * (1 + bump * 2) * _m.sin(a)
        x, y = pts[(k + 1) % n]
        d += f" Q{qx:.1f} {qy:.1f} {x:.1f} {y:.1f}"
    return p(d + " Z", fill, w)


def star(cx, cy, R, rr, n=5, rnd=0.18, fill=None, w=1.0, start=-90):
    """A star with softly rounded tips."""
    d = []
    for k in range(n):
        a_tip = _m.radians(start + 360 * k / n)
        a_in1 = _m.radians(start + 360 * (k - 0.5) / n)
        a_in2 = _m.radians(start + 360 * (k + 0.5) / n)
        tip = (cx + R * _m.cos(a_tip), cy + R * _m.sin(a_tip))
        i1 = (cx + rr * _m.cos(a_in1), cy + rr * _m.sin(a_in1))
        i2 = (cx + rr * _m.cos(a_in2), cy + rr * _m.sin(a_in2))
        p1 = (tip[0] + (i1[0] - tip[0]) * rnd, tip[1] + (i1[1] - tip[1]) * rnd)
        p2 = (tip[0] + (i2[0] - tip[0]) * rnd, tip[1] + (i2[1] - tip[1]) * rnd)
        d.append(("L" if d else "M") + f"{i1[0]:.1f} {i1[1]:.1f} L{p1[0]:.1f} {p1[1]:.1f} "
                 f"Q{tip[0]:.1f} {tip[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    return p(" ".join(d) + " Z", fill, w)


def spikes(cx, cy, rad, n=12, length=12, half=8, start=0, fill="white"):
    """Little triangles around a circle (pufferfish, sun rays, gears)."""
    out = []
    for k in range(n):
        a = start + 360 * k / n
        b1, b2 = on(cx, cy, rad - 2, a - half), on(cx, cy, rad - 2, a + half)
        t = on(cx, cy, rad + length, a)
        out.append(p(f"M{b1[0]} {b1[1]} L{t[0]} {t[1]} L{b2[0]} {b2[1]} Z", fill))
    return out


def arc(cx, cy, rx, ry, a0, a1, rot=0, w=1.0, steps=24):
    """Part of an ellipse from angle a0 to a1 (degrees), as a smooth path."""
    pts = []
    cr, sr = _m.cos(_m.radians(rot)), _m.sin(_m.radians(rot))
    for k in range(steps + 1):
        a = _m.radians(a0 + (a1 - a0) * k / steps)
        x, y = rx * _m.cos(a), ry * _m.sin(a)
        pts.append((cx + x * cr - y * sr, cy + x * sr + y * cr))
    return p("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts), None, w)


def color_svg(steps: list, main: str, colors: dict | None = None, stroke: str = "#2a2a2a") -> str:
    """The finished drawing in color, for the cover: every white-filled shape gets
    ``main`` unless ``colors`` maps its index (counting white shapes in drawing order)."""
    colors = colors or {}
    out, n, k = [], 0, 0
    for step in steps:
        for s in step:
            sv = shape_svg(s, stroke, W_NEW)
            if s["fill"] == "white":
                col = colors.get(k, main)
                sv = sv.replace('fill="#ffffff"', f'fill="{col}"', 1)
                k += 1
            out.append((s.get("z", 0), n, sv))
            n += 1
    out.sort()
    return "".join(t[2] for t in out)
