"""Generate the book's diagrams as 300 DPI PNGs (print-safe in grayscale)."""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/liberation"
BOLD = f"{FONT_DIR}/LiberationSans-Bold.ttf"
REG = f"{FONT_DIR}/LiberationSans-Regular.ttf"
ITAL = f"{FONT_DIR}/LiberationSans-Italic.ttf"

W = 1380  # 4.6 in at 300 DPI, the interior text width
NAVY = (31, 58, 95)
MID = (110, 128, 150)
LIGHT = (226, 232, 240)
PALE = (243, 246, 250)
INK = (25, 25, 25)
WHITE = (255, 255, 255)


def f(path, size):
    return ImageFont.truetype(path, size)


def wrap(d, text, font, max_w):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for w in para.split():
            t = f"{cur} {w}".strip()
            if d.textlength(t, font=font) <= max_w:
                cur = t
            else:
                lines.append(cur)
                cur = w
        lines.append(cur)
    return lines


def box(d, xy, text, fill=LIGHT, color=INK, font=None, sub=None, radius=22, outline=None):
    x0, y0, x1, y1 = xy
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=4 if outline else 0)
    font = font or f(BOLD, 40)
    sfont = f(REG, 30)
    lines = wrap(d, text, font, x1 - x0 - 30)
    slines = wrap(d, sub, sfont, x1 - x0 - 30) if sub else []
    lh, slh = font.size * 1.18, sfont.size * 1.22
    total = len(lines) * lh + (len(slines) * slh + 8 if slines else 0)
    y = (y0 + y1) / 2 - total / 2
    for ln in lines:
        d.text(((x0 + x1) / 2, y), ln, font=font, fill=color, anchor="ma")
        y += lh
    if slines:
        y += 8
        for ln in slines:
            d.text(((x0 + x1) / 2, y), ln, font=sfont, fill=color if color != INK else (70, 70, 70),
                   anchor="ma")
            y += slh


def arrow(d, p0, p1, color=NAVY, width=7, head=26):
    d.line([p0, p1], fill=color, width=width)
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    a, b = ang + math.radians(150), ang - math.radians(150)
    d.polygon([p1, (p1[0] + head * math.cos(a), p1[1] + head * math.sin(a)),
               (p1[0] + head * math.cos(b), p1[1] + head * math.sin(b))], fill=color)


def poly_arrow(d, pts, color=NAVY, width=7):
    for p, q in zip(pts[:-2], pts[1:-1]):
        d.line([p, q], fill=color, width=width)
    arrow(d, pts[-2], pts[-1], color, width)


def canvas(h):
    img = Image.new("RGB", (W, h), WHITE)
    return img, ImageDraw.Draw(img)


def cycle(steps, h=900, rx=440, ry=320, hw=210, hh=62, center=None, first_dark=True, fs=34):
    """Boxes arranged in a ring with arrows between them, optional text in the middle."""
    img, d = canvas(h)
    cx, cy = W / 2, h / 2
    pts = []
    for i in range(len(steps)):
        a = -math.pi / 2 + i * 2 * math.pi / len(steps)
        pts.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))

    def edge(c, toward, gap=14):
        dx, dy = toward[0] - c[0], toward[1] - c[1]
        t = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
        L = math.hypot(dx, dy)
        return (c[0] + dx * t + dx / L * gap, c[1] + dy * t + dy / L * gap)

    for i in range(len(pts)):
        p, q = pts[i], pts[(i + 1) % len(pts)]
        arrow(d, edge(p, q), edge(q, p), color=MID, width=6)
    for i, ((x, y), st) in enumerate(zip(pts, steps)):
        title, sub = st if isinstance(st, tuple) else (st, None)
        dark = first_dark and i == 0
        box(d, (x - hw, y - hh, x + hw, y + hh), title, NAVY if dark else LIGHT,
            WHITE if dark else INK, font=f(BOLD, fs), sub=sub)
    if center:
        for k, line in enumerate(center):
            d.text((cx, cy - 22 * len(center) + 44 * k), line, font=f(ITAL, 32), fill=MID, anchor="ma")
    return img



MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
MONOB = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"


def label(d, xy, text, size=30, font=REG, fill=INK, anchor="ma"):
    d.text(xy, text, font=f(font, size), fill=fill, anchor=anchor)


def pipeline():
    steps = [("Application or referral", None),
             ("Recruiter screen", "fit, logistics, timeline"),
             ("Online assessment", "some roles: timed, auto-graded"),
             ("Technical screen", "one coding interview, 45 to 60 min"),
             ("Final round", "4 to 6 interviews: coding, design, behavioral"),
             ("Hiring decision", "committee or debrief"),
             ("Team matching and offer", None)]
    bh, gap = 112, 46
    h = 60 + len(steps) * bh + (len(steps) - 1) * gap + 40
    img, d = canvas(h)
    x0, x1 = 240, W - 240
    y = 60
    for i, (t, sub) in enumerate(steps):
        dark = i == 4
        box(d, (x0, y, x1, y + bh), t, NAVY if dark else LIGHT, WHITE if dark else INK,
            font=f(BOLD, 38), sub=sub)
        if i < len(steps) - 1:
            arrow(d, (W / 2, y + bh + 4), (W / 2, y + bh + gap - 4), color=MID, width=6, head=20)
        y += bh + gap
    return img


def six_steps():
    steps = [("1. Clarify", "about 3 min"), ("2. Examples", "about 2 min"),
             ("3. Brute force", "about 3 min"), ("4. Optimize", "about 5 min"),
             ("5. Code", "about 15 min"), ("6. Test", "about 5 min")]
    return cycle(steps, h=900, rx=470, ry=320, hw=175, hh=70,
                 center=["Think aloud", "the whole time"], fs=38)


def growth():
    h = 1000
    img, d = canvas(h)
    left, right, top, bottom = 150, W - 260, 60, h - 130
    d.line((left, bottom, right, bottom), fill=INK, width=4)
    d.line((left, bottom, left, top), fill=INK, width=4)
    label(d, ((left + right) / 2, bottom + 60), "input size n", 34)
    d.text((60, (top + bottom) / 2), "steps", font=f(REG, 34), fill=INK, anchor="mm")
    nmax, ymax = 30, 120
    curves = [("O(2ⁿ)", lambda n: 2 ** n, NAVY, 0),
              ("O(n²)", lambda n: n * n, NAVY, 1),
              ("O(n log n)", lambda n: n * math.log2(n), MID, 0),
              ("O(n)", lambda n: n, MID, 1),
              ("O(log n)", lambda n: math.log2(n), (150, 160, 175), 0),
              ("O(1)", lambda n: 1, (150, 160, 175), 1)]
    for name, fn, color, dash in curves:
        pts = []
        n = 1.0
        while n <= nmax:
            v = fn(n)
            if v > ymax:
                break
            pts.append((left + (n - 1) / (nmax - 1) * (right - left),
                        bottom - v / ymax * (bottom - top)))
            n += 0.05
        width = 8 if color == NAVY else 6
        if dash:
            for k in range(0, len(pts) - 1, 12):
                d.line(pts[k:k + 7], fill=color, width=width)
        else:
            d.line(pts, fill=color, width=width, joint="curve")
        ex, ey = pts[-1]
        if name == "O(2ⁿ)":
            d.text((ex - 14, ey + 10), name, font=f(BOLD, 34), fill=color, anchor="rt")
        elif ey < top + 20:
            d.text((ex + 14, ey), name, font=f(BOLD, 34), fill=color, anchor="lm")
        else:
            nudge = {"O(log n)": -22, "O(1)": 22}.get(name, 0)
            d.text((right + 18, ey + nudge), name, font=f(BOLD, 34), fill=color, anchor="lm")
    return img


def cells(d, x, y, values, size=120, fill=None, font_size=46):
    fill = fill or {}
    for i, v in enumerate(values):
        bg = fill.get(i, WHITE)
        d.rectangle((x + i * size, y, x + (i + 1) * size, y + size), fill=bg, outline=INK, width=3)
        color = WHITE if bg == NAVY else INK
        d.text((x + i * size + size / 2, y + size / 2), str(v), font=f(BOLD, font_size),
               fill=color, anchor="mm")


def sliding_window():
    vals = [3, 8, 1, 9, 2, 7, 4]
    size = 140
    x = (W - size * len(vals)) / 2
    h = 760
    img, d = canvas(h)
    rows = [(110, 1, 3, "window [8, 1, 9]: sum 18"), (440, 2, 4, "slide: 18 - 8 + 2 = 12")]
    for y, lo, hi, text in rows:
        fill = {i: LIGHT for i in range(lo, hi + 1)}
        if y > 200:
            fill[lo - 1] = (205, 210, 218)
            fill[hi] = NAVY
        cells(d, x, y, vals, size, fill)
        d.rounded_rectangle((x + lo * size - 8, y - 8, x + (hi + 1) * size + 8, y + size + 8),
                            radius=14, outline=NAVY, width=6)
        label(d, (W / 2, y + size + 30), text, 36, BOLD)
    y = 440
    label(d, (x + 0.5 * size, y - 80), "leaves", 32, ITAL, MID)
    arrow(d, (x + 0.5 * size, y - 40), (x + 0.5 * size, y - 6), color=MID, width=5, head=18)
    label(d, (x + 4.5 * size, y - 80), "enters", 32, ITAL, NAVY)
    arrow(d, (x + 4.5 * size, y - 40), (x + 4.5 * size, y - 6), color=NAVY, width=5, head=18)
    return img


def region_sum():
    n, size = 6, 120
    h = 960
    img, d = canvas(h)
    x0, y0 = 200, 80
    r1, c1, r2, c2 = 2, 2, 5, 5  # region rows 2..4, cols 2..4 (exclusive ends)
    for r in range(n):
        for c in range(n):
            if r < r2 and c < c2:
                fill = PALE
            else:
                fill = WHITE
            if r1 <= r < r2 and c1 <= c < c2:
                fill = NAVY
            elif r < r1 and c < c1:
                fill = (205, 210, 218)
            d.rectangle((x0 + c * size, y0 + r * size, x0 + (c + 1) * size, y0 + (r + 1) * size),
                        fill=fill, outline=(170, 170, 170), width=2)
    d.rectangle((x0, y0, x0 + c2 * size, y0 + r2 * size), outline=INK, width=6)
    d.text((x0 + 3.5 * size, y0 + 3.5 * size), "region", font=f(BOLD, 40), fill=WHITE, anchor="mm")
    d.text((x0 + 1 * size, y0 + 1 * size), "D", font=f(BOLD, 46), fill=INK, anchor="mm")
    d.text((x0 + 3.5 * size, y0 + 1 * size), "B", font=f(BOLD, 46), fill=INK, anchor="mm")
    d.text((x0 + 1 * size, y0 + 3.5 * size), "C", font=f(BOLD, 46), fill=INK, anchor="mm")
    tx = x0 + n * size + 60
    lines = [("A = whole outlined", BOLD), ("rectangle", REG), ("", REG),
             ("region =", BOLD), ("A - B - C + D", BOLD), ("", REG),
             ("B: strip above", REG), ("C: strip to the left", REG),
             ("D: corner, removed", REG), ("twice, added back", REG)]
    y = y0 + 20
    for t, fnt in lines:
        d.text((tx, y), t, font=f(fnt, 36), fill=INK)
        y += 54
    return img


def binary_search():
    answers = ["no", "no", "no", "no", "no", "yes", "yes", "yes"]
    size = 140
    x = (W - size * len(answers)) / 2
    steps = []
    lo, hi = 0, len(answers) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        steps.append((lo, hi, mid))
        if answers[mid] == "yes":
            hi = mid
        else:
            lo = mid + 1
    first = lo
    h = 200 + len(steps) * 250
    img, d = canvas(h)
    y = 70
    for lo, hi, mid in steps:
        fill = {i: (lambda k: LIGHT if lo <= k <= hi else (235, 235, 235))(i)
                for i in range(len(answers))}
        fill[mid] = NAVY
        cells(d, x, y, answers, size, fill, 38)
        label(d, (x + lo * size + size / 2, y + size + 14), "lo", 32, BOLD, NAVY)
        label(d, (x + hi * size + size / 2, y + size + 14), "hi", 32, BOLD, NAVY)
        verdict = "yes: hi = mid" if answers[mid] == "yes" else "no: lo = mid + 1"
        label(d, (W / 2, y + size + 60), f"check mid = {mid}, {verdict}", 32, ITAL, MID)
        y += 250
    label(d, (W / 2, y + 10), f"lo = hi = {first}: the first yes", 38, BOLD, NAVY)
    return img


def tree_layout(d, nodes, edges, r=48, dark=(), fs=40):
    for a, b in edges:
        d.line((nodes[a], nodes[b]), fill=MID, width=5)
    for name, (x, y) in nodes.items():
        filled = name in dark
        d.ellipse((x - r, y - r, x + r, y + r), fill=NAVY if filled else LIGHT,
                  outline=NAVY, width=4)
        d.text((x, y), str(name), font=f(BOLD, fs), fill=WHITE if filled else INK, anchor="mm")


def tree_traversals():
    h = 760
    img, d = canvas(h)
    edges = [(8, 4), (8, 12), (4, 2), (4, 6), (12, 10), (12, 14)]
    for k, (title, order) in enumerate([("Depth-first (pre-order)", "8, 4, 2, 6, 12, 10, 14"),
                                        ("Breadth-first (level order)", "8, 4, 12, 2, 6, 10, 14")]):
        cx = W / 4 + k * W / 2
        nodes = {8: (cx, 170), 4: (cx - 150, 340), 12: (cx + 150, 340),
                 2: (cx - 230, 510), 6: (cx - 70, 510), 10: (cx + 70, 510), 14: (cx + 230, 510)}
        tree_layout(d, nodes, edges, r=44, dark=(8,))
        label(d, (cx, 50), title, 36, BOLD)
        label(d, (cx, 610), order, 34, REG)
        label(d, (cx, 660), "stack / recursion" if k == 0 else "queue", 30, ITAL, MID)
    d.line((W / 2, 40, W / 2, h - 40), fill=LIGHT, width=4)
    return img


def backtracking():
    h = 820
    img, d = canvas(h)
    nodes = {"{}": (W / 2, 110),
             "skip a": (W / 2 - 330, 340), "take a": (W / 2 + 330, 340),
             "[]": (W / 2 - 500, 600), "[b]": (W / 2 - 170, 600),
             "[a]": (W / 2 + 170, 600), "[a, b]": (W / 2 + 500, 600)}
    edges = [("{}", "skip a", "skip a"), ("{}", "take a", "take a"),
             ("skip a", "[]", "skip b"), ("skip a", "[b]", "take b"),
             ("take a", "[a]", "skip b"), ("take a", "[a, b]", "take b")]
    for a, b, text in edges:
        (x0, y0), (x1, y1) = nodes[a], nodes[b]
        d.line((x0, y0 + 50, x1, y1 - 50), fill=MID, width=5)
        d.text(((x0 + x1) / 2 + (18 if x1 > x0 else -18), (y0 + y1) / 2), text,
               font=f(ITAL, 30), fill=MID, anchor="lm" if x1 > x0 else "rm")
    for name, (x, y) in nodes.items():
        leaf = y > 500
        if name in ("skip a", "take a"):
            text = "[]" if name == "skip a" else "[a]"
        else:
            text = name if leaf else "[]"
        box(d, (x - 120, y - 50, x + 120, y + 50), text, NAVY if leaf else LIGHT,
            WHITE if leaf else INK, font=f(BOLD, 40))
    label(d, (W / 2, 710), "Each leaf is one subset. Going back up a level undoes the last choice.",
          32, ITAL, MID)
    return img


def dijkstra():
    h = 820
    img, d = canvas(h)
    pos = {"S": (200, 400), "A": (560, 180), "B": (560, 620), "C": (920, 400), "T": (1200, 400)}
    edges = [("S", "A", 4), ("S", "B", 1), ("B", "A", 2), ("A", "C", 1), ("B", "C", 5),
             ("C", "T", 3)]
    dist = {"S": 0, "B": 1, "A": 3, "C": 4, "T": 7}
    for a, b, w in edges:
        (x0, y0), (x1, y1) = pos[a], pos[b]
        L = math.hypot(x1 - x0, y1 - y0)
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        arrow(d, (x0 + ux * 62, y0 + uy * 62), (x1 - ux * 66, y1 - uy * 66), color=MID, width=5,
              head=22)
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        d.ellipse((mx - 26, my - 26, mx + 26, my + 26), fill=WHITE)
        d.text((mx, my), str(w), font=f(BOLD, 34), fill=INK, anchor="mm")
    order = ["S", "B", "A", "C", "T"]
    for name, (x, y) in pos.items():
        d.ellipse((x - 58, y - 58, x + 58, y + 58), fill=NAVY, outline=NAVY)
        d.text((x, y - 12), name, font=f(BOLD, 40), fill=WHITE, anchor="mm")
        d.text((x, y + 26), f"d = {dist[name]}", font=f(REG, 26), fill=WHITE, anchor="mm")
    label(d, (W / 2, 730), "Settled in order: " + ", ".join(order)
          + ". A is reached via B (1 + 2 = 3), not directly (4).", 30, ITAL, MID)
    return img


def dp_recursion():
    h = 900
    img, d = canvas(h)
    # Recursion tree of stair_ways(5): children n-1 and n-2, stopping at n <= 1.
    levels = {}

    def build(n, depth, lo, hi):
        x = (lo + hi) / 2
        y = 80 + depth * 145
        node = (n, x, y)
        levels.setdefault(depth, []).append(node)
        kids = []
        if n > 1:
            span = hi - lo
            kids.append(build(n - 1, depth + 1, lo, lo + span * 0.6))
            kids.append(build(n - 2, depth + 1, lo + span * 0.6, hi))
        for kn, kx, ky in kids:
            d.line((x, y + 34, kx, ky - 34), fill=MID, width=4)
        return node

    build(5, 0, 40, W - 40)
    counts = {}
    for nodes in levels.values():
        for n, _, _ in nodes:
            counts[n] = counts.get(n, 0) + 1
    for nodes in levels.values():
        for n, x, y in nodes:
            repeated = n in (3, 2) and counts[n] > 1
            d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=NAVY if repeated else LIGHT,
                      outline=NAVY, width=3)
            d.text((x, y), str(n), font=f(BOLD, 34), fill=WHITE if repeated else INK,
                   anchor="mm")
    label(d, (W / 2, 790), f"Without a cache, ways(3) is computed {counts[3]} times "
          f"and ways(2) {counts[2]} times.", 30, ITAL, MID)
    label(d, (W / 2, 835), "With a cache or a table, each state is computed once.", 30, ITAL,
          MID)
    return img


def dp_table():
    a, b = "dynamic", "drama"
    t = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            t[i][j] = t[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(t[i - 1][j], t[i][j - 1])
    size = 104
    cols, rows = len(b) + 2, len(a) + 2
    x0 = (W - cols * size) / 2
    y0 = 40
    h = y0 + rows * size + 120
    img, d = canvas(h)
    for j, ch in enumerate(" " + b):
        d.text((x0 + (j + 1.5) * size, y0 + size / 2), ch.strip() or '""', font=f(BOLD, 40),
               fill=NAVY, anchor="mm")
    for i, ch in enumerate(" " + a):
        d.text((x0 + size / 2, y0 + (i + 1.5) * size), ch.strip() or '""', font=f(BOLD, 40),
               fill=NAVY, anchor="mm")
    for i in range(len(a) + 1):
        for j in range(len(b) + 1):
            match = i and j and a[i - 1] == b[j - 1]
            on_path = False
            fill = NAVY if match and t[i][j] > t[i - 1][j - 1] and t[i][j] > max(
                t[i - 1][j], t[i][j - 1]) - 1 and t[i][j] == t[i - 1][j - 1] + 1 else WHITE
            if fill == WHITE and (i == 0 or j == 0):
                fill = PALE
            X, Y = x0 + (j + 1) * size, y0 + (i + 1) * size
            d.rectangle((X, Y, X + size, Y + size), fill=fill, outline=(170, 170, 170), width=2)
            d.text((X + size / 2, Y + size / 2), str(t[i][j]), font=f(BOLD, 38),
                   fill=WHITE if fill == NAVY else INK, anchor="mm")
            del on_path
    label(d, (W / 2, y0 + rows * size + 30), f"Dark cells: matching characters (diagonal + 1). "
          f"Answer: {t[-1][-1]}.", 32, ITAL, MID)
    return img


def trie():
    h = 900
    img, d = canvas(h)
    nodes = {"root": (W / 2, 70), "r": (W / 2, 190), "o": (W / 2, 310),
             "c": (W / 2 - 220, 430), "s": (W / 2 + 220, 430),
             "k": (W / 2 - 220, 550), "e2": (W / 2 + 220, 550),
             "e": (W / 2 - 220, 670), "t": (W / 2 - 220, 790)}
    text = {"root": "", "r": "r", "o": "o", "c": "c", "s": "s", "k": "k", "e2": "e",
            "e": "e", "t": "t"}
    edges = [("root", "r"), ("r", "o"), ("o", "c"), ("o", "s"), ("c", "k"), ("s", "e2"),
             ("k", "e"), ("e", "t")]
    ends = {"k": "rock", "e2": "rose", "t": "rocket"}
    for a, b in edges:
        d.line((nodes[a], nodes[b]), fill=MID, width=5)
    for name, (x, y) in nodes.items():
        end = name in ends
        r = 42
        d.ellipse((x - r, y - r, x + r, y + r), fill=NAVY if end else LIGHT, outline=NAVY, width=4)
        d.text((x, y), text[name], font=f(BOLD, 40), fill=WHITE if end else INK, anchor="mm")
        if end:
            d.text((x + 70, y), f'end of "{ends[name]}"', font=f(ITAL, 32), fill=NAVY, anchor="lm")
    d.text((W / 2 + 70, 70), "root", font=f(ITAL, 32), fill=MID, anchor="lm")
    d.text((W / 2 + 70, 250), 'shared prefix "ro"', font=f(ITAL, 32), fill=MID, anchor="lm")
    return img


def bike_share():
    h = 900
    img, d = canvas(h)

    def cls(xy, name, lines, dark=False):
        x0, y0, x1, y1 = xy
        d.rectangle(xy, fill=WHITE, outline=NAVY, width=4)
        d.rectangle((x0, y0, x1, y0 + 64), fill=NAVY if dark else LIGHT, outline=NAVY, width=4)
        d.text(((x0 + x1) / 2, y0 + 32), name, font=f(BOLD, 34), fill=WHITE if dark else INK,
               anchor="mm")
        for k, ln in enumerate(lines):
            d.text((x0 + 18, y0 + 84 + k * 40), ln, font=f(REG, 28), fill=INK)

    cls((470, 40, 910, 250), "BikeShare", ["stations", "active rides", "rent(), give_back()"], True)
    cls((40, 360, 420, 570), "Station", ["capacity, bikes", "take(), dock()"])
    cls((500, 360, 880, 530), "Ride", ["bike, start time"])
    cls((960, 360, 1340, 530), "Rider", ["name, plan"])
    cls((40, 690, 420, 860), "Bike", ["id, kind"])
    cls((780, 640, 1340, 760), "PricingPlan", ["fee(kind, minutes)"])
    cls((780, 800, 1040, 880), "PayPerRide", [])
    cls((1080, 800, 1340, 880), "Membership", [])
    arrow(d, (600, 250), (300, 356), color=MID, width=5, head=20)
    arrow(d, (690, 250), (690, 356), color=MID, width=5, head=20)
    arrow(d, (230, 570), (230, 686), color=MID, width=5, head=20)
    arrow(d, (690, 530), (380, 700), color=MID, width=5, head=20)
    arrow(d, (1150, 530), (1150, 636), color=MID, width=5, head=20)
    for x in (910, 1210):
        d.line((x, 800, x, 780), fill=NAVY, width=4)
        d.polygon([(x - 14, 780), (x + 14, 780), (x, 762)], fill=WHITE, outline=NAVY)
    label(d, (1000, 590), "has a", 28, ITAL, MID, "lm")
    label(d, (1225, 590), "has a", 28, ITAL, MID, "lm")
    return img


def link_shortener():
    h = 900
    img, d = canvas(h)
    box(d, (40, 360, 260, 480), "Clients", LIGHT, font=f(BOLD, 36))
    box(d, (330, 360, 560, 480), "Load balancer", LIGHT, font=f(BOLD, 34))
    box(d, (640, 330, 920, 510), "Link service", NAVY, WHITE, font=f(BOLD, 36),
        sub="stateless, many copies")
    box(d, (1010, 80, 1340, 220), "Cache", LIGHT, font=f(BOLD, 36), sub="hot links in memory")
    box(d, (1010, 360, 1340, 500), "Key-value store", LIGHT, font=f(BOLD, 34),
        sub="sharded by short key")
    box(d, (1010, 640, 1340, 780), "ID generator", LIGHT, font=f(BOLD, 36), sub="unique keys")
    box(d, (640, 680, 920, 820), "Click queue", PALE, font=f(BOLD, 34), sub="analytics, async")
    arrow(d, (262, 420), (326, 420))
    arrow(d, (562, 420), (636, 420))
    poly_arrow(d, [(920, 360), (960, 360), (960, 150), (1006, 150)])
    arrow(d, (922, 430), (1006, 430))
    poly_arrow(d, [(920, 480), (960, 480), (960, 710), (1006, 710)])
    arrow(d, (780, 512), (780, 676), color=MID, width=5, head=20)
    label(d, (968, 250), "1. read", 28, ITAL, MID, "lm")
    label(d, (968, 530), "2. on miss", 28, ITAL, MID, "lm")
    label(d, (968, 600), "create", 28, ITAL, MID, "lm")
    return img


def build_diagrams(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in [("diagram-pipeline", pipeline), ("diagram-six-steps", six_steps),
                     ("diagram-growth", growth), ("diagram-sliding-window", sliding_window),
                     ("diagram-region-sum", region_sum), ("diagram-binary-search", binary_search),
                     ("diagram-tree-traversals", tree_traversals),
                     ("diagram-backtracking", backtracking), ("diagram-dijkstra", dijkstra),
                     ("diagram-dp-recursion", dp_recursion), ("diagram-dp-table", dp_table),
                     ("diagram-trie", trie), ("diagram-bike-share", bike_share),
                     ("diagram-link-shortener", link_shortener)]:
        fn().save(out_dir / f"{name}.png", dpi=(300, 300))


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" / "images")
