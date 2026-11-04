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


def payment_flow():
    img, d = canvas(1180)
    cols = [(260, "The app", "platter"), (800, "Your server", "server"),
            (1340, "Payment provider", "cartly")]
    for x, name, kind in cols:
        box(d, (x - 210, 40, x + 210, 150), name, None, kind, size=40)
        for y in range(170, 1080, 28):
            d.line([(x, y), (x, y + 14)], fill=LINE, width=4)
    steps = [
        (0, 1, "1. Pay for order 123 (no amount sent)"),
        (1, 2, "2. Create payment for the server's total"),
        (1, 0, "3. Order ID or client secret (public)"),
        (0, 2, "4. Native sheet: UPI, card, Apple Pay, Google Pay"),
        (2, 1, "5. Signed webhook: verify, then mark paid"),
        (1, 0, "6. Order paid: open live tracking"),
    ]
    y = 230
    for a, b, text in steps:
        xa, xb = cols[a][0], cols[b][0]
        color = (60, 72, 96)
        sgn = 1 if xb > xa else -1
        arrow(d, (xa + 8 * sgn, y + 44), (xb - 8 * sgn, y + 44), color=color)
        f = font(REG, 30)
        bb = d.textbbox(((xa + xb) / 2, y + 10), text, font=f, anchor="mm")
        d.rectangle([bb[0] - 10, bb[1] - 6, bb[2] + 10, bb[3] + 6], fill=WHITE)
        label(d, ((xa + xb) / 2, y + 10), text, 30, INK)
        y += 140
    label(d, (W / 2, 1130), "The app never decides the price or that an "
          "order is paid; the server does.", 32, MUTED)
    return img


def dev_setup():
    img, d = canvas(1000)
    # where the app runs
    box(d, (60, 70, 520, 220), "Browser", "npm run web", "cartly", size=38)
    box(d, (60, 290, 520, 440), "Android emulator", "API at 10.0.2.2:4000", "minutely", size=38)
    box(d, (60, 510, 520, 660), "iPhone simulator", "Mac with Xcode", "lumo", size=38)
    box(d, (60, 730, 520, 880), "Your phone", "Expo Go or a dev build", "platter", size=38)
    # Metro
    box(d, (640, 330, 1000, 620), "Metro", "Expo's dev server\nbundles your code\nand reloads it", "shared", size=40)
    # server
    box(d, (1110, 330, 1540, 620), "API server", "npm run server\nlocalhost:4000\nSQLite + live events", "server", size=40)
    for y in (145, 365, 585, 805):
        arrow(d, (525, y), (635, 475), both=True)
    arrow(d, (1005, 475), (1105, 475), both=True)
    label(d, (W / 2, 950), "The app's code comes from Metro; its data comes from the API server.", 30, MUTED)
    return img


def session_anatomy():
    img, d = canvas(1060)
    parts = [
        ("1. Context", "Read CLAUDE.md, docs/PRD.md and docs/DESIGN.md", "shared"),
        ("2. The task", "One milestone: the app, its screens, its tabs", "platter"),
        ("3. The quality bar", "Patterns users expect, named one by one", "cartly"),
        ("4. Verification", "Screenshots at phone size, then typecheck, lint, tests", "minutely"),
        ("5. The report", "What was built, what was fixed, what is still missing", "lumo"),
    ]
    y = 60
    for i, (t, sub_, kind) in enumerate(parts):
        box(d, (200, y, 1400, y + 150), t, sub_, kind, size=40)
        if i < len(parts) - 1:
            arrow(d, (800, y + 152), (800, y + 192))
        y += 195
    label(d, (W / 2, 1030), "Every session prompt in this book follows these five parts.", 30, MUTED)
    return img


def router_tree():
    img, d = canvas(1080)
    mono = font("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 34)
    rows = [
        ("src/app/", None, 0),
        ("_layout.tsx", "Stack: the whole app", 1),
        ("login.tsx", "/login", 1),
        ("(tabs)/", None, 1),
        ("_layout.tsx", "Tab bar", 2),
        ("index.tsx", "/  (Home tab)", 2),
        ("search.tsx", "/search", 2),
        ("orders.tsx", "/orders", 2),
        ("profile.tsx", "/profile", 2),
        ("restaurant/[id].tsx", "/restaurant/r-04", 1),
        ("order/[id].tsx", "/order/ord_123", 1),
        ("cart.tsx", "/cart", 1),
    ]
    y = 60
    for name, route, depth in rows:
        x = 90 + depth * 60
        d.text((x, y), name, font=mono, fill=INK if route else BRAND["platter"][1])
        if route:
            d.line([(700, y + 20), (900, y + 20)], fill=LINE, width=3)
            d.text((930, y), route, font=font(REG, 34), fill=BRAND["shared"][1])
        y += 78
    label(d, (W / 2, 1030), "Expo Router: every file is a screen, and its path is its URL.", 30, MUTED)
    return img


def brand_palette():
    img, d = canvas(980)
    brands = [
        ("Platter", "food delivery", "#FC5A1E", "#1BA672"),
        ("Cartly", "shopping", "#2453FF", "#FFC21A"),
        ("Lumo", "social photos", "#DD2A7B", "#0095F6"),
        ("Minutely", "10-minute grocery", "#0C831F", "#F8CB46"),
        ("Reelhouse", "Android TV", "#7C5CFF", "#22D3EE"),
    ]
    hexrgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
    y = 60
    for name, what, primary, accent in brands:
        d.text((70, y + 30), name, font=font(BOLD, 44), fill=INK)
        d.text((70, y + 88), what, font=font(REG, 30), fill=MUTED)
        d.rounded_rectangle([520, y, 1000, y + 140], 24, fill=hexrgb(primary))
        d.text((760, y + 70), "primary  " + primary, font=font(BOLD, 32), fill=WHITE, anchor="mm")
        d.rounded_rectangle([1040, y, 1520, y + 140], 24, fill=hexrgb(accent))
        dark = sum(hexrgb(accent)) > 450
        d.text((1280, y + 70), "accent  " + accent, font=font(BOLD, 32), fill=INK if dark else WHITE, anchor="mm")
        y += 170
    label(d, (W / 2, 940), "One design system, five brands: screens ask for roles, never for colors.", 30, MUTED)
    return img


def live_stream():
    img, d = canvas(1000)
    steps = [
        ("Order simulator", "moves the order:\nconfirmed, preparing,\nout for delivery", "server"),
        ("Event bus", "publishes status\nand rider location", "server"),
        ("SSE stream", "GET /orders/:id/events\nsnapshot, then events", "shared"),
        ("useOrderStream", "updates the order\nin the React Query cache", "cartly"),
        ("Tracking screen", "map, timeline and\nETA re-render", "platter"),
    ]
    xs = [60, 640, 1120]
    pos = [(60, 80), (640, 80), (1120, 80), (640, 560), (1120, 560)]
    for (t, s_, k), (x, y) in zip(steps, pos):
        box(d, (x, y, x + 420, y + 300), t, s_, k, size=38)
    arrow(d, (485, 230), (635, 230))
    arrow(d, (1065, 230), (1115, 230))
    arrow(d, (1330, 385), (1060, 560))
    arrow(d, (1065, 710), (1115, 710))
    d.text((80, 600), "One stream, three apps:", font=font(BOLD, 34), fill=INK)
    for i, t in enumerate(["Platter: the rider on the map", "Cartly: shipment steps", "Minutely: the countdown ring"]):
        d.text((80, 660 + i * 56), "\u2022 " + t, font=font(REG, 32), fill=MUTED)
    return img


def build_diagrams(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in [("architecture", architecture),
                     ("review-loop", review_loop),
                     ("release-flow", release_flow),
                     ("tv-focus", tv_focus),
                     ("payment-flow-mobile", payment_flow),
                     ("dev-setup", dev_setup),
                     ("session-anatomy", session_anatomy),
                     ("router-tree", router_tree),
                     ("brand-palette", brand_palette),
                     ("live-stream", live_stream)]:
        fn().save(out / f"{name}.png", dpi=(300, 300), optimize=True)


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" /
                   "images")
