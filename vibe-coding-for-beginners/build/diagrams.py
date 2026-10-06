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


def vibe_loop():
    return cycle([("1. Describe", "what you want"), ("2. Build", "the AI writes code"),
                  ("3. Check", "run it and test it"), ("4. Correct", "say what to change")],
                 h=860, rx=420, ry=300, hw=230, hh=80, center=["repeat until", "it's right"])


def web_app_anatomy():
    img, d = canvas(820)
    box(d, (30, 40, 440, 330), "Front end", NAVY, WHITE, sub="runs in your browser: HTML, CSS, JavaScript")
    box(d, (540, 110, 840, 260), "API", LIGHT, sub="requests and JSON replies")
    box(d, (940, 40, W - 30, 330), "Back end", NAVY, WHITE, sub="runs on a server, e.g. Python with Flask")
    arrow(d, (440, 150), (532, 150))
    arrow(d, (840, 150), (932, 150))
    arrow(d, (940, 225), (848, 225), color=MID)
    arrow(d, (540, 225), (448, 225), color=MID)
    box(d, (30, 520, 440, 760), "You", PALE, sub="click, type, and see results", outline=MID)
    box(d, (940, 520, W - 30, 760), "Database", LIGHT, sub="keeps data safe across restarts, e.g. SQLite")
    arrow(d, (180, 520), (180, 338))
    arrow(d, (290, 338), (290, 512), color=MID)
    arrow(d, (1100, 330), (1100, 512))
    arrow(d, (1210, 520), (1210, 338), color=MID)
    d.text((690, 330), "over the internet", font=f(ITAL, 28), fill=MID, anchor="ma")
    return img


def agent_loop():
    img, d = canvas(860)
    box(d, (W / 2 - 260, 20, W / 2 + 260, 150), "Your request", NAVY, WHITE)
    box(d, (60, 300, 500, 440), "Gather context", LIGHT, sub="read files, search")
    box(d, (880, 300, W - 60, 440), "Take action", LIGHT, sub="edit files, run commands")
    box(d, (W / 2 - 230, 600, W / 2 + 230, 740), "Check results", LIGHT, sub="read output and errors")
    arrow(d, (W / 2, 150), (W / 2, 220))
    poly_arrow(d, [(W / 2, 220), (280, 220), (280, 292)])
    arrow(d, (500, 370), (872, 370))
    poly_arrow(d, [(1100, 440), (1100, 670), (W / 2 + 238, 670)])
    poly_arrow(d, [(W / 2 - 230, 670), (280, 670), (280, 448)])
    d.text((W / 2, 470), "repeat until done", font=f(ITAL, 30), fill=MID, anchor="ma")
    d.text((W / 2, 790), "...then report back, or ask you a question", font=f(ITAL, 30), fill=MID, anchor="ma")
    return img


def explore_plan_build():
    img, d = canvas(520)
    steps = [("Explore", "read the code"), ("Plan", "agree the approach"), ("Build", "code and test"),
             ("Commit", "save a version")]
    bw, gap, y0 = 290, 40, 200
    xs = [40 + i * (bw + gap) for i in range(4)]
    for i, (x, (t, sub)) in enumerate(zip(xs, steps)):
        box(d, (x, y0, x + bw, y0 + 170), t, NAVY if i == 2 else LIGHT, WHITE if i == 2 else INK,
            sub=sub, font=f(BOLD, 38))
        if i < 3:
            arrow(d, (x + bw, y0 + 85), (x + bw + gap - 6, y0 + 85))
    poly_arrow(d, [(40 + 60, y0), (40 + 60, 90), (xs[2] + bw / 2, 90), (xs[2] + bw / 2, y0 - 8)], color=MID)
    d.text(((40 + xs[2] + bw / 2) / 2 + 40, 40), "small, obvious change? go straight to Build",
           font=f(ITAL, 30), fill=MID, anchor="ma")
    d.text((W / 2, 430), "Plan mode (Shift+Tab) covers the first two steps", font=f(ITAL, 30),
           fill=MID, anchor="ma")
    return img


def debug_loop():
    return cycle(["1. Reproduce", "2. Isolate", "3. Understand", "4. Fix", "5. Verify", "6. Prevent"],
                 h=920, rx=470, ry=330, hw=190, hh=58, center=["a test proves", "the fix"])


def git_flow():
    img, d = canvas(700)
    y_main, y_br = 170, 470
    d.line([(60, y_main), (W - 60, y_main)], fill=NAVY, width=10)
    d.text((60, y_main - 80), "main", font=f(BOLD, 36), fill=NAVY)
    for x in (120, 300):
        d.ellipse((x - 26, y_main - 26, x + 26, y_main + 26), fill=NAVY)
    d.line([(300, y_main), (420, y_br)], fill=MID, width=8)
    d.line([(420, y_br), (960, y_br)], fill=MID, width=8)
    for x in (520, 680, 840):
        d.ellipse((x - 24, y_br - 24, x + 24, y_br + 24), fill=MID)
    d.text((520, y_br + 46), "commit", font=f(REG, 28), fill=INK, anchor="ma")
    d.text((680, y_br + 46), "commit", font=f(REG, 28), fill=INK, anchor="ma")
    d.text((840, y_br + 46), "commit", font=f(REG, 28), fill=INK, anchor="ma")
    d.text((440, y_br - 80), "feature branch", font=f(BOLD, 34), fill=MID)
    d.line([(960, y_br), (1100, y_main)], fill=MID, width=8)
    d.ellipse((1100 - 30, y_main - 30, 1100 + 30, y_main + 30), fill=NAVY)
    d.text((1100, y_main - 84), "merge", font=f(BOLD, 32), fill=NAVY, anchor="ma")
    box(d, (880, 560, W - 60, 680), "Pull request", LIGHT, sub="push, review, then merge", font=f(BOLD, 32))
    arrow(d, (1040, 560), (1040, 330), color=MID, width=5)
    return img


def api_flow():
    img, d = canvas(760)
    box(d, (30, 60, 420, 300), "Browser", LIGHT, sub="the Study Buddy page")
    box(d, (500, 60, 900, 300), "Your server", NAVY, WHITE, sub="Flask app; holds the API key")
    box(d, (980, 60, W - 30, 300), "Claude API", LIGHT, sub="api.anthropic.com")
    arrow(d, (420, 140), (492, 140))
    arrow(d, (500, 230), (428, 230), color=MID)
    arrow(d, (900, 140), (972, 140))
    arrow(d, (980, 230), (908, 230), color=MID)
    d.text((460, 330), "notes / cards", font=f(ITAL, 28), fill=MID, anchor="ma")
    d.text((940, 330), "prompt / JSON", font=f(ITAL, 28), fill=MID, anchor="ma")
    box(d, (240, 470, W - 240, 690), "The API key never reaches the browser",
        PALE, sub="it is read from an environment variable on the server", outline=MID, font=f(BOLD, 36))
    return img


def deploy_flow():
    img, d = canvas(1000)
    box(d, (40, 40, 560, 220), "Your computer", LIGHT, sub="code, tests, Git")
    box(d, (820, 40, W - 40, 220), "GitHub", LIGHT, sub="your repository")
    arrow(d, (560, 130), (812, 130))
    d.text((686, 80), "git push", font=f(ITAL, 30), fill=MID, anchor="ma")
    box(d, (500, 360, W - 40, 640), "Hosting service", NAVY, WHITE,
        sub="installs requirements, starts the production server, sets environment variables")
    arrow(d, (1100, 220), (1100, 352))
    box(d, (40, 360, 420, 640), "Tests in CI", LIGHT, sub="run on every push")
    poly_arrow(d, [(900, 220), (900, 290), (230, 290), (230, 352)], color=MID)
    box(d, (500, 760, 900, 960), "Persistent disk", PALE, sub="the database file", outline=MID)
    box(d, (980, 760, W - 40, 960), "Your users", LIGHT, sub="open the public URL")
    arrow(d, (700, 640), (700, 752), color=MID)
    arrow(d, (1160, 640), (1160, 752))
    return img


def customization_map():
    rows = [("CLAUDE.md", "Rules and facts Claude reads in every session", "Ch. 16"),
            ("Skills", "Reusable instructions and workflows, loaded on demand", "Ch. 17"),
            ("Subagents", "Specialist helpers that work in their own context", "Ch. 17"),
            ("Hooks", "Scripts that always run at set moments", "Ch. 18"),
            ("Permissions", "What Claude may do without asking", "Ch. 18"),
            ("MCP servers", "Connections to outside tools and data", "Ch. 19"),
            ("Plugins", "Bundles of the above, installed together", "Ch. 17")]
    img, d = canvas(40 + len(rows) * 104)
    for i, (k, q, ch) in enumerate(rows):
        y = 20 + i * 104
        d.rounded_rectangle((30, y, 360, y + 88), radius=16, fill=NAVY)
        d.text((195, y + 44), k, font=f(BOLD, 36), fill=WHITE, anchor="mm")
        d.rounded_rectangle((376, y, W - 30, y + 88), radius=16, fill=LIGHT)
        d.text((400, y + 44), q, font=f(REG, 32), fill=INK, anchor="lm")
        d.text((W - 50, y + 44), ch, font=f(ITAL, 28), fill=MID, anchor="rm")
    return img


def hooks_lifecycle():
    img, d = canvas(1060)
    steps = [("You send a prompt", None, False), ("PreToolUse hook", "can block the action", True),
             ("The tool runs", "edit a file, run a command", False), ("PostToolUse hook", "e.g. format or check", True),
             ("Claude finishes", None, False), ("Stop hook", "can send Claude back to work", True)]
    y = 20
    for i, (t, sub, hook) in enumerate(steps):
        x0, x1 = (200, W - 200)
        box(d, (x0, y, x1, y + 130), t, NAVY if hook else LIGHT, WHITE if hook else INK,
            sub=sub, font=f(BOLD, 36))
        if i < len(steps) - 1:
            arrow(d, (W / 2, y + 130), (W / 2, y + 168))
        y += 176
    poly_arrow(d, [(200, 3 * 176 + 85), (130, 3 * 176 + 85), (130, 176 + 85), (192, 176 + 85)], color=MID)
    d.text((55, 2 * 176 + 50), "next", font=f(ITAL, 26), fill=MID, anchor="ma")
    d.text((55, 2 * 176 + 85), "action", font=f(ITAL, 26), fill=MID, anchor="ma")
    return img


def mcp_architecture():
    img, d = canvas(900)
    d.rounded_rectangle((40, 40, 560, 860), radius=26, fill=PALE, outline=NAVY, width=5)
    d.text((300, 80), "Claude Code", font=f(BOLD, 40), fill=NAVY, anchor="ma")
    box(d, (90, 170, 510, 290), "Claude", NAVY, WHITE)
    servers = [("Playwright", "drive a web browser"), ("Docs search", "look up documentation"),
               ("GitHub, Notion, databases...", "your other tools")]
    for i, (s, sub) in enumerate(servers):
        y = 370 + i * 170
        box(d, (90, y, 510, y + 110), "MCP connection", LIGHT, font=f(BOLD, 32))
        box(d, (800, y - 10, W - 40, y + 120), s, NAVY, WHITE, sub=sub, font=f(BOLD, 34))
        arrow(d, (510, y + 38), (792, y + 38))
        arrow(d, (800, y + 78), (518, y + 78), color=MID)
        d.line([(300, 290 if i == 0 else y - 60), (300, y)], fill=MID, width=5)
    d.text((655, 320), "MCP", font=f(BOLD, 34), fill=MID, anchor="ma")
    return img


def context_window():
    img, d = canvas(520)
    segs = [("CLAUDE.md\n+ setup", 0.16, NAVY, WHITE), ("Conver-\nsation", 0.22, MID, WHITE),
            ("Files\nClaude read", 0.26, LIGHT, INK), ("Command\noutput", 0.2, LIGHT, INK),
            ("Free\nspace", 0.16, WHITE, INK)]
    x, y0, y1 = 30, 110, 330
    d.text((W / 2, 30), "The context window: everything Claude can see at once",
           font=f(BOLD, 36), fill=INK, anchor="ma")
    for text, frac, fill, col in segs:
        w = (W - 60) * frac
        box(d, (x + 3, y0, x + w - 3, y1), text, fill, col, font=f(BOLD, 30), radius=10,
            outline=MID if fill == WHITE else None)
        x += w
    d.rectangle((28, y0 - 4, W - 28, y1 + 4), outline=INK, width=4)
    d.text((W / 2, 370), "As it fills, older details get summarized (compacted).", font=f(ITAL, 30),
           fill=MID, anchor="ma")
    d.text((W / 2, 420), "Use /clear between tasks and /context to check usage.", font=f(ITAL, 30),
           fill=MID, anchor="ma")
    return img


def defense_layers():
    layers = [("Your review", "read plans, diffs, and replies"), ("Tests", "prove behavior, catch regressions"),
              ("Hooks", "checks that always run"), ("Permission rules", "deny secrets and risky commands"),
              ("Permission mode", "Manual, Plan, Accept edits, or Auto"), ("Sandbox / container", "limits what any command can reach")]
    img, d = canvas(60 + len(layers) * 118)
    for i, (t, sub) in enumerate(layers):
        inset = i * 36
        y = 20 + i * 118
        dark = i % 2 == 0
        box(d, (40 + inset, y, W - 40 - inset, y + 104), t, NAVY if dark else LIGHT,
            WHITE if dark else INK, sub=sub, font=f(BOLD, 34))
    return img


def store_release():
    img, d = canvas(1180)
    box(d, (40, 30, W - 40, 190), "Your project", LIGHT, sub="app.json, eas.json, tests passing, privacy policy ready")
    arrow(d, (W / 2, 190), (W / 2, 262))
    box(d, (240, 270, W - 240, 430), "EAS Build (cloud)", NAVY, WHITE, sub="signs and builds the store files")
    col = [(40, 660), (720, W - 40)]
    heads = [("Google Play", "Android App Bundle (.aab)"), ("Apple App Store", "iOS build (.ipa)")]
    steps = [[("Closed testing", "new accounts: 12 testers, 14 days"),
              ("Production review", "Play Console"), ("Staged rollout", "to a % of users")],
             [("TestFlight", "external testers need a review"),
              ("App Review", "App Store Connect"), ("Release", "manual, automatic, or phased")]]
    for (x0, x1), (h, sub), ss in zip(col, heads, steps):
        cx = (x0 + x1) / 2
        poly_arrow(d, [(W / 2, 430), (W / 2, 470), (cx, 470), (cx, 502)], color=MID)
        box(d, (x0, 510, x1, 640), h, LIGHT, sub=sub, font=f(BOLD, 38))
        y = 640
        for i, (s, sb) in enumerate(ss):
            arrow(d, (cx, y), (cx, y + 52), color=MID, width=6)
            y += 60
            box(d, (x0 + 30, y, x1 - 30, y + 110), s, PALE, sub=sb, outline=MID, font=f(BOLD, 32))
            y += 110
    return img


def sdlc_cycle():
    return cycle([("1. Plan", "what and why"), ("2. Design", "how it will work"), ("3. Build", "small slices"),
                  ("4. Test", "prove it works"), ("5. Release", "version, tag, ship"),
                  ("6. Maintain", "feedback, fixes")],
                 h=940, rx=470, ry=340, hw=200, hh=70, center=["each release", "starts the next", "cycle"])


DIAGRAMS = {
    "vibe-loop.png": vibe_loop,
    "web-app-anatomy.png": web_app_anatomy,
    "agent-loop.png": agent_loop,
    "explore-plan-build.png": explore_plan_build,
    "debug-loop.png": debug_loop,
    "git-flow.png": git_flow,
    "api-flow.png": api_flow,
    "deploy-flow.png": deploy_flow,
    "customization-map.png": customization_map,
    "hooks-lifecycle.png": hooks_lifecycle,
    "mcp-architecture.png": mcp_architecture,
    "context-window.png": context_window,
    "defense-layers.png": defense_layers,
    "store-release.png": store_release,
    "sdlc-cycle.png": sdlc_cycle,
}


def build_diagrams(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in DIAGRAMS.items():
        fn().save(out / name, dpi=(300, 300))


if __name__ == "__main__":
    build_diagrams(Path(__file__).resolve().parent.parent / "manuscript" / "images")
