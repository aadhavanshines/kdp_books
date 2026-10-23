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
    # Shrink the text until it fits inside the box.
    while True:
        lines = wrap(d, text, font, x1 - x0 - 30)
        slines = wrap(d, sub, sfont, x1 - x0 - 30) if sub else []
        lh, slh = font.size * 1.18, sfont.size * 1.22
        total = len(lines) * lh + (len(slines) * slh + 8 if slines else 0)
        wide = max(d.textlength(ln, font=font) for ln in lines) > x1 - x0 - 20
        if (total <= y1 - y0 - 14 and not wide) or font.size <= 22:
            break
        font = f(font.path, font.size - 2)
        sfont = f(sfont.path, max(20, sfont.size - 2))
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




# ---------------------------------------------------------------- helpers

def store(d, xy, text, sub=None, fill=PALE, color=INK):
    """A database-style box: a rounded rectangle with a curved top band."""
    x0, y0, x1, y1 = xy
    d.rounded_rectangle(xy, radius=18, fill=fill, outline=NAVY, width=4)
    d.arc((x0 + 4, y0 - 16, x1 - 4, y0 + 30), 0, 180, fill=NAVY, width=4)
    box(d, (x0, y0 + 10, x1, y1), text, fill=fill, color=color, font=f(BOLD, 32), sub=sub, radius=18)


def clip(center, half_w, half_h, toward, gap=10):
    cx, cy = center
    dx, dy = toward[0] - cx, toward[1] - cy
    if dx == 0 and dy == 0:
        return center
    t = min(half_w / abs(dx) if dx else 1e9, half_h / abs(dy) if dy else 1e9)
    length = math.hypot(dx, dy)
    return (cx + dx * t + dx / length * gap, cy + dy * t + dy / length * gap)


def arch(h, nodes, edges, title=None):
    """Draw an architecture diagram.

    nodes: name -> (cx, cy, w, h, title, sub, style); style is one of
           "dark", "light", "pale", "store", "plain".
    edges: (a, b, label, opts) with opts a dict: via=[points], dash, color.
    """
    img, d = canvas(h)
    if title:
        label(d, (W / 2, 20), title, 32, BOLD, NAVY)
    centers, labels = {}, []
    for name, (cx, cy, w, hh, *_rest) in nodes.items():
        centers[name] = (cx, cy, w / 2, hh / 2)
    for a, b, text, *opt in edges:
        opts = opt[0] if opt else {}
        ax, ay, aw, ah = centers[a]
        bx, by, bw, bh = centers[b]
        via = opts.get("via", [])
        first = via[0] if via else (bx, by)
        last = via[-1] if via else (ax, ay)
        p0 = clip((ax, ay), aw, ah, first)
        p1 = clip((bx, by), bw, bh, last)
        color = opts.get("color", MID)
        pts = [p0, *via, p1]
        for p, q in zip(pts[:-2], pts[1:-1]):
            d.line([p, q], fill=color, width=5)
        arrow(d, pts[-2], pts[-1], color=color, width=5, head=20)
        if opts.get("both"):
            arrow(d, pts[1], pts[0], color=color, width=5, head=20)
        if text:
            labels.append((pts, text, opts))
    for name, (cx, cy, w, hh, ttl, sub, style) in nodes.items():
        xy = (cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2)
        if style == "store":
            store(d, xy, ttl, sub)
        elif style == "dark":
            box(d, xy, ttl, NAVY, WHITE, font=f(BOLD, 32), sub=sub)
        elif style == "pale":
            box(d, xy, ttl, PALE, INK, font=f(BOLD, 32), sub=sub, outline=(170, 180, 195))
        else:
            box(d, xy, ttl, LIGHT, INK, font=f(BOLD, 32), sub=sub)
    for pts, text, opts in labels:
        if "at" in opts:
            mx, my = opts["at"]
        else:
            i = len(pts) // 2
            mx, my = (pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2
        fnt = f(ITAL, 26)
        tw = d.textlength(text, font=fnt)
        d.rectangle((mx - tw / 2 - 6, my - 17, mx + tw / 2 + 6, my + 17), fill=WHITE)
        d.text((mx, my), text, font=fnt, fill=MID, anchor="mm")
    return img


def N(cx, cy, title, sub=None, style="light", w=250, h=100):
    return (cx, cy, w, h, title, sub, style)


# ---------------------------------------------------------- part I and II

def framework():
    steps = [("1. Requirements", "5 min"), ("2. Estimates", "3-5 min"), ("3. API", "3 min"),
             ("4. Data model", "2-3 min"), ("5. High-level design", "10 min"),
             ("6. Deep dives", "12-15 min"), ("7. Wrap-up", "3-5 min")]
    bh, gap = 92, 34
    h = 50 + len(steps) * bh + (len(steps) - 1) * gap + 40
    img, d = canvas(h)
    y = 50
    for i, (t, sub) in enumerate(steps):
        dark = i == 5
        box(d, (300, y, W - 300, y + bh), t, NAVY if dark else LIGHT, WHITE if dark else INK,
            font=f(BOLD, 36), sub=sub)
        if i < len(steps) - 1:
            arrow(d, (W / 2, y + bh + 4), (W / 2, y + bh + gap - 4), color=MID, width=6, head=18)
        y += bh + gap
    label(d, (150, 50 + 2.5 * (bh + gap)), "first 25 min:", 28, ITAL, MID, "mm")
    label(d, (150, 50 + 2.5 * (bh + gap) + 36), "a complete design", 28, ITAL, MID, "mm")
    return img


def load_balancer():
    nodes = {
        "c": N(130, 300, "Clients", w=200),
        "lb": N(420, 300, "Load balancer", "health checks", "dark", w=260, h=120),
        "a1": N(760, 140, "App server", "stateless", w=250),
        "a2": N(760, 300, "App server", "stateless", w=250),
        "a3": N(760, 460, "App server", "stateless", w=250),
        "cache": N(1170, 140, "Cache", None, "store", w=240),
        "db": N(1170, 300, "Database", None, "store", w=240),
        "obj": N(1170, 460, "Object storage", None, "store", w=240),
    }
    edges = [("c", "lb", None), ("lb", "a1", None), ("lb", "a2", None), ("lb", "a3", None),
             ("a2", "cache", None), ("a2", "db", None), ("a2", "obj", None)]
    img = arch(600, nodes, edges)
    d = ImageDraw.Draw(img)
    label(d, (1170, 545), "shared state", 28, ITAL, MID)
    return img


def cache_aside():
    nodes = {
        "app": N(250, 300, "Application", None, "dark", w=280, h=120),
        "cache": N(1050, 150, "Cache", "in-memory key-value", "store", w=320, h=120),
        "db": N(1050, 470, "Database", None, "store", w=320, h=120),
    }
    edges = [
        ("app", "cache", "1. get key", {"via": [(600, 110)], "at": (600, 110)}),
        ("app", "db", "2. on a miss, read", {"via": [(600, 400)], "at": (600, 400)}),
        ("app", "cache", "3. fill with TTL", {"via": [(650, 230)], "at": (660, 230)}),
        ("app", "db", "write: update row", {"via": [(620, 530)], "at": (600, 530)}),
        ("app", "cache", "then delete key", {"via": [(780, 300)], "at": (800, 300), "color": NAVY}),
    ]
    return arch(620, nodes, edges)


def lsm():
    img, d = canvas(760)
    box(d, (450, 60, 930, 170), "Memtable", NAVY, WHITE, font=f(BOLD, 36), sub="recent writes")
    arrow(d, (250, 115), (440, 115), color=MID, width=6)
    label(d, (190, 100), "put()", 30, BOLD, INK)
    label(d, (60, 200), "memory", 28, ITAL, MID, "lm")
    d.line((60, 230, W - 60, 230), fill=(190, 190, 190), width=3)
    label(d, (60, 262), "disk: immutable", 28, ITAL, MID, "lm")
    label(d, (60, 296), "sorted runs", 28, ITAL, MID, "lm")
    arrow(d, (690, 175), (690, 290), color=MID, width=6)
    label(d, (710, 200), "flush when full", 26, ITAL, MID, "lm")
    runs = [("run 3 (newest)", 300), ("run 2", 400), ("run 1 (oldest)", 500)]
    for text, y in runs:
        box(d, (450, y, 930, y + 80), text, LIGHT, INK, font=f(BOLD, 32))
    arrow(d, (690, 585), (690, 640), color=MID, width=6)
    box(d, (450, 645, 930, 725), "merged run", PALE, INK, font=f(BOLD, 32), outline=(170, 180, 195))
    label(d, (960, 685), "compaction drops old values", 26, ITAL, MID, "lm")
    arrow(d, (1010, 115), (945, 115), color=NAVY, width=5, head=20)
    label(d, (1025, 115), "1. get(): memtable", 26, ITAL, NAVY, "lm")
    arrow(d, (990, 310), (990, 570), color=NAVY, width=5, head=20)
    label(d, (1010, 420), "2. then runs,", 26, ITAL, NAVY, "lm")
    label(d, (1010, 455), "newest first", 26, ITAL, NAVY, "lm")
    return img


def replication():
    img, d = canvas(720)
    label(d, (W / 4, 30), "Single leader", 34, BOLD, NAVY)
    label(d, (3 * W / 4, 30), "Leaderless (N=3, W=2, R=2)", 34, BOLD, NAVY)
    d.line((W / 2, 30, W / 2, 690), fill=LIGHT, width=4)
    box(d, (W / 4 - 130, 120, W / 4 + 130, 220), "Leader", NAVY, WHITE, font=f(BOLD, 34))
    for i, x in enumerate([W / 4 - 170, W / 4 + 170]):
        box(d, (x - 110, 420, x + 110, 510), "Follower", LIGHT, INK, font=f(BOLD, 32))
        arrow(d, (W / 4 + (i * 2 - 1) * 60, 225), (x, 415), color=MID, width=5, head=18)
    label(d, (W / 4, 305), "replication", 26, ITAL, MID, "mm")
    label(d, (W / 4, 338), "stream", 26, ITAL, MID, "mm")
    arrow(d, (W / 4, 78), (W / 4, 115), color=NAVY, width=5, head=18)
    label(d, (W / 4 + 20, 96), "writes", 26, ITAL, NAVY, "lm")
    for x in [W / 4 - 170, W / 4 + 170]:
        arrow(d, (x, 600), (x, 515), color=NAVY, width=5, head=18)
    label(d, (W / 4, 615), "reads (may lag behind)", 26, ITAL, NAVY, "ma")
    cx = 3 * W / 4
    box(d, (cx - 110, 110, cx + 110, 200), "Client", NAVY, WHITE, font=f(BOLD, 32))
    xs = [cx - 210, cx, cx + 210]
    for i, x in enumerate(xs):
        ok = i < 2
        box(d, (x - 90, 430, x + 90, 520), f"Replica {i + 1}", LIGHT if ok else PALE, INK,
            font=f(BOLD, 28), sub="v=7" if ok else "v=6")
        arrow(d, (cx + (i - 1) * 40, 205), (x, 425), color=MID if ok else (180, 180, 180), width=5,
              head=18)
    label(d, (cx, 590), "the write reached 2 replicas;", 26, ITAL, MID)
    label(d, (cx, 625), "any 2 replicas you read include one with v=7", 26, ITAL, MID)
    return img


def hash_ring():
    img, d = canvas(860)
    cx, cy, r = 520, 430, 300
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=MID, width=6)
    nodes = [("A", 10), ("B", 100), ("C", 200), ("A", 245), ("B", 300), ("C", 150), ("A", 55)]
    colors = {"A": NAVY, "B": (60, 120, 170), "C": (140, 160, 185)}
    pts = sorted(nodes, key=lambda n: n[1])
    for name, deg in pts:
        a = math.radians(deg - 90)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        d.ellipse((x - 30, y - 30, x + 30, y + 30), fill=colors[name], outline=WHITE, width=3)
        d.text((x, y), name, font=f(BOLD, 30), fill=WHITE, anchor="mm")
    keys = [(30, "k1"), (128, "k2"), (220, "k3"), (330, "k4")]
    for deg, name in keys:
        a = math.radians(deg - 90)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        d.rectangle((x - 13, y - 13, x + 13, y + 13), fill=(245, 170, 60), outline=INK, width=2)
        ox, oy = cx + (r + 70) * math.cos(a), cy + (r + 70) * math.sin(a)
        d.text((ox, oy), name, font=f(BOLD, 30), fill=INK, anchor="mm")
        nxt = min((n for n in pts if n[1] > deg), key=lambda n: n[1], default=pts[0])
        b = math.radians(((nxt[1] if nxt[1] > deg else nxt[1] + 360) + deg) / 2 - 90)
        mx, my = cx + (r - 70) * math.cos(b), cy + (r - 70) * math.sin(b)
        d.text((mx, my), f"-> {nxt[0]}", font=f(ITAL, 26), fill=MID, anchor="mm")
    tx = 900
    lines = [("Nodes A, B, C each appear", REG), ("at several points", REG), ("(virtual nodes).", REG), ("", REG),
             ("Each key belongs to the", REG), ("next node clockwise.", REG), ("", REG),
             ("Adding a node moves only", BOLD), ("the keys just before it:", BOLD), ("about 1/N of all keys.", BOLD)]
    y = 230
    for t, fnt in lines:
        d.text((tx, y), t, font=f(fnt, 32), fill=INK)
        y += 44
    return img


def queue_log():
    img, d = canvas(760)
    box(d, (20, 250, 240, 350), "Producers", LIGHT, INK, font=f(BOLD, 32))
    label(d, (700, 40), "topic \"orders\": 3 partitions", 32, BOLD, NAVY)
    for p in range(3):
        y = 120 + p * 170
        d.text((345, y + 40), f"P{p}", font=f(BOLD, 32), fill=NAVY, anchor="mm")
        for i in range(8 - p):
            x = 380 + i * 80
            d.rectangle((x, y, x + 76, y + 80), fill=LIGHT, outline=NAVY, width=3)
            d.text((x + 38, y + 40), str(i), font=f(REG, 28), fill=INK, anchor="mm")
        arrow(d, (245, 300), (310, y + 40), color=MID, width=4, head=16)
    label(d, (700, 640), "offsets: each message's position in its partition", 28, ITAL, MID)
    box(d, (1080, 140, 1340, 260), "Group \"billing\"", NAVY, WHITE, font=f(BOLD, 30), sub="offsets: 5, 4, 3")
    box(d, (1080, 400, 1340, 520), "Group \"email\"", NAVY, WHITE, font=f(BOLD, 30), sub="offsets: 2, 6, 1")
    for y in (200, 460):
        arrow(d, (1030, 330), (1075, y), color=MID, width=4, head=16)
    label(d, (1210, 560), "each group reads", 26, ITAL, MID)
    label(d, (1210, 595), "every message", 26, ITAL, MID)
    return img


def token_bucket():
    img, d = canvas(700)
    d.polygon([(470, 200), (910, 200), (860, 600), (520, 600)], fill=PALE, outline=NAVY)
    d.line([(470, 200), (520, 600), (860, 600), (910, 200)], fill=NAVY, width=6)
    for i, (x, y) in enumerate([(580, 540), (660, 540), (740, 540), (800, 540), (620, 470),
                                 (700, 470), (780, 470)]):
        d.ellipse((x - 30, y - 30, x + 30, y + 30), fill=NAVY)
    label(d, (690, 330), "capacity: 10 tokens", 30, BOLD, NAVY)
    label(d, (690, 370), "(the allowed burst)", 28, ITAL, MID)
    d.rectangle((640, 60, 740, 110), fill=MID)
    for y in (140, 175):
        d.ellipse((680, y, 700, y + 22), fill=NAVY)
    label(d, (770, 70), "refill: limit / window", 28, BOLD, INK, "la")
    label(d, (770, 105), "tokens per second", 28, ITAL, MID, "la")
    arrow(d, (160, 420), (450, 420), color=MID, width=6)
    label(d, (200, 360), "request", 30, BOLD, INK, "la")
    label(d, (130, 470), "takes 1 token", 26, ITAL, MID, "la")
    arrow(d, (920, 420), (1180, 420), color=NAVY, width=6)
    label(d, (1050, 360), "allowed", 30, BOLD, NAVY)
    label(d, (690, 630), "no token left -> 429 Too Many Requests", 30, BOLD, INK)
    return img


def snowflake():
    img, d = canvas(460)
    fields = [("0", 1, "sign", PALE), ("timestamp", 41, "41 bits:\nms since epoch", NAVY),
              ("machine", 10, "10 bits:\n1,024 machines", (60, 120, 170)),
              ("seq", 12, "12 bits:\n4,096 per ms", MID)]
    x, scale, y = 60, (W - 120) / 64, 160
    for name, bits, desc, color in fields:
        w = bits * scale
        d.rectangle((x, y, x + w, y + 110), fill=color, outline=WHITE, width=4)
        d.text((x + w / 2, y + 55), name, font=f(BOLD, 34), fill=WHITE if color != PALE else INK, anchor="mm")
        for k, line in enumerate(desc.split("\n")):
            d.text((x + w / 2, y + 140 + 32 * k), line, font=f(REG, 26), fill=INK, anchor="ma")
        x += w
    label(d, (W / 2, 50), "A 64-bit Snowflake ID", 36, BOLD, NAVY)
    label(d, (W / 2, 400), "41 bits of milliseconds last about 69 years; IDs sort by time", 28, ITAL, MID)
    return img


def bloom():
    img, d = canvas(620)
    n, size, x0, y = 16, 74, 100, 280
    ones = {1, 4, 6, 9, 12, 14}
    for i in range(n):
        x = x0 + i * size
        d.rectangle((x, y, x + size, y + size), fill=NAVY if i in ones else WHITE, outline=INK, width=3)
        d.text((x + size / 2, y + size / 2), "1" if i in ones else "0", font=f(BOLD, 32),
               fill=WHITE if i in ones else INK, anchor="mm")
    def item(cx, text, targets, color, above=True):
        yy = 110 if above else 500
        box(d, (cx - 110, yy - 40, cx + 110, yy + 40), text, color, WHITE if color == NAVY else INK, font=f(BOLD, 30))
        for t in targets:
            tx = x0 + t * size + size / 2
            arrow(d, (cx, yy + (40 if above else -40)), (tx, y - 4 if above else y + size + 4), color=MID, width=4, head=16)
    item(330, "add \"cat\"", [1, 4, 9], NAVY)
    item(950, "add \"dog\"", [6, 12, 14], NAVY)
    item(640, "check \"fox\"", [4, 7, 12], LIGHT, above=False)
    label(d, (1020, 520), "bit 7 is 0:", 28, BOLD, INK, "lm")
    label(d, (1020, 560), "definitely not added", 28, ITAL, MID, "lm")
    return img


def circuit_breaker():
    nodes = {
        "closed": N(230, 300, "Closed", "calls pass through", "dark", w=300, h=120),
        "open": N(1110, 300, "Open", "fail fast", "light", w=300, h=120),
        "half": N(670, 600, "Half open", "one trial call", "pale", w=300, h=120),
    }
    edges = [
        ("closed", "open", "N failures in a row", {"via": [(670, 170)], "at": (670, 170)}),
        ("open", "half", "after cooldown", {"at": (1000, 470)}),
        ("half", "closed", "trial succeeds", {"at": (340, 470)}),
        ("half", "open", "trial fails", {"via": [(870, 380)], "at": (840, 380)}),
    ]
    return arch(720, nodes, edges)


# --------------------------------------------------------------- part III

def link_shortener():
    nodes = {"cl": N(110, 330, "Clients", w=180), "lb": N(350, 330, "Load balancer", w=220),
             "svc": N(650, 330, "Link service", "stateless", "dark", w=260, h=120),
             "cache": N(1080, 110, "Cache", "hot codes", "store", w=280),
             "db": N(1080, 330, "Link database", "by code", "store", w=280),
             "ids": N(1080, 560, "ID ranges", "blocks of IDs", "light", w=280),
             "q": N(650, 600, "Click queue", "analytics", "pale", w=260)}
    edges = [("cl", "lb", None), ("lb", "svc", None),
             ("svc", "cache", "1. read", {"at": (870, 200)}),
             ("svc", "db", "2. on miss", {"at": (870, 330)}),
             ("svc", "ids", "create", {"at": (870, 450)}),
             ("svc", "q", "click event", {"at": (650, 470)})]
    return arch(680, nodes, edges)


def rate_limiter():
    nodes = {"cl": N(120, 330, "Clients", w=200),
             "g1": N(470, 170, "Gateway", "limiter library", "dark", w=280, h=110),
             "g2": N(470, 330, "Gateway", "limiter library", "dark", w=280, h=110),
             "g3": N(470, 490, "Gateway", "limiter library", "dark", w=280, h=110),
             "store": N(950, 330, "Bucket store", "sharded by key, atomic updates", "store", w=400, h=130),
             "rules": N(950, 590, "Rules config", None, "pale", w=260),
             "api": N(1250, 120, "APIs", None, "light", w=180)}
    edges = [("cl", "g1", None), ("cl", "g2", None), ("cl", "g3", None),
             ("g1", "store", None), ("g2", "store", "take token", {"at": (710, 330)}), ("g3", "store", None),
             ("rules", "g3", "watch", {"at": (720, 560)}),
             ("g1", "api", "allowed", {"via": [(800, 90)], "at": (900, 90)})]
    img = arch(680, nodes, edges)
    d = ImageDraw.Draw(img)
    label(d, (130, 430), "429 if empty", 26, ITAL, MID)
    return img


def kv_store():
    img, d = canvas(800)
    cx, cy, r = 470, 420, 290
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=MID, width=5)
    for i in range(8):
        a = math.radians(i * 45 - 90)
        x, y = cx + r * math.cos(a), cy + r * math.sin(a)
        rep = i in (1, 2, 3)
        d.ellipse((x - 42, y - 42, x + 42, y + 42), fill=NAVY if rep else LIGHT, outline=NAVY, width=3)
        d.text((x, y), f"n{i}", font=f(BOLD, 28), fill=WHITE if rep else INK, anchor="mm")
    a = math.radians(25 - 90)
    kx, ky = cx + r * math.cos(a), cy + r * math.sin(a)
    d.rectangle((kx - 16, ky - 16, kx + 16, ky + 16), fill=(245, 170, 60), outline=INK, width=2)
    d.text((kx + 26, ky - 26), "key", font=f(BOLD, 28), fill=INK, anchor="lm")
    box(d, (cx - 140, cy - 60, cx + 140, cy + 60), "Coordinator", PALE, INK, font=f(BOLD, 30), sub="any node")
    lines = ["The key's N = 3 replicas are", "the next 3 nodes clockwise", "(n1, n2, n3).", "",
             "Write: send to all 3,", "acknowledge after W = 2.", "Read: ask replicas,", "return after R = 2.", "",
             "Down replica: hinted handoff", "to the next healthy node.", "Repair: read repair and", "Merkle-tree anti-entropy."]
    y = 120
    for t in lines:
        d.text((860, y), t, font=f(REG, 30), fill=INK)
        y += 44
    return img


def crawler():
    nodes = {"front": N(220, 250, "URL frontier", "per-host queues", "dark", w=300, h=120),
             "fetch": N(700, 250, "Fetchers", "DNS + robots.txt caches", "light", w=320, h=120),
             "store": N(1150, 250, "Page storage", "object storage", "store", w=300, h=120),
             "parse": N(1150, 530, "Parser", "extract links", "light", w=300),
             "norm": N(700, 530, "Normalize URLs", None, "light", w=300),
             "seen": N(220, 530, "Seen-URL set", "Bloom filter + store", "store", w=320, h=120),
             "web": N(700, 60, "The web", None, "pale", w=260, h=80)}
    edges = [("front", "fetch", "next URL", {"at": (460, 210)}), ("fetch", "store", None),
             ("store", "parse", None), ("parse", "norm", "links", {"at": (925, 500)}),
             ("norm", "seen", "new?", {"at": (460, 500)}), ("seen", "front", "enqueue new", {"at": (300, 395)}),
             ("fetch", "web", "HTTP", {"at": (760, 145), "both": True})]
    return arch(620, nodes, edges)


def notifications():
    nodes = {"svc": N(120, 330, "Product services", w=210, h=120),
             "api": N(390, 330, "Notification API", "validate, record", "dark", w=260, h=120),
             "q1": N(690, 150, "Critical queue", None, "pale", w=250, h=80),
             "q2": N(690, 330, "Normal queue", None, "pale", w=250, h=80),
             "q3": N(690, 510, "Bulk queue", None, "pale", w=250, h=80),
             "dec": N(1000, 330, "Decision workers", "prefs, dedup, caps", "dark", w=270, h=130),
             "push": N(1260, 150, "Push", None, "light", w=180, h=80),
             "mail": N(1260, 330, "Email", None, "light", w=180, h=80),
             "sms": N(1260, 510, "SMS", None, "light", w=180, h=80),
             "stat": N(1000, 640, "Status store", None, "store", w=260, h=90)}
    edges = [("svc", "api", None), ("api", "q1", None), ("api", "q2", None), ("api", "q3", None),
             ("q1", "dec", None), ("q2", "dec", None), ("q3", "dec", None),
             ("dec", "push", None), ("dec", "mail", None), ("dec", "sms", None), ("dec", "stat", None)]
    return arch(720, nodes, edges)


def news_feed():
    nodes = {"cl": N(120, 330, "Clients", w=200),
             "post": N(430, 150, "Post service", "stores the post", "dark", w=280, h=120),
             "feed": N(430, 520, "Feed service", None, "dark", w=270),
             "q": N(800, 150, "Post events", None, "pale", w=240, h=90),
             "fan": N(1170, 150, "Fan-out workers", "skip celebrities", "light", w=300, h=120),
             "fc": N(1170, 430, "Feed cache", "post IDs per user", "store", w=300, h=120),
             "pc": N(900, 640, "Post store + cache", None, "store", w=320, h=100),
             "fg": N(800, 330, "Follow graph", None, "store", w=260, h=100)}
    edges = [("cl", "post", "publish", {"at": (250, 220)}), ("cl", "feed", "read", {"at": (250, 450)}),
             ("post", "q", None), ("q", "fan", None), ("fan", "fg", "followers", {"at": (985, 240)}),
             ("fan", "fc", "push IDs", {"at": (1250, 290)}), ("feed", "fc", "my feed", {"at": (800, 475)}),
             ("feed", "pc", "hydrate + celebrity posts", {"via": [(430, 640)], "at": (585, 610)})]
    return arch(720, nodes, edges)


def chat():
    nodes = {"a": N(120, 170, "Sender", w=200), "b": N(120, 500, "Recipient", w=200),
             "g1": N(430, 170, "Gateway", "WebSockets", "light", w=260, h=110),
             "g2": N(430, 500, "Gateway", "WebSockets", "light", w=260, h=110),
             "chat": N(800, 330, "Chat service", "assigns seq numbers", "dark", w=300, h=130),
             "msgs": N(1180, 170, "Message store", "by conversation", "store", w=300, h=120),
             "reg": N(1180, 400, "Connection registry", "user -> gateway", "store", w=320, h=120),
             "push": N(1180, 610, "Push notifications", "offline users", "pale", w=320, h=90)}
    edges = [("a", "g1", None, {"both": True}), ("b", "g2", None, {"both": True}),
             ("g1", "chat", "send", {"at": (620, 220)}), ("chat", "msgs", "store", {"at": (990, 230)}),
             ("chat", "reg", "lookup", {"at": (985, 335)}), ("chat", "g2", "deliver", {"at": (610, 450)}),
             ("chat", "push", None)]
    return arch(700, nodes, edges)


def autocomplete():
    nodes = {"cl": N(145, 200, "Browser", "debounce + cache", "light", w=250, h=120),
             "cdn": N(460, 200, "CDN", "short prefixes", "pale", w=230, h=110),
             "srv": N(800, 200, "Suggestion servers", "in-memory trie", "dark", w=320, h=120),
             "logs": N(145, 520, "Search logs", None, "store", w=250, h=110),
             "agg": N(450, 520, "Aggregate + filter", "hourly, with decay", "light", w=300, h=120),
             "build": N(800, 520, "Build trie", None, "light", w=260, h=100),
             "dist": N(1180, 520, "Trie snapshots", None, "store", w=270, h=110)}
    edges = [("cl", "cdn", "q=rai", {"at": (308, 160)}), ("cdn", "srv", "miss", {"at": (610, 160)}),
             ("logs", "agg", None), ("agg", "build", None), ("build", "dist", None),
             ("dist", "srv", "load + swap", {"via": [(1180, 200)], "at": (1180, 330)})]
    img = arch(660, nodes, edges)
    d = ImageDraw.Draw(img)
    label(d, (470, 40), "serving path (milliseconds)", 28, ITAL, NAVY)
    label(d, (470, 630), "data pipeline (hours)", 28, ITAL, NAVY)
    return img


def video():
    nodes = {"up": N(100, 160, "Uploader", w=170),
             "raw": N(490, 160, "Original upload", "object storage", "store", w=300, h=120),
             "q": N(850, 160, "Transcode jobs", None, "pale", w=230, h=90),
             "tx": N(1190, 160, "Transcoders", "renditions + segments", "dark", w=320, h=120),
             "seg": N(1170, 430, "Segments + manifests", "object storage", "store", w=320, h=120),
             "cdn": N(750, 430, "CDN edges", None, "light", w=260, h=110),
             "pl": N(260, 430, "Players", "adaptive bitrate", "light", w=260, h=110),
             "meta": N(750, 630, "Metadata DB", "titles, views", "store", w=280, h=100)}
    edges = [("up", "raw", "signed URL", {"at": (262, 120)}), ("raw", "q", None), ("q", "tx", None),
             ("tx", "seg", None), ("seg", "cdn", "on miss", {"at": (960, 400)}),
             ("cdn", "pl", "segments", {"at": (505, 400), "both": True}), ("pl", "meta", None, {"via": [(260, 630)]})]
    return arch(720, nodes, edges)


def file_sync():
    nodes = {"dev": N(150, 330, "Device", "chunk + hash", "dark", w=260, h=120),
             "blocks": N(650, 140, "Block service", "upload missing chunks", "light", w=320, h=110),
             "obj": N(1130, 140, "Chunk storage", "by content hash", "store", w=300, h=110),
             "meta": N(650, 380, "Metadata service", "files = lists of hashes", "light", w=320, h=110),
             "mdb": N(1130, 380, "Metadata DB", "versions, change log", "store", w=300, h=110),
             "note": N(650, 600, "Notifications", "tell other devices", "pale", w=320, h=100),
             "dev2": N(1130, 600, "Other devices", None, "light", w=280, h=100)}
    edges = [("dev", "blocks", "which chunks are new?", {"at": (380, 200)}), ("blocks", "obj", None),
             ("dev", "meta", "commit version", {"at": (390, 370)}), ("meta", "mdb", None),
             ("meta", "note", None), ("note", "dev2", None)]
    return arch(700, nodes, edges)


def nearby():
    nodes = {"cl": N(120, 300, "Clients", w=200),
             "srch": N(450, 300, "Search service", "stateless", "dark", w=280, h=120),
             "geo": N(870, 140, "Geo index", "geohash -> place IDs", "light", w=380, h=120),
             "cache": N(870, 420, "Place cache", None, "store", w=280, h=100),
             "db": N(1230, 420, "Place DB", None, "store", w=220, h=100),
             "own": N(450, 600, "Owner updates", None, "pale", w=300, h=90),
             "cdc": N(1230, 140, "Change stream", None, "pale", w=240, h=90)}
    edges = [("cl", "srch", None), ("srch", "geo", "cell + 8 neighbors", {"at": (690, 232)}),
             ("srch", "cache", "details", {"at": (660, 380)}), ("cache", "db", None),
             ("own", "db", None, {"via": [(1230, 600)]}), ("db", "cdc", None), ("cdc", "geo", None)]
    return arch(680, nodes, edges)


def ride_matching():
    nodes = {"drv": N(130, 150, "Driver apps", "ping every 4 s", "light", w=240, h=110),
             "loc": N(480, 150, "Location service", None, "light", w=280, h=100),
             "idx": N(880, 150, "Live geo index", "per region, in memory", "dark", w=320, h=120),
             "log": N(1240, 150, "Location log", None, "store", w=200, h=100),
             "rid": N(120, 450, "Rider app", None, "light", w=210, h=100),
             "disp": N(480, 450, "Dispatch", "nearest + reserve", "dark", w=280, h=120),
             "trip": N(880, 450, "Trip service", "state machine", "light", w=300, h=110),
             "st": N(880, 640, "Driver status", "compare-and-set", "store", w=300, h=100)}
    edges = [("drv", "loc", None), ("loc", "idx", None), ("loc", "log", None, {"via": [(480, 45), (1240, 45)]}),
             ("rid", "disp", "request", {"at": (285, 410)}), ("disp", "idx", "query cells", {"at": (690, 300)}),
             ("disp", "st", "reserve", {"at": (650, 600)}), ("disp", "trip", None)]
    return arch(720, nodes, edges)


def payments():
    nodes = {"co": N(120, 300, "Checkout", w=200),
             "pay": N(500, 300, "Payment service", "idempotency keys", "dark", w=300, h=120),
             "proc": N(950, 120, "Card processor", "external", "pale", w=280, h=100),
             "led": N(950, 420, "Ledger DB", "double-entry, transactions", "store", w=340, h=120),
             "rec": N(1240, 640, "Reconciliation", "daily", "light", w=240, h=100),
             "out": N(480, 620, "Payouts", None, "light", w=240, h=100)}
    edges = [("co", "pay", "pay order", {"at": (285, 260)}), ("pay", "proc", "charge (same key)", {"at": (700, 160)}),
             ("proc", "pay", "webhook", {"via": [(820, 260)], "at": (800, 280)}),
             ("pay", "led", "entries + status", {"at": (700, 400)}), ("led", "out", None),
             ("led", "rec", None), ("proc", "rec", "settlement files", {"via": [(1240, 120)], "at": (1240, 380)})]
    return arch(720, nodes, edges)


def ticketing():
    nodes = {"fans": N(120, 300, "Fans", w=180),
             "wr": N(420, 300, "Waiting room", "admits ~100/s", "dark", w=280, h=120),
             "book": N(790, 300, "Booking service", None, "light", w=300, h=110),
             "seats": N(1200, 300, "Seat DB", "versioned rows", "store", w=280, h=120),
             "map": N(790, 80, "Seat map cache", None, "pale", w=280, h=80),
             "pay": N(790, 560, "Payment service", "idempotent", "light", w=300, h=100)}
    edges = [("fans", "wr", None), ("wr", "book", "token", {"at": (600, 260)}),
             ("book", "seats", "hold if version = v", {"at": (990, 230)}), ("book", "map", "view", {"at": (790, 190)}),
             ("book", "pay", None), ("pay", "seats", "confirm", {"via": [(1200, 560)], "at": (1200, 470)})]
    return arch(680, nodes, edges)


def metrics():
    nodes = {"ag": N(120, 300, "Agents", "on every host", "light", w=220, h=110),
             "ing": N(420, 300, "Ingestion", None, "light", w=240),
             "log": N(720, 300, "Log", "partitioned", "pale", w=220, h=100),
             "tsdb": N(1060, 300, "Time-series DB", "by series", "store", w=300, h=120),
             "roll": N(1060, 80, "Rollup jobs", None, "light", w=250, h=80),
             "q": N(800, 560, "Query service", None, "dark", w=260, h=100),
             "dash": N(450, 560, "Dashboards", None, "light", w=240, h=90),
             "al": N(1220, 560, "Alert evaluator", "for 5 minutes", "dark", w=290, h=110)}
    edges = [("ag", "ing", None), ("ing", "log", None), ("log", "tsdb", None), ("tsdb", "roll", None, {"both": True}),
             ("tsdb", "q", None), ("q", "dash", None), ("tsdb", "al", None)]
    return arch(680, nodes, edges)


def scheduler():
    nodes = {"api": N(130, 300, "Job API", w=220),
             "store": N(460, 300, "Job store", "by due-time bucket", "store", w=300, h=120),
             "sch": N(460, 85, "Schedulers", "own partitions", "light", w=280, h=110),
             "q": N(820, 300, "Ready queue", None, "pale", w=240, h=100),
             "w": N(1180, 300, "Workers", "lease + heartbeat", "dark", w=280, h=120),
             "res": N(1180, 560, "Results", "fencing token check", "store", w=300, h=110)}
    edges = [("api", "store", None), ("sch", "store", "find due", {"at": (530, 190)}),
             ("sch", "q", "enqueue", {"via": [(820, 80)], "at": (820, 160)}), ("q", "w", "lease", {"at": (1000, 260)}),
             ("w", "res", "complete(token)", {"at": (1280, 440)}),
             ("w", "store", "renew / retry later", {"via": [(1080, 460), (460, 460)], "at": (780, 460)})]
    return arch(680, nodes, edges)


def leaderboard():
    nodes = {"gs": N(150, 300, "Game servers", "validated scores", "light", w=260, h=110),
             "lb": N(560, 300, "Leaderboard service", None, "dark", w=320, h=110),
             "mem": N(1050, 160, "Sorted set", "in memory + replicas", "store", w=320, h=120),
             "db": N(1050, 450, "Score DB", "durable, for rebuild", "store", w=320, h=120),
             "cl": N(560, 560, "Players", "top 100, my rank", "light", w=280, h=100)}
    edges = [("gs", "lb", "score", {"at": (360, 260)}), ("lb", "mem", "update", {"at": (800, 200)}),
             ("lb", "db", "persist", {"at": (800, 410)}), ("cl", "lb", "read", {"at": (600, 440)}),
             ("db", "mem", "rebuild", {"at": (1150, 305)})]
    return arch(660, nodes, edges)


def collab():
    nodes = {"u1": N(140, 140, "Editor 1", "applies own edits", "light", w=250, h=110),
             "u2": N(140, 470, "Editor 2", "applies own edits", "light", w=250, h=110),
             "sess": N(640, 300, "Session server", "orders + transforms ops", "dark", w=340, h=130),
             "log": N(1120, 160, "Operation log", None, "store", w=280, h=100),
             "snap": N(1120, 450, "Snapshots", "versions", "store", w=280, h=110)}
    edges = [("u1", "sess", "ops", {"at": (390, 190), "both": True}), ("u2", "sess", "ops", {"at": (390, 420), "both": True}),
             ("sess", "log", "append", {"at": (900, 210)}), ("log", "snap", "periodic", {"at": (1180, 305)})]
    img = arch(620, nodes, edges)
    d = ImageDraw.Draw(img)
    label(d, (640, 420), "one session server per document", 26, ITAL, MID)
    return img


def message_queue():
    img, d = canvas(800)
    label(d, (690, 30), "Topic with 3 partitions, replication factor 2", 32, BOLD, NAVY)
    box(d, (40, 300, 250, 400), "Producers", LIGHT, INK, font=f(BOLD, 32))
    brokers = [(330, "Broker 1"), (690, "Broker 2"), (1050, "Broker 3")]
    layout = {0: ["P0 leader", "P2 follower"], 1: ["P1 leader", "P0 follower"],
              2: ["P2 leader", "P1 follower"]}
    for i, (x, name) in enumerate(brokers):
        d.rounded_rectangle((x, 140, x + 300, 560), radius=20, fill=PALE, outline=NAVY, width=4)
        d.text((x + 150, 175), name, font=f(BOLD, 32), fill=NAVY, anchor="mm")
        for j, part in enumerate(layout[i]):
            lead = "leader" in part
            box(d, (x + 25, 230 + j * 150, x + 275, 340 + j * 150), part, NAVY if lead else LIGHT,
                WHITE if lead else INK, font=f(BOLD, 28))
    d.line([(145, 295), (145, 100), (brokers[-1][0] + 250, 100)], fill=MID, width=4)
    for x, _ in brokers:
        arrow(d, (x + 250, 100), (x + 250, 222), color=MID, width=4, head=16)
    label(d, (160, 180), "write to", 26, ITAL, MID, "lm")
    label(d, (160, 212), "leaders", 26, ITAL, MID, "lm")
    for a, b in [(0, 1), (1, 2)]:
        arrow(d, (brokers[a][0] + 280, 285), (brokers[b][0] + 20, 435), color=(150, 160, 180),
              width=4, head=16)
    poly_arrow(d, [(1325, 300), (1366, 300), (1366, 600), (480, 600), (480, 497)],
               color=(150, 160, 180), width=4)
    label(d, (690, 650), "each leader's follower lives on another broker; only in-sync followers"
          " can take over", 26, ITAL, MID)
    box(d, (470, 700, 910, 780), "Consumer groups track offsets", LIGHT, INK, font=f(BOLD, 28))
    return img


def staged_rollout():
    img, d = canvas(560)
    stages = [("Canary", "a few servers"), ("1%", "one cell"), ("10%", "one region"),
              ("100%", "everywhere")]
    bw, gap, y0 = 250, 92, 90
    x = (W - (4 * bw + 3 * gap)) / 2
    xs = []
    for i, (t, sub) in enumerate(stages):
        box(d, (x, y0, x + bw, y0 + 120), t, NAVY if i == 3 else LIGHT,
            WHITE if i == 3 else INK, font=f(BOLD, 36), sub=sub)
        xs.append(x)
        x += bw + gap
    for i in range(3):
        a, b = xs[i] + bw + 8, xs[i + 1] - 8
        arrow(d, (a, y0 + 60), (b, y0 + 60), color=MID, width=6, head=20)
        label(d, ((a + b) / 2, y0 + 140), "healthy?", 26, ITAL, MID)
    label(d, (W / 2, 20), "Each stage waits and checks error rates before the next", 30, BOLD, NAVY)
    d.line((xs[0] + bw / 2, y0 + 125, xs[0] + bw / 2, 400), fill=(194, 84, 0), width=5)
    for i in range(1, 3):
        d.line((xs[i] + bw / 2, y0 + 125, xs[i] + bw / 2, 400), fill=(194, 84, 0), width=5)
    d.line((xs[0] + bw / 2, 400, xs[2] + bw / 2, 400), fill=(194, 84, 0), width=5)
    box(d, (W / 2 - 420, 430, W / 2 + 420, 530), "Errors rise? Stop and roll back automatically",
        PALE, INK, font=f(BOLD, 30), outline=(194, 84, 0))
    d.line((W / 2, 400, W / 2, 428), fill=(194, 84, 0), width=5)
    return img


DIAGRAMS = {
    "framework": framework, "load-balancer": load_balancer, "cache-aside": cache_aside, "lsm": lsm,
    "replication": replication, "hash-ring": hash_ring, "queue-log": queue_log,
    "token-bucket": token_bucket, "snowflake": snowflake, "bloom": bloom,
    "circuit-breaker": circuit_breaker, "link-shortener": link_shortener, "rate-limiter": rate_limiter,
    "kv-store": kv_store, "crawler": crawler, "notifications": notifications, "news-feed": news_feed,
    "chat": chat, "autocomplete": autocomplete, "video": video, "file-sync": file_sync,
    "nearby": nearby, "ride-matching": ride_matching, "payments": payments, "ticketing": ticketing,
    "metrics": metrics, "scheduler": scheduler, "leaderboard": leaderboard, "collab": collab,
    "message-queue": message_queue, "staged-rollout": staged_rollout,
}


def build_diagrams(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in DIAGRAMS.items():
        fn().save(out_dir / f"diagram-{name}.png", dpi=(300, 300))


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" / "images")
