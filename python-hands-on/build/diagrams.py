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


def names_and_objects():
    """Chapter 6: b = a gives the same list a second name; copy() makes a new one."""
    img, d = canvas(620)
    # names on the left
    names = {"a": 120, "b": 260, "c": 470}
    for name, y in names.items():
        box(d, (40, y - 50, 200, y + 50), name, fill=NAVY, color=WHITE, font=f(MONOB, 48))
    # the shared list and the copy
    box(d, (640, 110, 1300, 270), "[1, 2, 3]", fill=LIGHT, font=f(MONOB, 46),
        sub="one list object")
    box(d, (640, 400, 1300, 540), "[1, 2, 3]", fill=PALE, outline=MID, font=f(MONOB, 46),
        sub="a separate copy")
    arrow(d, (200, 120), (636, 175))
    arrow(d, (200, 260), (636, 215))
    arrow(d, (200, 470), (636, 470))
    lab = f(MONO, 30)
    d.text((300, 40), "a = [1, 2, 3]    b = a    c = a.copy()", font=lab, fill=INK)
    d.text((240, 330), "b.append(4) changes the list a refers to too", font=f(ITAL, 30), fill=(70, 70, 70))
    return img


def pocket_evolution():
    """Introduction: how Pocket Library grows through the book."""
    steps = [("Ch 6", "A list of titles"), ("Ch 7", "A dictionary per book"),
             ("Ch 8", "Organized into functions"), ("Ch 10", "Saved to a JSON file"),
             ("Ch 12", "Book and Library classes"), ("Ch 13", "A dataclass collection"),
             ("Ch 17", "An installable package"), ("Ch 23", "A SQLite command-line app"),
             ("Ch 25", "A web API")]
    row_h, top = 112, 30
    img, d = canvas(top * 2 + row_h * len(steps))
    for i, (ch, text) in enumerate(steps):
        y = top + i * row_h
        dark = i in (0, len(steps) - 1)
        box(d, (40, y + 10, 260, y + row_h - 14), ch, fill=NAVY if dark else MID, color=WHITE,
            font=f(BOLD, 38))
        box(d, (300, y + 10, W - 40, y + row_h - 14), text, fill=LIGHT if dark else PALE,
            font=f(BOLD if dark else REG, 38), radius=18)
        if i < len(steps) - 1:
            arrow(d, (150, y + row_h - 14), (150, y + row_h + 12), width=6, head=20)
    return img


def pocket_layers():
    """Chapter 23: the layers of the SQLite app."""
    img, d = canvas(980)
    box(d, (390, 30, 990, 150), "You, in a terminal", fill=PALE, outline=MID,
        sub="python -m pocket list --unread")
    box(d, (390, 250, 990, 400), "cli.py", fill=NAVY, color=WHITE, font=f(BOLD, 44),
        sub="argparse: commands, options, messages")
    box(d, (390, 500, 990, 650), "db.py: BookStore", fill=NAVY, color=WHITE, font=f(BOLD, 44),
        sub="SQL with ? placeholders, transactions")
    box(d, (390, 760, 990, 910), "pocket.db", fill=LIGHT, font=f(BOLD, 44),
        sub="SQLite: one file, tables and rules")
    for y0, y1 in [(150, 250), (400, 500), (650, 760)]:
        arrow(d, (690, y0 + 4), (690, y1 - 4))
    box(d, (40, 500, 300, 650), "tests", fill=PALE, outline=MID, font=f(BOLD, 40),
        sub="a fresh database for each test")
    arrow(d, (300, 575), (386, 575))
    box(d, (1080, 500, 1340, 650), "web API", fill=PALE, outline=MID, font=f(BOLD, 40),
        sub="could reuse it")
    arrow(d, (1080, 575), (994, 575))
    return img


def http_round_trip():
    """Chapter 25: a request and its response."""
    img, d = canvas(760)
    box(d, (30, 200, 360, 560), "Client", fill=NAVY, color=WHITE, font=f(BOLD, 46),
        sub="httpx or urllib")
    box(d, (1020, 200, 1350, 560), "API", fill=NAVY, color=WHITE, font=f(BOLD, 46),
        sub="FastAPI checks the data, then runs your function")
    box(d, (420, 60, 960, 300), "Request", fill=LIGHT, font=f(BOLD, 40),
        sub="POST /books\n{\"title\": \"Dune\", ...}")
    box(d, (420, 460, 960, 700), "Response", fill=PALE, outline=MID, font=f(BOLD, 40),
        sub="201 Created\n{\"id\": 1, \"title\": \"Dune\", ...}")
    poly_arrow(d, [(360, 270), (390, 180), (416, 180)])
    poly_arrow(d, [(960, 180), (990, 180), (1016, 270)])
    poly_arrow(d, [(1020, 490), (990, 580), (964, 580)])
    poly_arrow(d, [(420, 580), (390, 580), (364, 490)])
    return img


def threads_timeline():
    """Chapter 21: six half-second waits, one after another or all at once."""
    img, d = canvas(800)
    left, right = 300, W - 60
    scale = (right - left) / 3.0
    lab = f(BOLD, 34)
    d.text((40, 30), "One after another: 3 seconds", font=lab, fill=INK)
    for i in range(6):
        x0 = left + i * 0.5 * scale
        d.rectangle((x0 + 2, 90, x0 + 0.5 * scale - 2, 150), fill=MID)
    d.text((40, 100), "1 thread", font=f(REG, 32), fill=INK)
    d.text((40, 220), "Six threads waiting together: 0.5 seconds", font=lab, fill=INK)
    for i in range(6):
        y = 280 + i * 70
        d.rectangle((left + 2, y, left + 0.5 * scale - 2, y + 50), fill=NAVY)
        d.text((40, y + 6), f"thread {i + 1}", font=f(REG, 32), fill=INK)
    # time axis
    ay = 720
    d.line((left, ay, right, ay), fill=INK, width=4)
    for s in range(4):
        x = left + s * scale
        d.line((x, ay - 12, x, ay + 12), fill=INK, width=4)
        d.text((x, ay + 22), f"{s} s", font=f(REG, 30), fill=INK, anchor="ma")
    return img


def build_diagrams(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in [("diagram-names-objects", names_and_objects),
                     ("diagram-pocket-evolution", pocket_evolution),
                     ("diagram-pocket-layers", pocket_layers),
                     ("diagram-http", http_round_trip),
                     ("diagram-threads", threads_timeline)]:
        fn().save(out_dir / f"{name}.png", dpi=(300, 300))
