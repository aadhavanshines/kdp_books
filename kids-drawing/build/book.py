"""Build the interior PDF (8.5 x 11 in, black and white, no bleed)."""
from __future__ import annotations

import importlib
import json
import sys
from pathlib import Path

import cairosvg
import fitz  # pymupdf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path[:0] = [str(HERE), str(ROOT / "subjects")]
from draw import step_svg  # noqa: E402

BOOK = json.loads((ROOT / "book.json").read_text())
MODULES = ["s01_pets", "s02_wild", "s03_ocean", "s04_birds_bugs", "s05_dinos", "s06_fantasy",
           "s07_space", "s08_vehicles", "s09_food", "s10_nature", "s11_things"]

W, H = 612, 792          # points
INNER, OUTER = 54, 40    # margins: inside (gutter) and outside
TOP = 40
FONT = "Fredoka Light"
INK = "#111111"
SOFT = "#9a9a9a"
LINE = "#c9c9c9"

TIPS = [
    "Draw lightly first. Press harder when you like your lines.",
    "Gray lines are already drawn. Black lines are new!",
    "Mistakes are fine. Erase, or turn them into something new.",
    "Add your own ideas: a hat, a friend, a background.",
    "Color it in with your favorite colors.",
    "Draw it again, bigger or smaller. Practice makes it easy.",
]


_FONTS = {}


def width(s: str, size: float, weight: int = 400) -> float:
    """Text width in points, measured from the Fredoka font files."""
    from fontTools.ttLib import TTFont
    w = 700 if weight >= 700 else 600 if weight >= 600 else 400
    if w not in _FONTS:
        f = TTFont(ROOT / "fonts" / f"Fredoka-{w}.ttf")
        _FONTS[w] = (f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm)
    cmap, hmtx, upm = _FONTS[w]
    return sum(hmtx[cmap.get(ord(ch), cmap[ord("?")])][0] for ch in s) * size / upm


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size=12, weight=400, anchor="start", color=INK, extra=""):
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-weight="{weight}" font-size="{size}" '
            f'fill="{color}" text-anchor="{anchor}" {extra}>{esc(s)}</text>')


def drawing(steps, upto, x, y, size, final=False):
    sc = size / 200
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({sc:.4f})">{step_svg(steps, upto, final)}</g>'


def page(body: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}pt" height="{H}pt" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="#ffffff"/>{body}</svg>')


def frame(num: int):
    """Left and right edges of the live area; the gutter is on the inside."""
    left = INNER if num % 2 == 1 else OUTER
    return left, W - (OUTER if num % 2 == 1 else INNER)


def folio(num: int) -> str:
    return text(W / 2, H - 32, str(num), 10, 400, "middle", SOFT)


# --------------------------------------------------------------- subjects
def subject_page(num: int, idx: int, subj: dict, cat: str) -> str:
    x0, x1 = frame(num)
    wid = x1 - x0
    out = []
    # header
    out.append(f'<rect x="{x0}" y="{TOP}" width="58" height="34" rx="17" fill="{INK}"/>')
    out.append(text(x0 + 29, TOP + 24, f"#{idx}", 17, 700, "middle", "#ffffff"))
    out.append(text(x0 + 72, TOP + 27, subj["name"], 30, 700))
    out.append(text(x1, TOP + 24, cat, 11, 400, "end", SOFT))
    # step grid
    steps = subj["steps"]
    n = len(steps)
    gap = 10
    bw = (wid - 2 * gap) / 3
    bh = 150
    gy = TOP + 50
    cells = [("step", i) for i in range(n)]
    if n < 6:
        cells.append(("done", None))
    while len(cells) < 6:
        cells.append(("tip", None))
    for k, (kind, i) in enumerate(cells):
        cx = x0 + (k % 3) * (bw + gap)
        cy = gy + (k // 3) * (bh + gap)
        out.append(f'<rect x="{cx:.1f}" y="{cy:.1f}" width="{bw:.1f}" height="{bh}" rx="12" '
                   f'fill="none" stroke="{LINE}" stroke-width="1.3"/>')
        ds = bh - 8
        if kind == "step":
            out.append(drawing(steps, i, cx + (bw - ds) / 2, cy + 6, ds))
            out.append(f'<circle cx="{cx + 17:.1f}" cy="{cy + 17:.1f}" r="12" fill="{INK}"/>')
            out.append(text(cx + 17, cy + 22.5, str(i + 1), 14, 700, "middle", "#ffffff"))
        elif kind == "done":
            out.append(drawing(steps, n - 1, cx + (bw - ds) / 2, cy + 6, ds, final=True))
            out.append(f'<rect x="{cx + 6:.1f}" y="{cy + 6:.1f}" width="54" height="22" rx="11" fill="{INK}"/>')
            out.append(text(cx + 33, cy + 21.5, "Done!", 12, 700, "middle", "#ffffff"))
        else:
            tip = TIPS[idx % len(TIPS)]
            out.append(text(cx + bw / 2, cy + 46, "Tip", 15, 700, "middle"))
            words, lines, cur = tip.split(), [], ""
            for wd in words:
                if len(cur) + len(wd) + 1 > 20:
                    lines.append(cur)
                    cur = wd
                else:
                    cur = (cur + " " + wd).strip()
            lines.append(cur)
            for j, ln in enumerate(lines):
                out.append(text(cx + bw / 2, cy + 72 + j * 17, ln, 12.5, 400, "middle", "#444444"))
    # practice area
    py = gy + 2 * bh + gap + 18
    ph = H - 44 - py
    out.append(f'<rect x="{x0}" y="{py}" width="{wid}" height="{ph}" rx="16" fill="none" '
               f'stroke="{INK}" stroke-width="1.6" stroke-dasharray="7 6"/>')
    out.append(f'<rect x="{x0 + 16}" y="{py - 13}" width="104" height="26" rx="13" fill="#ffffff" '
               f'stroke="{INK}" stroke-width="1.6"/>')
    out.append(text(x0 + 68, py + 5.5, "Your turn!", 14, 700, "middle"))
    out.append(folio(num))
    return page("".join(out))


# --------------------------------------------------------------- front matter
def finished(subj, x, y, size):
    return drawing(subj["steps"], len(subj["steps"]) - 1, x, y, size, final=True)


def title_page(all_subjects):
    out = [text(W / 2, 150, BOOK["title_line1"], 46, 700, "middle"),
           text(W / 2, 205, BOOK["title_line2"], 46, 700, "middle"),
           text(W / 2, 250, BOOK["tagline"], 17, 400, "middle", "#333333")]
    pick = ["Cat", "T. Rex", "Rocket", "Unicorn", "Octopus", "Ice Cream", "Car", "Owl", "Lion"]
    by = {s["name"]: s for s in all_subjects}
    for k, nm in enumerate(pick):
        x = 96 + (k % 3) * 150
        y = 300 + (k // 3) * 132
        out.append(finished(by[nm], x, y, 120))
    out.append(text(W / 2, 730, BOOK["author"], 16, 600, "middle"))
    return page("".join(out))


def copyright_page(num):
    lines = [
        BOOK["full_title"],
        "",
        f"Copyright © {BOOK['year']} {BOOK['author']}. All rights reserved.",
        "",
        "No part of this book may be copied or shared in any form without",
        "written permission, except for a parent or teacher copying a page",
        "for their own child or class to practice on.",
        "",
        "All drawings in this book are original artwork made for this book.",
        "",
        "Font: Fredoka, used under the SIL Open Font License 1.1.",
        "",
        "First edition.",
    ]
    out = [text(OUTER + 20, 520 + i * 17, ln, 11, 400, "start", "#333333") for i, ln in enumerate(lines)]
    out.append(folio(num))
    return page("".join(out))


def belongs_page(num, by):
    out = [f'<rect x="80" y="170" width="452" height="300" rx="28" fill="none" stroke="{INK}" stroke-width="3"/>',
           f'<rect x="92" y="182" width="428" height="276" rx="20" fill="none" stroke="{INK}" stroke-width="1.2" stroke-dasharray="6 6"/>',
           text(W / 2, 260, "This book belongs to", 30, 700, "middle"),
           f'<line x1="150" y1="370" x2="462" y2="370" stroke="{INK}" stroke-width="1.6"/>',
           text(W / 2, 420, "Artist, age ____", 16, 400, "middle", "#444444")]
    for k, nm in enumerate(["Bunny", "Bear", "Butterfly"]):
        out.append(finished(by[nm], 136 + k * 130, 520, 110))
    out.append(folio(num))
    return page("".join(out))


def how_page(num, by):
    cat = by["Cat"]
    out = [text(W / 2, 80, "How to Use This Book", 32, 700, "middle")]
    # a strip of the cat's first four steps
    for i in range(4):
        x = 66 + i * 124
        out.append(f'<rect x="{x}" y="110" width="110" height="110" rx="12" fill="none" stroke="{LINE}" stroke-width="1.3"/>')
        out.append(drawing(cat["steps"], i, x + 10, 118, 92))
        out.append(f'<circle cx="{x + 14}" cy="124" r="10" fill="{INK}"/>')
        out.append(text(x + 14, 128.5, str(i + 1), 12, 700, "middle", "#ffffff"))
    tips = [
        ("1", "Pick a picture you like.", "Every page shows a picture in small steps."),
        ("2", "Look for the black lines.", "In each step, the black lines are the new ones to draw. "
                                          "Gray lines are the ones you drew before."),
        ("3", "Draw in the “Your turn!” box.", "Copy one step at a time. Use a pencil and draw lightly."),
        ("4", "Finish it your way.", "Go over your final lines with a dark pencil or crayon. Erase the extra pencil marks, then color your picture."),
    ]
    y = 270
    for n, head, body in tips:
        out.append(f'<circle cx="{OUTER + 46}" cy="{y}" r="17" fill="{INK}"/>')
        out.append(text(OUTER + 46, y + 6, n, 17, 700, "middle", "#ffffff"))
        out.append(text(OUTER + 76, y + 6, head, 19, 700))
        words, lines, cur = body.split(), [], ""
        for wd in words:
            if len(cur) + len(wd) + 1 > 62:
                lines.append(cur)
                cur = wd
            else:
                cur = (cur + " " + wd).strip()
        lines.append(cur)
        for j, ln in enumerate(lines):
            out.append(text(OUTER + 76, y + 30 + j * 19, ln, 14, 400, "start", "#333333"))
        y += 70 + 19 * (len(lines) - 1)
    out.append(f'<rect x="{OUTER + 30}" y="{y + 6}" width="{W - 2 * OUTER - 60}" height="86" rx="16" fill="none" stroke="{INK}" stroke-width="1.4"/>')
    out.append(text(W / 2, y + 40, "For grown-ups", 16, 700, "middle"))
    out.append(text(W / 2, y + 64, "Sit with your child for the first few pictures and praise", 13, 400, "middle", "#333333"))
    out.append(text(W / 2, y + 82, "effort, not perfection. Every drawing looks a little different!", 13, 400, "middle", "#333333"))
    out.append(folio(num))
    return page("".join(out))


def warmup_pages(start):
    dash = f'fill="none" stroke="{SOFT}" stroke-width="2.6" stroke-dasharray="2 7" stroke-linecap="round"'
    pages = []
    rows1 = [
        ("Straight lines", "".join(f'<line x1="{80 + i * 56}" y1="150" x2="{80 + i * 56}" y2="220" {dash}/>' for i in range(9))),
        ("Waves", "".join(f'<path d="M80 {290 + k * 34} q28 -22 56 0 t56 0 t56 0 t56 0 t56 0 t56 0 t56 0 t56 0" {dash}/>' for k in range(2))),
        ("Zigzags", "".join(f'<path d="M80 {410 + k * 40} l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24 l28 -24 l28 24" {dash}/>' for k in range(2))),
        ("Bumps", "".join(f'<path d="M80 {560 + k * 50} ' + "a28 28 0 0 1 56 0 " * 8 + f'" {dash}/>' for k in range(2))),
    ]
    rows2 = [
        ("Circles", "".join(f'<circle cx="{110 + i * 98}" cy="180" r="38" {dash}/>' for i in range(5))),
        ("Ovals", "".join(f'<ellipse cx="{120 + i * 124}" cy="300" rx="52" ry="32" {dash}/>' for i in range(4))),
        ("Triangles and squares", "".join(f'<path d="M{80 + i * 120} 450 l40 -70 l40 70 z" {dash}/>' for i in range(2)) +
         "".join(f'<rect x="{320 + i * 110}" y="380" width="74" height="70" rx="6" {dash}/>' for i in range(2))),
        ("Spirals", "".join(
            f'<path d="M{150 + i * 150} 580 m0 0 c0 -8 12 -8 12 0 c0 14 -24 14 -24 0 c0 -22 36 -22 36 0 c0 30 -48 30 -48 0 c0 -38 60 -38 60 0" {dash}/>'
            for i in range(3))),
    ]
    for k, rows in enumerate([rows1, rows2]):
        num = start + k
        out = [text(W / 2, 72, "Warm Up!" if k == 0 else "Warm Up Some More!", 32, 700, "middle"),
               text(W / 2, 98, "Trace the dotted lines with your pencil.", 14, 400, "middle", "#444444")]
        ys = [130, 255, 375, 520] if k == 0 else [125, 250, 360, 510]
        for (label, svg), y in zip(rows, ys):
            out.append(text(80, y, label, 15, 700))
            out.append(svg)
        out.append(text(W / 2, 700, "Great job! Now you are ready to draw.", 16, 700, "middle"))
        out.append(folio(num))
        pages.append(page("".join(out)))
    return pages


def contents_page(num, cats):
    out = [text(W / 2, 90, "What's Inside", 32, 700, "middle")]
    y = 150
    for cat, first, count in cats:
        out.append(text(96, y, cat, 18, 600))
        out.append(text(96, y + 20, f"{count} drawings", 12, 400, "start", SOFT))
        x_dots = 96 + width(cat, 18, 600) + 12
        x_num = 516 - width(f"page {first}", 16, 600) - 12
        out.append(f'<line x1="{x_dots:.1f}" y1="{y - 5}" x2="{x_num:.1f}" y2="{y - 5}" stroke="{LINE}" stroke-width="1.4" stroke-dasharray="2 5"/>')
        out.append(text(516, y, f"page {first}", 16, 600, "end"))
        y += 50
    out.append(folio(num))
    return page("".join(out))


def divider_page(num, cat, subjects, part):
    out = [f'<rect x="76" y="110" width="460" height="120" rx="60" fill="{INK}"/>',
           text(W / 2, 160, f"Part {part}", 18, 600, "middle", "#ffffff"),
           text(W / 2, 205, cat, min(34, 34 * 410 / width(cat, 34, 700)), 700, "middle", "#ffffff")]
    pick = subjects[:4]
    for k, s in enumerate(pick):
        x = 110 + (k % 2) * 220
        y = 280 + (k // 2) * 210
        out.append(finished(s, x, y, 170))
    out.append(text(W / 2, 730, ", ".join(s["name"] for s in subjects), 11, 400, "middle", "#555555"))
    out.append(folio(num))
    return page("".join(out))


def certificate_page(num, by):
    out = [f'<rect x="50" y="90" width="512" height="560" rx="30" fill="none" stroke="{INK}" stroke-width="4"/>',
           f'<rect x="64" y="104" width="484" height="532" rx="22" fill="none" stroke="{INK}" stroke-width="1.2" stroke-dasharray="6 6"/>',
           text(W / 2, 190, "Certificate of", 24, 600, "middle"),
           text(W / 2, 240, "Super Drawing!", 44, 700, "middle"),
           text(W / 2, 290, "This is to say that", 16, 400, "middle", "#333333"),
           f'<line x1="150" y1="350" x2="462" y2="350" stroke="{INK}" stroke-width="1.6"/>',
           text(W / 2, 390, "drew all 100 pictures in this book", 16, 400, "middle", "#333333"),
           text(W / 2, 412, "and is now an amazing artist!", 16, 400, "middle", "#333333"),
           f'<line x1="200" y1="470" x2="412" y2="470" stroke="{INK}" stroke-width="1.2"/>',
           text(W / 2, 490, "Date", 12, 400, "middle", SOFT)]
    for k, nm in enumerate(["Crown", "Rainbow", "Gift Box"]):
        out.append(finished(by[nm], 150 + k * 110, 510, 96))
    out.append(folio(num))
    return page("".join(out))


def free_page(num):
    out = [text(W / 2, 70, "Draw Anything You Like!", 28, 700, "middle"),
           f'<rect x="{OUTER + 10}" y="96" width="{W - 2 * OUTER - 20}" height="{H - 150}" rx="18" fill="none" stroke="{INK}" stroke-width="1.6" stroke-dasharray="7 6"/>',
           folio(num)]
    return page("".join(out))


# --------------------------------------------------------------- assemble
def build(out_pdf: Path):
    cats = []
    all_subjects = []
    for m in MODULES:
        mod = importlib.import_module(m)
        cats.append((mod.CATEGORY, mod.SUBJECTS))
        all_subjects += mod.SUBJECTS
    by = {s["name"]: s for s in all_subjects}

    pages = [title_page(all_subjects), copyright_page(2), belongs_page(3, by), how_page(4, by)]
    pages += warmup_pages(5)
    contents_at = len(pages)
    pages.append(None)  # placeholder for contents
    toc = []
    idx = 0
    for part, (cat, subs) in enumerate(cats, 1):
        num = len(pages) + 1
        toc.append((cat, num, len(subs)))
        pages.append(divider_page(num, cat, subs, part))
        for s in subs:
            idx += 1
            pages.append(subject_page(len(pages) + 1, idx, s, cat))
    pages.append(certificate_page(len(pages) + 1, by))
    pages.append(free_page(len(pages) + 1))
    if len(pages) % 2:
        pages.append(free_page(len(pages) + 1))
    pages[contents_at] = contents_page(contents_at + 1, toc)

    doc = fitz.open()
    for svg in pages:
        pdf = cairosvg.svg2pdf(bytestring=svg.encode())
        doc.insert_pdf(fitz.open("pdf", pdf))
    doc.set_metadata({"title": BOOK["full_title"], "author": BOOK["author"]})
    doc.save(out_pdf, garbage=4, deflate=True)
    return len(pages), toc


if __name__ == "__main__":
    out = ROOT / "dist" / "interior.pdf"
    out.parent.mkdir(exist_ok=True)
    n, toc = build(out)
    print(n, "pages ->", out)
    for t in toc:
        print(t)
