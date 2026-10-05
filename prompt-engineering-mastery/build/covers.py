"""Generate the Kindle eBook cover (JPG) and the paperback full-wrap cover (PDF)."""
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas as rl_canvas

FONT_DIR = "/usr/share/fonts/truetype"
SANS_BOLD = f"{FONT_DIR}/liberation/LiberationSans-Bold.ttf"
SANS = f"{FONT_DIR}/liberation/LiberationSans-Regular.ttf"
SERIF_ITALIC = f"{FONT_DIR}/liberation/LiberationSerif-Italic.ttf"
MONO = f"{FONT_DIR}/dejavu/DejaVuSansMono.ttf"

NAVY_TOP = (9, 20, 41)
NAVY_BOT = (27, 55, 92)
AMBER = (242, 169, 59)
CYAN = (94, 200, 229)
WHITE = (255, 255, 255)
SOFT = (196, 210, 228)

DPI = 300
# KDP spine width per page for black-and-white interior.
SPINE_PER_PAGE = {"white": 0.002252, "cream": 0.0025}
BLEED = 0.125


def font(path, size):
    return ImageFont.truetype(path, int(size))


def fit_font(draw, text, path, max_w, start):
    size = start
    while size > 8:
        f = font(path, size)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 2
    return font(path, size)


def wrap(draw, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if draw.textlength(trial, font=f) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def balanced_wrap(draw, text, f, max_w):
    """Wrap into the fewest lines, then narrow the width so lines are even (no lone last word)."""
    lines = wrap(draw, text, f, max_w)
    lo, hi = 0.0, max_w
    while hi - lo > 1:
        mid = (lo + hi) / 2
        trial = wrap(draw, text, f, mid)
        if len(trial) == len(lines) and all(draw.textlength(l, font=f) <= mid for l in trial):
            hi = mid
        else:
            lo = mid
    return wrap(draw, text, f, hi)


def gradient(img, box):
    x0, y0, x1, y1 = box
    d = ImageDraw.Draw(img)
    h = y1 - y0
    for i in range(h):
        t = i / max(h - 1, 1)
        c = tuple(int(NAVY_TOP[k] + (NAVY_BOT[k] - NAVY_TOP[k]) * t) for k in range(3))
        d.line([(x0, y0 + i), (x1, y0 + i)], fill=c)


def network(img, box, seed=7):
    """Abstract neural-network constellation in the given region."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    rnd = random.Random(seed)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    nodes = [(x0 + rnd.random() * w, y0 + rnd.random() * h) for _ in range(46)]
    scale = w / 1600
    for i, a in enumerate(nodes):
        for b in nodes[i + 1:]:
            dist = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
            if dist < 330 * scale:
                alpha = int(150 * (1 - dist / (330 * scale)))
                d.line([a, b], fill=CYAN + (alpha,), width=max(1, int(2 * scale)))
    for (x, y) in nodes:
        r = (4 + rnd.random() * 7) * scale
        col = AMBER if rnd.random() < 0.22 else CYAN
        d.ellipse([x - r, y - r, x + r, y + r], fill=col + (235,))
    glow = layer.filter(ImageFilter.GaussianBlur(6 * scale))
    img.alpha_composite(glow)
    img.alpha_composite(layer)


def draw_front(img, box, meta):
    """Draw the front cover into box=(x0, y0, x1, y1) of an RGBA image."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    s = min(w / 1600, h / 2560)  # design units are based on a 1600 x 2560 px cover
    gradient(img, box)
    network(img, (x0, y0 + int(0.03 * h), x1, y0 + int(0.36 * h)))
    margin = int(130 * w / 1600)
    text_w = w - 2 * margin
    author_y = y1 - int(0.075 * h)
    limit = author_y - int(150 * s)
    # Shrink the stacked title block until it clears the author line.
    k = 1.0
    while k > 0.6:
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        bottom = _front_text(layer, x0, y0, w, h, s * k, margin, text_w, meta)
        if bottom <= limit:
            break
        k -= 0.03
    img.alpha_composite(layer)
    d = ImageDraw.Draw(img)
    fa = fit_font(d, meta["author"].upper(), SANS_BOLD, text_w, 80 * s)
    d.line([(x0 + w / 2 - 160 * s, author_y - 95 * s), (x0 + w / 2 + 160 * s, author_y - 95 * s)],
           fill=AMBER, width=max(2, int(4 * s)))
    d.text((x0 + w / 2, author_y), meta["author"].upper(), font=fa, fill=WHITE, anchor="mb")


def _front_text(img, x0, y0, w, h, s, margin, text_w, meta):
    """Draw bubble, title, band and tagline; return the y coordinate of the bottom of the block."""
    d = ImageDraw.Draw(img)
    by = y0 + int(0.355 * h)
    bh = int(118 * s)
    d.rounded_rectangle([x0 + margin, by, x0 + w - margin, by + bh], radius=int(26 * s),
                        fill=(13, 30, 58, 255), outline=CYAN, width=max(2, int(4 * s)))
    mono = font(MONO, 50 * s)
    d.text((x0 + margin + int(36 * s), by + bh / 2), "> Write a better prompt_", font=mono,
           fill=AMBER, anchor="lm")

    ty = by + bh + int(70 * s)
    f1 = fit_font(d, "PROMPT", SANS_BOLD, text_w, 300 * s)
    d.text((x0 + w / 2, ty), "PROMPT", font=f1, fill=WHITE, anchor="mt")
    ty += int(f1.size * 0.98)
    f2 = fit_font(d, "ENGINEERING", SANS_BOLD, text_w, 220 * s)
    d.text((x0 + w / 2, ty), "ENGINEERING", font=f2, fill=WHITE, anchor="mt")
    ty += int(f2.size * 1.0)
    f3 = fit_font(d, "MASTERY", SANS_BOLD, text_w * 0.8, 230 * s)
    d.text((x0 + w / 2, ty), "MASTERY", font=f3, fill=AMBER, anchor="mt")
    ty += int(f3.size * 1.15)

    band = meta["short_subtitle"].upper()
    fb = font(SANS_BOLD, 54 * s)
    bw = d.textlength(band, font=fb) + 80 * s
    d.rectangle([x0 + w / 2 - bw / 2, ty, x0 + w / 2 + bw / 2, ty + 92 * s], fill=AMBER)
    d.text((x0 + w / 2, ty + 46 * s), band, font=fb, fill=NAVY_TOP, anchor="mm")
    ty += int(92 * s + 60 * s)

    ft = font(SERIF_ITALIC, 58 * s)
    for line in balanced_wrap(d, meta["cover_tagline"], ft, text_w * 0.95):
        d.text((x0 + w / 2, ty), line, font=ft, fill=SOFT, anchor="mt")
        ty += int(ft.size * 1.25)
    return ty


def build_ebook_cover(meta, out_jpg):
    # KDP recommends 1600 x 2560 px (1:1.6) for eBook covers.
    img = Image.new("RGBA", (1600, 2560))
    draw_front(img, (0, 0, 1600, 2560), meta)
    img.convert("RGB").save(out_jpg, "JPEG", quality=92, dpi=(300, 300))


def build_paperback_cover(meta, page_count, out_pdf, out_png=None):
    trim_w, trim_h = meta["trim"]["width_in"], meta["trim"]["height_in"]
    spine_in = page_count * SPINE_PER_PAGE[meta.get("paper", "white")]
    full_w = BLEED + trim_w + spine_in + trim_w + BLEED
    full_h = BLEED + trim_h + BLEED
    W, H = round(full_w * DPI), round(full_h * DPI)
    img = Image.new("RGBA", (W, H))
    gradient(img, (0, 0, W, H))

    # Front panel: from spine edge to right bleed edge.
    front_x0 = round((BLEED + trim_w + spine_in) * DPI)
    draw_front(img, (front_x0, 0, W, H), meta)

    d = ImageDraw.Draw(img)
    # Back panel
    back_x0 = round(BLEED * DPI)
    back_x1 = round((BLEED + trim_w) * DPI)
    safe = round(0.5 * DPI)
    bx0, bx1 = back_x0 + safe, back_x1 - safe
    by = round((BLEED + 0.75) * DPI)
    blurb = meta["back_cover_blurb"]
    fh = font(SANS_BOLD, 0.27 * DPI)
    for line in wrap(d, blurb[0], fh, bx1 - bx0):
        d.text((bx0, by), line, font=fh, fill=AMBER)
        by += int(fh.size * 1.3)
    by += int(0.12 * DPI)
    fbody = font(SANS, 0.15 * DPI)
    fbul = font(SANS, 0.145 * DPI)
    for para in blurb[1:]:
        if para.startswith("- "):
            lines = wrap(d, para[2:], fbul, bx1 - bx0 - 0.25 * DPI)
            d.ellipse([bx0 + 0.04 * DPI, by + 0.06 * DPI, bx0 + 0.11 * DPI, by + 0.13 * DPI], fill=CYAN)
            for line in lines:
                d.text((bx0 + 0.22 * DPI, by), line, font=fbul, fill=WHITE)
                by += int(fbul.size * 1.35)
            by += int(0.03 * DPI)
        else:
            for line in wrap(d, para, fbody, bx1 - bx0):
                d.text((bx0, by), line, font=fbody, fill=SOFT)
                by += int(fbody.size * 1.4)
            by += int(0.1 * DPI)
    # About the author line
    by += int(0.1 * DPI)
    fa = font(SERIF_ITALIC, 0.145 * DPI)
    for line in wrap(d, meta["author_short_bio"], fa, bx1 - bx0):
        d.text((bx0, by), line, font=fa, fill=SOFT)
        by += int(fa.size * 1.4)

    # Barcode area: KDP places the barcode in a 2 x 1.2 in box at the bottom right of the back cover.
    bc_w, bc_h = round(2.0 * DPI), round(1.2 * DPI)
    bc_x1 = back_x1 - round(0.25 * DPI)
    bc_y1 = H - round((BLEED + 0.25) * DPI)
    d.rectangle([bc_x1 - bc_w, bc_y1 - bc_h, bc_x1, bc_y1], fill=WHITE)
    if by > bc_y1 - bc_h - 0.1 * DPI:
        raise RuntimeError("Back cover text overlaps barcode area; shorten the blurb.")

    # Spine (KDP allows spine text only for books with more than 79 pages; 100+ recommended).
    sx0 = round((BLEED + trim_w) * DPI)
    sx1 = round((BLEED + trim_w + spine_in) * DPI)
    d.rectangle([sx0, 0, sx1, H], fill=(13, 30, 58))
    if page_count >= 100:
        spine_w = sx1 - sx0
        margin = round(0.0625 * DPI)  # keep text 0.0625 in from each spine fold
        text_h = spine_w - 2 * margin
        strip_len = H - 2 * round((BLEED + 0.4) * DPI)
        strip = Image.new("RGBA", (strip_len, spine_w), (0, 0, 0, 0))
        sd = ImageDraw.Draw(strip)
        ft = font(SANS_BOLD, text_h * 0.62)
        fa2 = font(SANS, text_h * 0.5)
        title = meta["title"].upper()
        sd.text((0, spine_w / 2), title, font=ft, fill=WHITE, anchor="lm")
        sd.text((strip_len, spine_w / 2), meta["author"].upper(), font=fa2, fill=AMBER, anchor="rm")
        # Spine text reads top-to-bottom (rotate 270 degrees).
        rotated = strip.rotate(-90, expand=True)
        img.alpha_composite(rotated, (sx0, round((BLEED + 0.4) * DPI)))

    rgb = img.convert("RGB")
    if out_png:
        rgb.save(out_png, "PNG", dpi=(DPI, DPI))
    tmp = str(out_pdf) + ".tmp.jpg"
    rgb.save(tmp, "JPEG", quality=95, dpi=(DPI, DPI))
    # Use an embedded TrueType font as the canvas default so the PDF has no unembedded fonts.
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    pdfmetrics.registerFont(TTFont("CoverSans", SANS))
    c = rl_canvas.Canvas(str(out_pdf), pagesize=(full_w * inch, full_h * inch),
                         initialFontName="CoverSans")
    c.setTitle(f"{meta['title']} - Paperback Cover")
    c.setAuthor(meta["author"])
    c.drawImage(tmp, 0, 0, width=full_w * inch, height=full_h * inch)
    c.showPage()
    c.save()
    os.remove(tmp)
    return {"spine_in": spine_in, "full_w_in": full_w, "full_h_in": full_h, "px": (W, H)}
