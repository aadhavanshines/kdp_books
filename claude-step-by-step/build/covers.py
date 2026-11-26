"""Kindle cover (JPG) and paperback wrap (PDF) in the AI Skillup 2026 series style.

Textless art (build/cover-art.png, made with GPT Image) fills the top of the
front; every word is typeset here so the cover always matches the KDP listing.
Same layout grid as the rest of the series (covers2026/front.py and wrap.py).
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = str(ROOT / "fonts" / "Inter.ttf")
ART = Path(__file__).resolve().parent / "cover-art.png"
AUTHOR = "AADHAVAN MUTHURENGAN"
ACCENT = (15, 118, 110)          # #0F766E teal
TITLE = [("CLAUDE AI", 1), ("STEP BY STEP", 0)]
SUB = "50 Real Workflows, No Coding Needed"
WHITE, INK, SLATE = (255, 255, 255), (17, 24, 39), (71, 85, 105)
DPI, BLEED = 300, 0.125
PER_PAGE = {"white": 0.002252, "cream": 0.0025}


def font(size, weight):
    f = ImageFont.truetype(FONT, max(1, round(size)))
    f.set_variation_by_axes([32 if size > 40 else 14, weight])
    return f


def tracked(d, x, y, text, f, fill, track, align="center"):
    widths = [d.textlength(c, font=f) for c in text]
    total = sum(widths) + track * (len(text) - 1)
    if align == "center":
        x -= total / 2
    elif align == "right":
        x -= total
    for c, w in zip(text, widths):
        d.text((x, y), c, font=f, fill=fill)
        x += w + track
    return total


def wrap(d, text, f, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def render_front(W, H, inset=(0, 0, 0, 0)):
    art = Image.open(ART).convert("RGB")
    img = Image.new("RGB", (W, H), WHITE)
    il, it, ir, ib = inset
    vw, vh = W - il - ir, H - it - ib
    s = vw / 1600
    hs = vh / s
    X = lambda u: il + u * s  # noqa: E731
    Y = lambda u: it + u * s  # noqa: E731
    d = ImageDraw.Draw(img)

    size_u = min(1300, hs - 1260)
    size = round(size_u * s)
    a = art.resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size, size), 0)
    edge = round(90 * s)
    ImageDraw.Draw(m).rectangle([edge, edge, size - edge, size - edge], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(40 * s))
    art_top = 210 if hs >= 2500 else 190
    img.paste(a, (round(X(800) - size / 2), round(Y(art_top))), m)

    d.rectangle([0, 0, W, round(Y(46))], fill=ACCENT)
    tracked(d, X(110), Y(118), "AI SKILLUP", font(40 * s, 700), ACCENT, 9 * s, "left")
    tracked(d, X(1490), Y(120), "2026 EDITION", font(36 * s, 600), SLATE, 7 * s, "right")

    size_t = 200
    while size_t > 90 and max(d.textlength(t, font=font(size_t * s, 860)) for t, _ in TITLE) > 1400 * s:
        size_t -= 4
    ya = hs - 208
    while size_t > 90:
        n_sub = len(wrap(d, SUB, font(60 * s, 450), 1280 * s))
        if art_top + size_u + 40 + size_t * 1.08 * len(TITLE) + 50 + 78 * n_sub <= ya - 80:
            break
        size_t -= 4
    f_t = font(size_t * s, 860)
    y = art_top + size_u + 40
    for t, hl in TITLE:
        d.text((X(800), Y(y)), t, font=f_t, fill=ACCENT if hl else INK, anchor="mt")
        y += size_t * 1.08
    y += 50
    f_s = font(60 * s, 450)
    for line in wrap(d, SUB, f_s, 1280 * s):
        d.text((X(800), Y(y)), line, font=f_s, fill=SLATE, anchor="mt")
        y += 78
    d.line([(X(730), Y(ya - 40)), (X(870), Y(ya - 40))], fill=ACCENT, width=max(2, round(5 * s)))
    tracked(d, X(800), Y(ya), AUTHOR, font(52 * s, 650), INK, 8 * s)
    return img


def build_ebook_cover(meta, out_jpg):
    img = render_front(1600, 2560)
    img.save(out_jpg, "JPEG", quality=94, dpi=(300, 300))
    # Bordered Kindle upload: a 4 px slate edge keeps the white cover from melting into
    # Amazon's white page (same as the other 2026 covers).
    ImageDraw.Draw(img).rectangle([0, 0, img.width - 1, img.height - 1], outline=(156, 162, 174), width=4)
    img.save(Path(out_jpg).with_name("ebook-cover-bordered.jpg"), "JPEG", quality=94, dpi=(300, 300))


def draw_back(d, meta, bl, trim_w, k):
    bx0 = bl + round(0.55 * DPI)
    bx1 = bl + round((trim_w - 0.55) * DPI)
    tw = bx1 - bx0
    y = bl + round(0.75 * DPI)
    tracked(d, bx0, y, "AI SKILLUP", font(0.13 * DPI, 700), ACCENT, 0.03 * DPI, "left")
    y += round(0.42 * DPI)
    blurb = meta["back_cover_blurb"]
    f_h = font(0.3 * k * DPI, 800)
    for line in wrap(d, blurb[0], f_h, tw):
        d.text((bx0, y), line, font=f_h, fill=INK)
        y += round(f_h.size * 1.22)
    y += round(0.16 * DPI)
    f_b = font(0.158 * k * DPI, 400)
    for para in blurb[1:]:
        if para.startswith("- "):
            r = 0.03 * DPI
            d.ellipse([bx0, y + 0.07 * DPI - r, bx0 + 2 * r, y + 0.07 * DPI + r], fill=ACCENT)
            for line in wrap(d, para[2:], f_b, tw - 0.22 * DPI):
                d.text((bx0 + 0.2 * DPI, y), line, font=f_b, fill=INK)
                y += round(f_b.size * 1.42)
            y += round(0.04 * DPI)
        else:
            for line in wrap(d, para, f_b, tw):
                d.text((bx0, y), line, font=f_b, fill=SLATE)
                y += round(f_b.size * 1.45)
            y += round(0.12 * DPI)
    y += round(0.08 * DPI)
    d.line([(bx0, y), (bx0 + 0.6 * DPI, y)], fill=ACCENT, width=4)
    y += round(0.14 * DPI)
    f_bio = font(0.135 * k * DPI, 400)
    for line in wrap(d, meta["author_short_bio"], f_bio, tw):
        d.text((bx0, y), line, font=f_bio, fill=SLATE)
        y += round(f_bio.size * 1.45)
    return y


def build_paperback_cover(meta, pages, out_pdf, preview_png):
    trim_w, trim_h = meta["trim"]["width_in"], meta["trim"]["height_in"]
    spine_in = pages * PER_PAGE[meta.get("paper", "white")]
    full_w = BLEED + trim_w + spine_in + trim_w + BLEED
    full_h = BLEED + trim_h + BLEED
    W, H = round(full_w * DPI), round(full_h * DPI)
    img = Image.new("RGB", (W, H), WHITE)
    fx0 = round((BLEED + trim_w + spine_in) * DPI)
    bl = round(BLEED * DPI)
    img.paste(render_front(W - fx0, H, inset=(0, bl, bl, bl)), (fx0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, bl + round(46 * (trim_w * DPI) / 1600)], fill=ACCENT)

    bc_w, bc_h = round(2.0 * DPI), round(1.2 * DPI)
    bc_x1 = bl + round((trim_w - 0.25) * DPI)
    bc_y1 = H - bl - round(0.25 * DPI)
    k = 1.0
    while k > 0.6 and draw_back(ImageDraw.Draw(img.copy()), meta, bl, trim_w, k) > bc_y1 - bc_h - 0.15 * DPI:
        k -= 0.03
    y = draw_back(d, meta, bl, trim_w, k)
    if y > bc_y1 - bc_h - 0.1 * DPI:
        raise RuntimeError("back cover text runs into the barcode area")
    d.rectangle([bc_x1 - bc_w, bc_y1 - bc_h, bc_x1, bc_y1], fill=WHITE, outline=(226, 232, 240))

    # spine (text only at 100+ pages)
    sx0, sx1 = round((BLEED + trim_w) * DPI), fx0
    if pages >= 100:
        sw = sx1 - sx0
        th = sw - 2 * round(0.0625 * DPI)
        strip_len = H - 2 * round((BLEED + 0.4) * DPI)
        strip = Image.new("RGBA", (strip_len, sw), (0, 0, 0, 0))
        sd = ImageDraw.Draw(strip)
        title = meta["title"].upper()
        sc = 1.0
        while True:
            ft, fa = font(th * 0.58 * sc, 820), font(th * 0.42 * sc, 600)
            if sd.textlength(title, font=ft) + sd.textlength("AADHAVAN", font=fa) + 0.4 * DPI <= strip_len or sc < 0.3:
                break
            sc -= 0.02
        sd.text((0, sw / 2), title, font=ft, fill=INK, anchor="lm")
        sd.text((strip_len, sw / 2), "AADHAVAN", font=fa, fill=ACCENT, anchor="rm")
        rot = strip.rotate(-90, expand=True)
        img.paste(rot, (sx0, round((BLEED + 0.4) * DPI)), rot)

    img.save(out_pdf, resolution=DPI)
    img.resize((W // 4, H // 4)).save(preview_png)
    return {"spine_in": spine_in, "full_w_in": full_w, "full_h_in": full_h}
