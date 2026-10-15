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

NAVY_TOP = (8, 20, 36)      # deep steel blue, top of the gradient
NAVY_BOT = (22, 54, 88)     # steel blue, bottom of the gradient
AMBER = (245, 158, 11)      # amber accent
SPINE = (12, 30, 50)
TERMINAL_GREEN = (52, 211, 153)  # text inside the cover's terminal window
CYAN = (56, 189, 248)       # sky blue: back-cover bullets
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


# The program shown on the cover, and its real output (checked by
# tests/check_cover_code.py).
COVER_CODE = [
    "def shelf(books):",
    "    for n, title in enumerate(books, 1):",
    "        print(f\"{n}. {title}\")",
    "",
    "shelf(sorted([\"Dune\", \"Emma\"]))",
]
COVER_OUTPUT = ["1. Dune", "2. Emma"]

KEYWORD = (251, 191, 36)
FUNC = (125, 211, 252)
STRING = (134, 239, 172)
PLAIN = (226, 232, 240)


def _code_tokens(line):
    """Split one line of the cover code into (text, color) pieces."""
    import re
    pieces = []
    for m in re.finditer(r'(f?"[^"]*")|(\b(?:def|for|in)\b)|(\b\w+(?=\())|(.)', line):
        text = m.group(0)
        if m.group(1):
            color = STRING
        elif m.group(2):
            color = KEYWORD
        elif m.group(3):
            color = FUNC
        else:
            color = PLAIN
        if pieces and pieces[-1][1] == color:
            pieces[-1] = (pieces[-1][0] + text, color)
        else:
            pieces.append((text, color))
    return pieces


def python_scene(img, box):
    """A code editor with a short Python program, its output in a terminal,
    and a checklist of the book's topics."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    s = w / 1600
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ex0, ey0, ex1, ey1 = x0 + 80 * s, y0 + 60 * s, x0 + 1060 * s, y1 - 30 * s
    ImageDraw.Draw(shadow).rounded_rectangle(
        [ex0 + 20 * s, ey0 + 30 * s, ex1 + 20 * s, ey1 + 30 * s], radius=int(30 * s),
        fill=(0, 0, 0, 150))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(30 * s)))
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([ex0, ey0, ex1, ey1], radius=int(30 * s), fill=(12, 28, 48, 255),
                        outline=(70, 110, 150, 255), width=max(2, int(4 * s)))
    # title bar
    for i, c in enumerate([(251, 113, 133), AMBER, TERMINAL_GREEN]):
        cx = ex0 + (50 + i * 44) * s
        d.ellipse([cx - 13 * s, ey0 + 42 * s - 13 * s, cx + 13 * s, ey0 + 42 * s + 13 * s],
                  fill=c + (255,))
    small = font(SANS_BOLD, 30 * s)
    d.text((ex0 + 200 * s, ey0 + 42 * s), "shelf.py", font=small, fill=(150, 185, 215, 255),
           anchor="lm")
    d.line([(ex0, ey0 + 84 * s), (ex1, ey0 + 84 * s)], fill=(70, 110, 150, 255),
           width=max(1, int(3 * s)))
    # code with line numbers
    mono = font(MONO, 33 * s)
    lh = 52 * s
    cy = ey0 + 110 * s
    for n, line in enumerate(COVER_CODE, 1):
        d.text((ex0 + 40 * s, cy), f"{n}", font=mono, fill=(90, 120, 150, 255))
        x = ex0 + 100 * s
        for text, color in _code_tokens(line):
            d.text((x, cy), text, font=mono, fill=color + (255,))
            x += d.textlength(text, font=mono)
        cy += lh
    # terminal strip
    ty0 = cy + 18 * s
    d.rectangle([ex0 + 4 * s, ty0, ex1 - 4 * s, ey1 - 26 * s], fill=(6, 16, 28, 255))
    d.text((ex0 + 40 * s, ty0 + 20 * s), "$ python shelf.py", font=mono,
           fill=(150, 185, 215, 255))
    oy = ty0 + 20 * s + lh
    for out in COVER_OUTPUT:
        d.text((ex0 + 40 * s, oy), out, font=mono, fill=TERMINAL_GREEN + (255,))
        oy += lh
    img.alpha_composite(layer)
    # checklist of topics
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx0, cy0, cx1, cy1 = x0 + 1120 * s, y0 + 90 * s, x0 + 1540 * s, y1 - 60 * s
    items = ["BASICS", "FUNCTIONS", "CLASSES", "TESTING", "DATA", "WEB APIs"]
    step = (cy1 - cy0) / len(items)
    f_item = font(SANS_BOLD, 32 * s)
    for i, name in enumerate(items):
        yy = cy0 + step * i + step / 2
        d.rounded_rectangle([cx0, yy - 36 * s, cx1, yy + 36 * s], radius=int(36 * s),
                            fill=(16, 38, 64, 255), outline=(70, 110, 150, 255),
                            width=max(2, int(3 * s)))
        r = 22 * s
        ccx = cx0 + 48 * s
        d.ellipse([ccx - r, yy - r, ccx + r, yy + r], fill=TERMINAL_GREEN + (255,))
        d.line([(ccx - 10 * s, yy), (ccx - 3 * s, yy + 8 * s), (ccx + 11 * s, yy - 8 * s)],
               fill=(10, 22, 40, 255), width=max(2, int(5 * s)))
        d.text((ccx + 46 * s, yy), name, font=f_item, fill=(235, 242, 250, 255), anchor="lm")
    img.alpha_composite(layer)


def draw_front(img, box, meta):
    """Draw the front cover into box=(x0, y0, x1, y1) of an RGBA image."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    s = min(w / 1600, h / 2560)  # design units are based on a 1600 x 2560 px cover
    gradient(img, box)
    python_scene(img, (x0, y0 + int(0.025 * h), x1, y0 + int(0.39 * h)))
    margin = int(130 * w / 1600)
    text_w = w - 2 * margin
    author_y = y1 - int(0.075 * h)
    # The features line sits 300 units above the author; keep the title block clear of it.
    limit = author_y - int(370 * s)
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
    feats = meta.get("cover_features")
    if feats:
        size, gap = 40 * s, 60 * s
        while True:   # shrink the line until it fits inside the margins
            ff = font(SANS_BOLD, size)
            widths = [d.textlength(t, font=ff) for t in feats]
            total = sum(widths) + gap * (len(feats) - 1)
            if total <= text_w or size < 28 * s:
                break
            size *= 0.96
            gap *= 0.96
        fx = x0 + w / 2 - total / 2
        fy = author_y - 300 * s
        for i, (t, tw) in enumerate(zip(feats, widths)):
            d.text((fx, fy), t, font=ff, fill=SOFT, anchor="lm")
            if i < len(feats) - 1:
                cx = fx + tw + gap / 2
                d.ellipse([cx - 8 * s, fy - 8 * s, cx + 8 * s, fy + 8 * s], fill=AMBER)
            fx += tw + gap
    fa = fit_font(d, meta["author"].upper(), SANS_BOLD, text_w, 80 * s)
    d.line([(x0 + w / 2 - 160 * s, author_y - 95 * s), (x0 + w / 2 + 160 * s, author_y - 95 * s)],
           fill=AMBER, width=max(2, int(4 * s)))
    d.text((x0 + w / 2, author_y), meta["author"].upper(), font=fa, fill=WHITE, anchor="mb")


def _front_text(img, x0, y0, w, h, s, margin, text_w, meta):
    """Draw bubble, title, band and tagline; return the y coordinate of the bottom of the block."""
    d = ImageDraw.Draw(img)
    ty = y0 + int(0.445 * h)
    for i, (text, accent) in enumerate(meta["cover_title"]):
        size = 250 * s if i == 0 else 190 * s
        ft = fit_font(d, text, SANS_BOLD, text_w * (1.0 if i == 0 else 0.92), size)
        d.text((x0 + w / 2, ty), text, font=ft, fill=AMBER if accent else WHITE, anchor="mt")
        ty += int(ft.size * (1.02 if i == 0 else 1.18))

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
    d.rectangle([sx0, 0, sx1, H], fill=SPINE)
    if page_count >= 100:
        spine_w = sx1 - sx0
        margin = round(0.0625 * DPI)  # keep text 0.0625 in from each spine fold
        text_h = spine_w - 2 * margin
        strip_len = H - 2 * round((BLEED + 0.4) * DPI)
        strip = Image.new("RGBA", (strip_len, spine_w), (0, 0, 0, 0))
        sd = ImageDraw.Draw(strip)
        title = meta["title"].upper()
        # Size the text from the spine width, then shrink both until the title and the author
        # fit along the spine with a clear gap between them (wide spines would otherwise overlap).
        scale, gap = 1.0, round(0.35 * DPI)
        while True:
            ft = font(SANS_BOLD, text_h * 0.62 * scale)
            fa2 = font(SANS, text_h * 0.5 * scale)
            used = sd.textlength(title, font=ft) + sd.textlength(meta["author"].upper(), font=fa2)
            if used + gap <= strip_len or scale < 0.3:
                break
            scale -= 0.02
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
