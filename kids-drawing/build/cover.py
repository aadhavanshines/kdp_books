"""Full-wrap paperback cover (back, spine, front) with bleed, plus a front-only JPEG."""
from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path

import cairosvg
import fitz

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path[:0] = [str(HERE), str(ROOT / "subjects")]
from draw import color_svg, star  # noqa: E402
from draw import shape_svg  # noqa: E402
from book import MODULES  # noqa: E402

BOOK = json.loads((ROOT / "book.json").read_text())
PER_PAGE = 0.002252          # inches per page, black ink on white paper
BLEED = 9                    # 0.125 in
TW, TH = 612, 792            # trim 8.5 x 11 in
FONT = "Fredoka Light"
NAVY = "#1F2A5A"
SKY = "#BFE6FF"
SUN = "#FFC93C"
CORAL = "#FF6B4A"

# colors for the finished drawings on the cover: main color and per-shape overrides
PALETTE = {
    "Cat": ("#F7A541", {}),
    "Lion": ("#FFD37A", {1: "#E38B2C", 3: "#FFD37A"}),
    "T. Rex": ("#7CCB6B", {}),
    "Unicorn": ("#FFFFFF", {3: "#FFD54A", 4: "#F59AC2", 5: "#FFFFFF"}),
    "Rocket": ("#F3F4F8", {1: "#7FD3FF", 2: "#FF6B6B", 3: "#FF6B6B", 4: "#9AA3B5", 5: "#FFB830"}),
    "Octopus": ("#B58AF2", {}),
    "Ice Cream": ("#F2B866", {1: "#FF9EC4", 2: "#E53E3E"}),
    "Car": ("#4FA3F7", {2: "#555A66", 3: "#555A66"}),
    "Butterfly": ("#FF9F43", {0: "#6C5CE7", 5: "#6C5CE7"}),
    "Whale": ("#5DADE2", {}),
    "Owl": ("#B98559", {1: "#FFFFFF", 2: "#FFFFFF", 3: "#FFB830", 4: "#7A5230"}),
    "Ladybug": ("#FF5A4E", {}),
    "Puppy": ("#E6B98A", {1: "#FFF3E2", 3: "#E6B98A"}),
    "Frog": ("#7DD56F", {}),
    "Donut": ("#E8B07A", {1: "#FF8FBF", 2: "#BFE6FF"}),
    "Planet": ("#FFB84D", {}),
    "Sun": (SUN, {}),
    "Dragon": ("#6FCF97", {}),
    "Hot Air Balloon": ("#FF7A6B", {1: "#C68B59"}),
    "Penguin": ("#3A4664", {2: "#FFB830", 3: "#3A4664", 4: "#FFB830", 5: "#FFB830"}),
}


def subjects():
    out = {}
    for m in MODULES:
        for s in importlib.import_module(m).SUBJECTS:
            out[s["name"]] = s
    return out


def art(by, name, x, y, size, rot=0):
    main, over = PALETTE.get(name, ("#FFFFFF", {}))
    sc = size / 200
    body = color_svg(by[name]["steps"], main, over)
    return (f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot} {size/2:.1f} {size/2:.1f}) '
            f'scale({sc:.4f})">{body}</g>')


def text(x, y, s, size, weight=700, anchor="middle", color=NAVY, extra=""):
    s = s.replace("&", "&amp;")
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-weight="{weight}" font-size="{size}" '
            f'fill="{color}" text-anchor="{anchor}" {extra}>{s}</text>')


def outlined(x, y, s, size, fill, stroke="#ffffff", sw=10):
    """Bold title text with a thick white outline, like a sticker."""
    return (text(x, y, s, size, 700, "middle", stroke, f'stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"') +
            text(x, y, s, size, 700, "middle", fill))


def sparkles(pts):
    out = []
    for x, y, r in pts:
        out.append(shape_svg({**star(x, y, r, r * 0.4, n=4), "fill": "white"}, "#ffffff", 0)
                   .replace('stroke-width="0.00"', 'stroke-width="0"'))
    return "".join(out)


ART = ROOT / "art" / "cover-front.jpg"   # painted cover art (Higgsfield), if present


def painted_front(ox, h):
    """The painted scene filling the front panel and its bleed, plus title, badge and author."""
    import base64
    from PIL import Image
    im = Image.open(ART)
    pw, ph = TW + BLEED, h                   # front panel plus outer bleed
    # scale to cover, crop evenly top and bottom
    sc = max(pw / im.width, ph / im.height)
    iw, ih = im.width * sc, im.height * sc
    data = base64.b64encode(ART.read_bytes()).decode()
    cx = ox + TW / 2
    o = [f'<image x="{ox + (pw - iw) / 2:.2f}" y="{(ph - ih) / 2:.2f}" width="{iw:.2f}" height="{ih:.2f}" '
         f'preserveAspectRatio="none" href="data:image/jpeg;base64,{data}"/>']
    o.append(f'<rect x="{ox + 34}" y="{BLEED + 34}" width="{TW - 68}" height="200" rx="34" fill="#ffffff" fill-opacity="0.93"/>')
    o.append(text(cx, BLEED + 108, BOOK["title_line1"], 64, 700, "middle", NAVY))
    o.append(f'<rect x="{cx - 196}" y="{BLEED + 128}" width="392" height="74" rx="37" fill="{CORAL}"/>')
    o.append(text(cx, BLEED + 180, "100 Easy Drawings", 44, 700, "middle", "#ffffff"))
    o.append(text(cx, BLEED + 224, "for Kids", 22, 600, "middle", NAVY))
    o.append(f'<circle cx="{ox + TW - 66}" cy="{BLEED + 238}" r="44" fill="{SUN}" stroke="#ffffff" stroke-width="5"/>')
    o.append(text(ox + TW - 66, BLEED + 233, "Ages", 15, 700))
    o.append(text(ox + TW - 66, BLEED + 255, "4 to 8", 19, 700))
    o.append(f'<rect x="{cx - 130}" y="{BLEED + TH - 54}" width="260" height="36" rx="18" fill="#ffffff"/>')
    o.append(text(cx, BLEED + TH - 30, BOOK["author"], 18, 600, "middle", NAVY))
    return "".join(o)


def front(by, ox):
    """Front cover; ox is the x of its left trim edge."""
    cx = ox + TW / 2
    o = []
    o.append(f'<rect x="{ox + 34}" y="{BLEED + 40}" width="{TW - 68}" height="208" rx="34" fill="#ffffff"/>')
    o.append(text(cx, BLEED + 118, BOOK["title_line1"], 64, 700, "middle", NAVY))
    o.append(f'<rect x="{cx - 196}" y="{BLEED + 140}" width="392" height="74" rx="37" fill="{CORAL}"/>')
    o.append(text(cx, BLEED + 192, "100 Easy Drawings", 44, 700, "middle", "#ffffff"))
    o.append(text(cx, BLEED + 236, "for Kids", 22, 600, "middle", NAVY))
    # age badge
    o.append(f'<circle cx="{ox + TW - 70}" cy="{BLEED + 292}" r="46" fill="{SUN}" stroke="#ffffff" stroke-width="5"/>')
    o.append(text(ox + TW - 70, BLEED + 287, "Ages", 15, 700))
    o.append(text(ox + TW - 70, BLEED + 309, "4 to 8", 19, 700))
    # step strip: cat in four steps
    from draw import step_svg
    cat = by["Cat"]["steps"]
    sy = BLEED + 300
    for i, k in enumerate([0, 1, 2, 5]):
        x = ox + 64 + i * 112
        o.append(f'<rect x="{x}" y="{sy}" width="96" height="96" rx="16" fill="#ffffff"/>')
        body = step_svg(cat, k, final=(k == 5))
        o.append(f'<g transform="translate({x + 6} {sy + 6}) scale(0.42)">{body}</g>')
        o.append(f'<circle cx="{x + 14}" cy="{sy + 14}" r="11" fill="{NAVY}"/>')
        o.append(text(x + 14, sy + 19, str(i + 1), 13, 700, "middle", "#ffffff"))
        if i < 3:
            o.append(text(x + 104, sy + 56, "›", 30, 700, "middle", NAVY))
    # finished colored drawings
    o.append(art(by, "T. Rex", ox + 22, BLEED + 420, 190, -4))
    o.append(art(by, "Lion", ox + 205, BLEED + 410, 180, 0))
    o.append(art(by, "Rocket", ox + 400, BLEED + 404, 180, 8))
    o.append(art(by, "Octopus", ox + 40, BLEED + 590, 150, 0))
    o.append(art(by, "Ice Cream", ox + 220, BLEED + 590, 150, -6))
    o.append(art(by, "Car", ox + 400, BLEED + 600, 160, 0))
    o.append(f'<rect x="{cx - 130}" y="{BLEED + TH - 54}" width="260" height="36" rx="18" fill="#ffffff"/>')
    o.append(text(cx, BLEED + TH - 30, BOOK["author"], 18, 600, "middle", NAVY))
    o.append(sparkles([(ox + 40, BLEED + 300, 10), (ox + 560, BLEED + 400, 9), (ox + 196, BLEED + 590, 8),
                       (ox + 30, BLEED + 760, 8)]))
    return "".join(o)


def back(by, ox):
    cx = ox + TW / 2
    o = [f'<rect x="{ox + 44}" y="{BLEED + 48}" width="{TW - 88}" height="330" rx="30" fill="#ffffff"/>',
         text(cx, BLEED + 100, "Anyone can draw,", 30, 700),
         text(cx, BLEED + 136, "one easy step at a time!", 30, 700, "middle", CORAL)]
    lines = [
        "Each picture is broken into small, simple steps. The new lines",
        "are black and the lines you already drew are gray, so young",
        "artists always know exactly what to draw next.",
        "",
        "• 100 cute, original pictures in 11 themes",
        "• A big “Your turn!” space on every page",
        "• Warm-up tracing pages to build pencil control",
        "• Large 8.5 x 11 in pages, one drawing per page",
        "• A certificate to celebrate at the end",
    ]
    for i, ln in enumerate(lines):
        anchor, x = ("middle", cx) if i < 3 else ("start", ox + 120)
        o.append(text(x, BLEED + 176 + i * 21, ln, 14.5, 400 if i < 3 else 600, anchor, "#2a2f45"))
    names = ["Owl", "Whale", "Butterfly", "Frog", "Dragon", "Hot Air Balloon"]
    for k, nm in enumerate(names):
        x = ox + 64 + (k % 3) * 170
        y = BLEED + 392 + (k // 3) * 136
        o.append(art(by, nm, x, y, 132))
    # barcode area (KDP prints the barcode here)
    o.append(f'<rect x="{ox + TW - 44 - 144}" y="{BLEED + TH - 44 - 86}" width="144" height="86" fill="#ffffff"/>')
    o.append(sparkles([(ox + 30, BLEED + 30, 8), (ox + 580, BLEED + 410, 8), (ox + 60, BLEED + 720, 9)]))
    return "".join(o)


def background(w, h):
    dots = []
    import random
    rnd = random.Random(7)
    for _ in range(70):
        x, y, r = rnd.uniform(0, w), rnd.uniform(0, h), rnd.uniform(2, 4.5)
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#ffffff" opacity="0.55"/>')
    return (f'<rect width="{w}" height="{h}" fill="{SKY}"/>'
            f'<path d="M0 {h - 150} Q{w * 0.25} {h - 210} {w * 0.5} {h - 160} T{w} {h - 170} L{w} {h} L0 {h} Z" fill="#A6DB8E"/>'
            + "".join(dots))


def build(pages: int):
    spine = pages * PER_PAGE * 72
    w = 2 * BLEED + 2 * TW + spine
    h = 2 * BLEED + TH
    by = subjects()
    fr = painted_front(BLEED + TW + pages * PER_PAGE * 72, 2 * BLEED + TH) if ART.exists() else None
    back_x, spine_x, front_x = BLEED, BLEED + TW, BLEED + TW + spine
    fr = fr or front(by, front_x)
    sp = (f'<rect x="{spine_x}" y="0" width="{spine}" height="{h}" fill="{NAVY}"/>'
          f'<g transform="translate({spine_x + spine / 2 + 3.2} {h / 2}) rotate(90)">'
          + text(0, 0, f"Draw Step by Step  •  100 Easy Drawings  •  {BOOK['author']}", 9, 700, "middle", "#ffffff")
          + "</g>")
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.2f}pt" height="{h}pt" viewBox="0 0 {w:.2f} {h}">'
           + background(w, h) + back(by, back_x) + sp + fr + "</svg>")
    dist = ROOT / "dist"
    (dist / "cover.pdf").write_bytes(cairosvg.svg2pdf(bytestring=svg.encode()))
    # front cover alone, for the eBook listing image and previews
    fsvg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{TW}" height="{TH}" '
            f'viewBox="{front_x} {BLEED} {TW} {TH}">' + background(w, h) + fr + "</svg>")
    cairosvg.svg2png(bytestring=fsvg.encode(), write_to=str(dist / "front-cover.png"), output_width=1650)
    return w / 72, h / 72, spine / 72


if __name__ == "__main__":
    n = fitz.open(ROOT / "dist" / "interior.pdf").page_count
    W_, H_, S_ = build(n)
    print(f"cover {W_:.3f} x {H_:.3f} in, spine {S_:.3f} in for {n} pages")
