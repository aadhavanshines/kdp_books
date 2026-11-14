"""Vector wrap cover (back, spine, front, with 0.125 in bleed) and a front-only JPEG."""
import io
import json
import random
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
META = json.loads((ROOT / "book.json").read_text())
PER_PAGE, BLEED = 0.002252, 9
TW, TH = 432, 648
NAVY, DEEP, CREAM, YELLOW, RED = "#0F1B33", "#070D1A", "#F3E9D2", "#F6C945", "#C2202B"


def t(x, y, s, size, font="Playfair Display", weight=700, fill=CREAM, anchor="middle", extra=""):
    s = s.replace("&", "&amp;")
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{font}" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>')


def stars(x0, y0, w, h, n, seed):
    rnd = random.Random(seed)
    return "".join(f'<circle cx="{x0 + rnd.uniform(0, w):.1f}" cy="{y0 + rnd.uniform(0, h):.1f}" '
                   f'r="{rnd.uniform(0.4, 1.1):.2f}" fill="{CREAM}" opacity="{rnd.uniform(0.3, 0.8):.2f}"/>'
                   for _ in range(n))


def front(ox, oy):
    cx = ox + TW / 2
    lx, base = ox + 300, oy + 560               # lighthouse center and foot
    lamp_y = base - 232
    o = [stars(ox, oy, TW + BLEED, 330, 90, 3)]
    # beams from the lamp
    o.append(f'<polygon points="{lx},{lamp_y} {ox - 20},{lamp_y - 40} {ox - 20},{lamp_y + 75}" fill="{YELLOW}" opacity="0.34"/>')
    o.append(f'<polygon points="{lx},{lamp_y} {ox + TW + 20},{lamp_y - 34} {ox + TW + 20},{lamp_y + 22}" fill="{YELLOW}" opacity="0.34"/>')
    # sea and rock
    o.append(f'<rect x="{ox - BLEED}" y="{base - 6}" width="{TW + 2 * BLEED}" height="{TH - (base - oy) + 6 + BLEED}" fill="{DEEP}"/>')
    o.append(f'<path d="M{lx - 150} {base} Q{lx - 90} {base - 46} {lx - 30} {base - 40} L{lx + 34} {base - 40} '
             f'Q{lx + 96} {base - 34} {ox + TW + 20} {base - 4} L{ox + TW + 20} {base + 10} L{lx - 150} {base + 10} Z" fill="{DEEP}"/>')
    for k in range(3):
        y = base + 22 + k * 20
        o.append(f'<path d="M{ox - 10} {y} q18 -7 36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0 t36 0" '
                 f'fill="none" stroke="{NAVY}" stroke-width="1.6" opacity="0.9"/>')
    # tower
    o.append(f'<polygon points="{lx - 30},{base - 40} {lx - 17},{lamp_y + 22} {lx + 17},{lamp_y + 22} {lx + 30},{base - 40}" fill="{DEEP}"/>')
    o.append(f'<rect x="{lx - 23}" y="{lamp_y + 16}" width="46" height="7" fill="{DEEP}"/>')
    o.append(f'<rect x="{lx - 13}" y="{lamp_y - 12}" width="26" height="28" fill="{YELLOW}"/>')
    o.append(f'<rect x="{lx - 13}" y="{lamp_y - 12}" width="26" height="28" fill="none" stroke="{DEEP}" stroke-width="3"/>')
    o.append(f'<line x1="{lx}" y1="{lamp_y - 12}" x2="{lx}" y2="{lamp_y + 16}" stroke="{DEEP}" stroke-width="2.5"/>')
    o.append(f'<polygon points="{lx - 19},{lamp_y - 12} {lx},{lamp_y - 36} {lx + 19},{lamp_y - 12}" fill="{DEEP}"/>')
    for k in range(3):
        o.append(f'<rect x="{lx - 4}" y="{lamp_y + 60 + k * 44}" width="8" height="13" fill="{YELLOW}" opacity="0.85"/>')
    # title block
    o.append(t(cx, oy + 52, "60 MURDER MYSTERY LOGIC PUZZLES", 14.5, "Special Elite", 400, YELLOW, extra='letter-spacing="1.5"'))
    for i, line in enumerate(["WHO KILLED", "THE LIGHTHOUSE", "KEEPER?"]):
        o.append(t(cx, oy + 112 + i * 52, line, 46 if i != 1 else 41, weight=900))
    o.append(f'<rect x="{cx - 70}" y="{oy + 236}" width="140" height="2" fill="{YELLOW}"/>')
    o.append(t(cx, oy + 262, "Suspects, clues and one killer every time", 15.5, weight=400, extra='font-style="italic"'))
    # red stamp
    sx, sy = ox + 118, oy + 452
    o.append(f'<g transform="rotate(-11 {sx} {sy})" opacity="0.93">'
             f'<rect x="{sx - 84}" y="{sy - 30}" width="168" height="60" rx="5" fill="none" stroke="{RED}" stroke-width="4.5"/>'
             f'<rect x="{sx - 77}" y="{sy - 23}" width="154" height="46" rx="3" fill="none" stroke="{RED}" stroke-width="1.5"/>'
             + t(sx, sy + 10, "CASE FILE", 25, "Special Elite", 400, RED, extra='letter-spacing="1.5"') + "</g>")
    o.append(t(cx, oy + TH - 30, META["author"].upper(), 13, "Special Elite", 400, CREAM, extra='letter-spacing="2"'))
    return "".join(o)


def back(ox, oy):
    cx = ox + TW / 2
    o = [stars(0, 0, ox + TW, TH + 2 * BLEED, 110, 9)]
    o.append(t(cx, oy + 70, "CASE FILE", 13, "Special Elite", 400, YELLOW, extra='letter-spacing="3"'))
    o.append(t(cx, oy + 108, "Sixty murders.", 27, weight=900))
    o.append(t(cx, oy + 142, "One killer every time.", 27, weight=900))
    o.append(f'<rect x="{cx - 50}" y="{oy + 160}" width="100" height="2" fill="{YELLOW}"/>')
    para = ["Each case gives you a victim, a list of suspects",
            "and a set of clues. Cross off everyone who",
            "doesn't fit until one name is left.",
            "",
            "Sixty cases run from 10-minute warm-ups to",
            "full-evening mysteries, with every solution explained."]
    for i, ln in enumerate(para):
        o.append(t(cx, oy + 196 + i * 20, ln, 13.5, "Liberation Serif", 400))
    bullets = ["18 cross-off cases to warm up",
               "32 logic grid cases: who, where and with what",
               "10 one-liar cases: five statements, one lie",
               "Every puzzle checked to have exactly one solution",
               "Step-by-step solutions, grids and motives"]
    for i, b in enumerate(bullets):
        y = oy + 350 + i * 25
        o.append(f'<rect x="{ox + 62}" y="{y - 9}" width="8" height="8" fill="{YELLOW}"/>')
        o.append(t(ox + 80, y, b, 12.5, "Special Elite", 400, CREAM, "start"))
    o.append(t(cx, oy + 508, "For mystery lovers, puzzle fans and armchair detectives.", 12.5, weight=400, extra='font-style="italic"'))
    o.append(f'<rect x="{ox + TW - 36 - 144}" y="{oy + TH - 36 - 86}" width="144" height="86" fill="#FFFFFF"/>')
    return "".join(o)


def build():
    pages = json.loads((ROOT / "dist" / "build-info.json").read_text())["pages"]
    spine = pages * PER_PAGE * 72
    W, H = 2 * BLEED + 2 * TW + spine, 2 * BLEED + TH
    fx = BLEED + TW + spine
    bg = (f'<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1326"/>'
          f'<stop offset="1" stop-color="#16294A"/></linearGradient></defs><rect width="{W:.2f}" height="{H}" fill="url(#g)"/>')
    sp = (f'<rect x="{BLEED + TW:.2f}" y="0" width="{spine:.2f}" height="{H}" fill="{DEEP}"/>'
          f'<g transform="translate({BLEED + TW + spine / 2 - 3.6:.2f} {H / 2}) rotate(90)">'
          + t(0, 0, "WHO KILLED THE LIGHTHOUSE KEEPER?", 10.5, weight=700, extra='dominant-baseline="auto"')
          + "</g>" if pages >= 79 else "")
    sp = sp.replace('rotate(90)">', 'rotate(90)">', 1)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.2f}pt" height="{H}pt" viewBox="0 0 {W:.2f} {H}">'
           + bg + back(BLEED, BLEED) + front(fx, BLEED) + sp + "</svg>")
    dist = ROOT / "dist"
    (dist / "paperback-cover.pdf").write_bytes(cairosvg.svg2pdf(bytestring=svg.encode()))
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(dist / "paperback-cover-preview.png"), output_width=1800)
    fsvg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{TW}" height="{TH}" viewBox="{fx:.2f} {BLEED} {TW} {TH}">'
            + bg + front(fx, BLEED) + "</svg>")
    png = cairosvg.svg2png(bytestring=fsvg.encode(), output_width=1707)
    Image.open(io.BytesIO(png)).convert("RGB").save(dist / "front-cover.jpg", "JPEG", quality=93)
    print(f"cover {W / 72:.3f} x {H / 72:.3f} in, spine {spine / 72:.3f} in, {pages} pages")


if __name__ == "__main__":
    build()
