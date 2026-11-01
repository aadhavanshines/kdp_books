"""The book's diagrams, drawn in color at 300 DPI (the paperback is
printed in color)."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT_DIR = "/usr/share/fonts/truetype/liberation"
BOLD = f"{FONT_DIR}/LiberationSans-Bold.ttf"
REG = f"{FONT_DIR}/LiberationSans-Regular.ttf"

W = 1600
INK = (22, 27, 38)
MUTED = (92, 102, 120)
LINE = (148, 160, 182)
PALE = (245, 247, 251)
WHITE = (255, 255, 255)
BRAND = {
    "platter": ((255, 240, 233), (252, 90, 30)),
    "cartly": ((234, 240, 255), (36, 83, 255)),
    "lumo": ((250, 236, 246), (221, 42, 123)),
    "minutely": ((231, 246, 233), (12, 131, 31)),
    "tv": ((239, 236, 255), (124, 92, 255)),
    "shared": ((236, 241, 248), (31, 58, 95)),
    "server": ((236, 248, 252), (8, 120, 150)),
}


def font(path, size):
    return ImageFont.truetype(path, size)


def canvas(h):
    img = Image.new("RGB", (W, h), WHITE)
    return img, ImageDraw.Draw(img)


def box(d, xy, title, sub=None, kind="shared", radius=26, size=40):
    fill, accent = BRAND[kind]
    x0, y0, x1, y1 = xy
    d.rounded_rectangle(xy, radius, fill=fill, outline=accent, width=4)
    tf, sf = font(BOLD, size), font(REG, round(size * 0.75))
    lines = [title] + (sub.split("\n") if sub else [])
    heights = [tf.size * 1.2] + [sf.size * 1.25] * (len(lines) - 1)
    y = (y0 + y1) / 2 - sum(heights) / 2
    for i, ln in enumerate(lines):
        d.text(((x0 + x1) / 2, y), ln, font=tf if i == 0 else sf,
               fill=accent if i == 0 else MUTED, anchor="ma")
        y += heights[i]


def arrow(d, p0, p1, color=LINE, width=6, head=22, both=False):
    import math

    d.line([p0, p1], fill=color, width=width)
    for a, b in ([(p0, p1), (p1, p0)] if both else [(p0, p1)]):
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        pts = [b, (b[0] - head * math.cos(ang - 0.45),
                   b[1] - head * math.sin(ang - 0.45)),
               (b[0] - head * math.cos(ang + 0.45),
                b[1] - head * math.sin(ang + 0.45))]
        d.polygon(pts, fill=color)


def label(d, xy, text, size=28, color=MUTED, anchor="mm"):
    d.text(xy, text, font=font(REG, size), fill=color, anchor=anchor)


def architecture():
    img, d = canvas(1180)
    apps = [("Platter", "food delivery", "platter"),
            ("Cartly", "e-commerce", "cartly"),
            ("Lumo", "social photos", "lumo"),
            ("Minutely", "10-min grocery", "minutely")]
    bw, gap = 340, 40
    x = (W - (4 * bw + 3 * gap)) / 2
    for name, sub, kind in apps:
        box(d, (x, 60, x + bw, 240), name, sub, kind)
        arrow(d, (x + bw / 2, 240), (x + bw / 2, 330))
        x += bw + gap
    box(d, (90, 340, 770, 520), "packages/ui",
        "design system: tokens, components,\n3D art, themes for each brand")
    box(d, (830, 340, 1510, 520), "packages/api",
        "typed client, React Query hooks,\nSSE helper, shared types")
    arrow(d, (1170, 520), (1170, 690), both=True)
    label(d, (1350, 590), "HTTPS + JSON", 30)
    label(d, (1350, 630), "live events (SSE)", 30)
    box(d, (690, 700, 1650 - 140, 900), "server",
        "Hono, SQLite, Zod, JWT sign-in,\ncarts, orders, order simulator",
        "server")
    box(d, (90, 700, 620, 900), "Reelhouse TV",
        "Android TV, separate project,\nits own catalog", "tv")
    label(d, (W / 2, 1000), "Four phone apps share one design system, one API "
          "client and one backend.", 32, INK)
    label(d, (W / 2, 1050), "The TV app is separate because it needs the "
          "react-native-tvos build of React Native.", 30)
    return img


def review_loop():
    import math

    img, d = canvas(1060)
    steps = [("Spec", "PRD, DESIGN, CLAUDE.md"),
             ("Prompt", "one milestone per session"),
             ("Claude builds", "screen by screen"),
             ("Self-check", "screenshots, typecheck,\nlint, tests"),
             ("Your review", "report, checks,\nevery screenshot"),
             ("Commit or follow up", "root cause, not patches")]
    cx, cy, rx, ry = W / 2, 520, 560, 360
    pts = []
    for i in range(len(steps)):
        ang = -math.pi / 2 + i * 2 * math.pi / len(steps)
        pts.append((cx + rx * math.cos(ang), cy + ry * math.sin(ang)))
    kinds = ["shared", "cartly", "platter", "minutely", "lumo", "tv"]
    for i, (p, (t, s)) in enumerate(zip(pts, steps)):
        q = pts[(i + 1) % len(pts)]
        arrow(d, (p[0] + (q[0] - p[0]) * 0.32, p[1] + (q[1] - p[1]) * 0.32),
              (p[0] + (q[0] - p[0]) * 0.68, p[1] + (q[1] - p[1]) * 0.68))
    for i, (p, (t, s)) in enumerate(zip(pts, steps)):
        box(d, (p[0] - 230, p[1] - 85, p[0] + 230, p[1] + 85), t, s, kinds[i])
    return img


def release_flow():
    img, d = canvas(980)
    rows = [
        (180, "Android", [("EAS Build", ".aab, signed"),
                          ("Play Console", "internal, closed test"),
                          ("Closed test", "12 testers, 14 days\n(new personal accounts)"),
                          ("Production", "staged rollout")], "minutely"),
        (540, "iOS", [("EAS Build", ".ipa, Xcode 26"),
                      ("Upload", "EAS Submit to\nApp Store Connect"),
                      ("TestFlight", "internal and\nexternal testers"),
                      ("App Review", "then release")], "cartly"),
    ]
    for y, name, steps, kind in rows:
        d.text((60, y - 80), name, font=font(BOLD, 46), fill=BRAND[kind][1])
        bw, gap = 335, 45
        x = 60
        for i, (t, s) in enumerate(steps):
            box(d, (x, y, x + bw, y + 190), t, s, kind, size=36)
            if i < len(steps) - 1:
                arrow(d, (x + bw + 6, y + 95), (x + bw + gap - 6, y + 95))
            x += bw + gap
    label(d, (W / 2, 900), "EAS Update ships JavaScript-only fixes to "
          "installed apps without a store release.", 32, INK)
    return img


def tv_focus():
    img = Image.new("RGB", (W, 900), (10, 10, 16))
    d = ImageDraw.Draw(img)
    d.text((60, 50), "Focus moves with the D-pad", font=font(BOLD, 46),
           fill=WHITE)
    rail_x = 60
    for i in range(6):
        d.rounded_rectangle([rail_x, 160 + i * 110, rail_x + 70,
                             230 + i * 110], 14,
                            fill=(40, 40, 56) if i != 1 else (124, 92, 255))
    for r, y in enumerate((170, 520)):
        d.text((200, y - 50), ["Continue watching", "Top 10 today"][r],
               font=font(BOLD, 34), fill=WHITE)
        for c in range(5):
            x0 = 200 + c * 270
            focused = (r == 0 and c == 1)
            if focused:
                d.rounded_rectangle([x0 - 16, y - 16, x0 + 246, y + 266], 22,
                                    outline=(255, 255, 255), width=6)
                d.rounded_rectangle([x0 - 30, y - 30, x0 + 260, y + 280], 30,
                                    outline=(124, 92, 255), width=4)
            d.rounded_rectangle([x0, y, x0 + 230, y + 250], 16,
                                fill=[(90, 60, 200), (200, 60, 140),
                                      (40, 120, 160), (190, 110, 30),
                                      (30, 140, 90)][c])
    arrow(d, (500, 470), (500, 515), color=(34, 211, 238))
    arrow(d, (640, 300), (735, 300), color=(34, 211, 238))
    arrow(d, (195, 300), (145, 300), color=(34, 211, 238))
    d.text((1100, 820), "Right: next card   Down: next row   Left: rail",
           font=font(REG, 30), fill=(190, 190, 210), anchor="mm")
    return img


def build_diagrams(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in [("architecture", architecture),
                     ("review-loop", review_loop),
                     ("release-flow", release_flow),
                     ("tv-focus", tv_focus)]:
        fn().save(out / f"{name}.png", dpi=(300, 300), optimize=True)


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" /
                   "images")
