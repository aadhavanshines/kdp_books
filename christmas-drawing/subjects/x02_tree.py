import math as _m
from draw import *

CATEGORY = "Tree and Decorations"


def holly_leaf(cx, cy, length, width, angle, fill="white"):
    """A spiky holly leaf: points along both edges joined by inward curves."""
    a = _m.radians(angle)
    ux, uy = _m.cos(a), _m.sin(a)          # along the leaf
    vx, vy = -uy, ux                       # across the leaf

    def pt(t, s):
        return (cx + ux * t + vx * s, cy + uy * t + vy * s)

    n = 4
    tips = [(-length / 2 + length * k / n) for k in range(n + 1)]
    top = [pt(t, width * _m.sin(_m.pi * (k / n)) * (1 if 0 < k < n else 0)) for k, t in enumerate(tips)]
    bot = [pt(t, -width * _m.sin(_m.pi * (k / n)) * (1 if 0 < k < n else 0)) for k, t in enumerate(tips)]
    d = f"M{top[0][0]:.1f} {top[0][1]:.1f}"
    for k in range(1, n + 1):
        mx, my = pt((tips[k - 1] + tips[k]) / 2, width * 0.45 * _m.sin(_m.pi * (k - 0.5) / n))
        d += f" Q{mx:.1f} {my:.1f} {top[k][0]:.1f} {top[k][1]:.1f}"
    for k in range(n - 1, -1, -1):
        mx, my = pt((tips[k + 1] + tips[k]) / 2, -width * 0.45 * _m.sin(_m.pi * (k + 0.5) / n))
        d += f" Q{mx:.1f} {my:.1f} {bot[k][0]:.1f} {bot[k][1]:.1f}"
    return p(d + " Z", fill)


def vein(cx, cy, length, angle):
    a = _m.radians(angle)
    dx, dy = _m.cos(a) * length * 0.42, _m.sin(a) * length * 0.42
    return l(round(cx - dx, 1), round(cy - dy, 1), round(cx + dx, 1), round(cy + dy, 1))


def snow_arm_lines():
    out = []
    for k in range(6):
        a = 90 + 60 * k
        out.append(l(*on(100, 100, 12, a), *on(100, 100, 70, a)))
    return out


SUBJECTS = [
    dict(name="Christmas Tree", steps=[
        [front(p("M100 34 L132 76 L68 76 Z", fill="white"), z=3)[0]],
        [front(p("M100 58 L144 112 L56 112 Z", fill="white"), z=2)[0]],
        [front(p("M100 90 L158 150 L42 150 Z", fill="white"), z=1)[0]],
        [r(88, 148, 24, 22, 3, fill="white"), front(star(100, 32, 15, 6.5, fill="white"), z=4)[0]],
        front(c(88, 70, 5), c(116, 98, 5), c(78, 104, 5), c(104, 132, 5), c(70, 140, 5), c(134, 140, 5), z=5) +
        front(p("M80 62 Q100 72 118 64"), p("M66 96 Q100 110 134 98"), p("M56 130 Q100 146 146 132"), z=4.5),
    ]),
    dict(name="Christmas Star", steps=[
        [star(100, 104, 72, 32, fill="white")],
        [star(100, 104, 50, 22)],
        sym(eye(91, 104)) + [p("M92 116 Q100 122 108 116")],
        [l(*on(100, 104, 82, a), *on(100, 104, 94, a)) for a in range(-54, 306, 72)],
        [star(30, 40, 7, 2.6, n=4), star(170, 44, 8, 3, n=4), star(170, 166, 6, 2.4, n=4), star(30, 160, 6, 2.4, n=4)],
    ]),
    dict(name="Ornament", steps=[
        [c(100, 114, 50, fill="white")],
        [front(r(88, 56, 24, 14, 3, fill="white"))[0]],
        [p("M100 56 Q90 38 100 32 Q112 28 112 40")],
        [p("M52 104 L64 94 L76 104 L88 94 L100 104 L112 94 L124 104 L136 94 L148 104"),
         p("M52 124 L64 134 L76 124 L88 134 L100 124 L112 134 L124 124 L136 134 L148 124")],
        [c(80, 82, 4), c(100, 78, 4), c(120, 82, 4), c(80, 148, 4), c(100, 152, 4), c(120, 148, 4), p("M66 92 Q70 80 80 74")],
    ]),
    dict(name="Candy Cane", steps=[
        [p("M84 178 L84 72 Q84 28 120 28 Q156 28 156 72 L156 84 L134 84 L134 72 Q134 50 120 50 Q106 50 106 72 L106 178 Q95 186 84 178 Z", fill="white")],
        [l(84, 168, 106, 154), l(84, 146, 106, 132), l(84, 124, 106, 110), l(84, 102, 106, 88)],
        [l(85, 80, 106, 70), l(94, 38, 108, 51), l(118, 28, 120, 50), l(140, 34, 130, 53), l(156, 62, 134, 66)],
        front(*sym(p("M95 118 Q74 100 70 118 Q74 132 95 120 Z", fill="white"), ax=95), c(95, 119, 6, fill="white"), z=2) +
        front(*sym(p("M92 124 L82 148 M98 124 L108 148"), ax=95), z=1.5)[:2],
    ]),
    dict(name="Stocking", steps=[
        [p("M80 44 L80 122 Q80 150 104 158 L132 166 Q158 172 162 150 Q164 132 142 126 L118 118 L118 44 Z", fill="white")],
        [front(r(72, 30, 54, 24, 8, fill="white"))[0]],
        [p("M80 132 Q94 122 102 146"), p("M138 126 Q150 140 146 168")],
        [p("M76 36 Q64 22 78 16")],
        [star(99, 86, 13, 5.5), c(84, 41, 3), c(99, 41, 3), c(114, 41, 3)],
    ]),
    dict(name="Bell", steps=[
        [p("M100 42 Q66 44 66 96 Q64 126 52 140 L148 140 Q136 126 134 96 Q134 44 100 42 Z", fill="white")],
        [front(r(46, 134, 108, 12, 6, fill="white"))[0]],
        behind(c(100, 156, 10, fill="white")),
        front(*sym(p("M100 40 Q70 14 70 36 Q72 50 100 40 Z", fill="white")), c(100, 40, 7, fill="white"), z=1),
        [p("M80 70 Q76 90 78 110"), p("M30 110 Q24 120 30 130"), p("M170 110 Q176 120 170 130")],
    ]),
    dict(name="Wreath", steps=[
        [cloud(100, 100, 60, 60, 16, 0.1, fill="white")],
        [front(cloud(100, 100, 30, 30, 10, 0.14, fill="white"))[0]],
        [c(64, 76, 5, fill="ink"), c(72, 70, 5, fill="ink"), c(136, 76, 5, fill="ink"), c(128, 70, 5, fill="ink"),
         c(100, 46, 5, fill="ink"), c(60, 116, 5, fill="ink"), c(140, 116, 5, fill="ink")],
        front(*sym(p("M100 152 Q70 134 68 156 Q72 172 100 156 Z", fill="white")), c(100, 154, 8, fill="white"), z=2),
        front(*sym(p("M96 160 L84 188 L94 184 L98 190 L102 162")), z=1.5)[:1] +
        front(p("M104 160 L116 188 L106 184 L102 190 L98 162"), z=1.5),
    ]),
    dict(name="Holly", steps=[
        [holly_leaf(72, 92, 76, 22, 20)],
        [holly_leaf(128, 92, 76, 22, 160)],
        [front(holly_leaf(100, 130, 64, 18, 90), z=-0.5)[0]],
        [vein(72, 92, 76, 20), vein(128, 92, 76, 160), vein(100, 130, 64, 90)],
        front(c(92, 96, 9, fill="white"), c(108, 96, 9, fill="white"), c(100, 84, 9, fill="white"), z=2) +
        front(dot(89, 93, 2), dot(105, 93, 2), dot(97, 81, 2), z=3),
    ]),
    dict(name="Candle", steps=[
        [r(84, 72, 32, 94, 4, fill="white")],
        [l(100, 72, 100, 62), p("M100 28 Q84 50 100 62 Q116 50 100 28 Z", fill="white"), p("M100 42 Q94 52 100 58 Q106 52 100 42 Z")],
        [front(p("M84 80 Q84 72 92 72 L108 72 Q116 72 116 80 L116 90 Q112 96 110 88 Q108 100 104 92 Q100 84 96 96 Q92 102 92 90 Q88 98 84 88 Z", fill="white"))[0]],
        behind(e(100, 168, 46, 10, fill="white"), p("M146 166 Q166 160 160 176 Q154 182 140 174", fill="white")),
        [l(*on(100, 46, 26, a), *on(100, 46, 36, a)) for a in (-150, -120, -60, -30, 180, 0)],
    ]),
    dict(name="Christmas Bow", steps=[
        [p("M100 96 Q48 46 44 92 Q48 128 100 102 Z", fill="white")],
        [p("M100 96 Q152 46 156 92 Q152 128 100 102 Z", fill="white")],
        [front(e(100, 99, 13, 15, fill="white"))[0]],
        behind(p("M94 108 L70 168 L84 160 L92 174 L104 112 Z", fill="white"),
               p("M106 108 L130 168 L116 160 L108 174 L96 112 Z", fill="white")),
        [p("M96 96 Q70 76 58 90"), p("M104 96 Q130 76 142 90")],
    ]),
]
