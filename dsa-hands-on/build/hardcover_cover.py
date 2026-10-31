"""Build the hardcover (case laminate) wrap cover, from KDP's cover calculator.

Usage: python build/hardcover_cover.py [font_dir] [mono_font] [--white]
Measurements are for 406 pages, white paper, 6 x 9 in. Rerun with new numbers
from the calculator if the page count changes.
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas

import covers
from covers import AMBER, CYAN, DPI, SOFT, SPINE, WHITE, font, wrap

ROOT = Path(__file__).resolve().parent.parent
FULL_W, FULL_H = 14.678, 10.417
FRONT_W, FRONT_H = 6.197, 9.236  # back and front panels, each including its hinge
WRAP, HINGE, SPINE_W = 0.591, 0.394, 1.103
SPINE_MARGIN = 0.0625
BARCODE_X, BARCODE_Y = 0.25, 0.375  # margins from the hinge and the bottom fold


def px(inches):
    return round(inches * DPI)


def use_white_theme():
    """Same palette as tools/white_covers.py, with a darker accent for print."""
    global AMBER, SOFT, SPINE, WHITE
    covers.NAVY_TOP = (255, 255, 255)
    covers.NAVY_BOT = (238, 242, 247)
    covers.WHITE = WHITE = (17, 24, 39)
    covers.SOFT = SOFT = (71, 85, 105)
    covers.AMBER = AMBER = (194, 84, 0)
    SPINE = (226, 232, 240)


def build(meta, out_pdf, out_png):
    W, H = px(FULL_W), px(FULL_H)
    img = Image.new("RGBA", (W, H))
    covers.gradient(img, (0, 0, W, H))
    top, bottom = WRAP, WRAP + FRONT_H
    back_x0, back_x1 = WRAP, WRAP + FRONT_W - HINGE
    spine_x0 = WRAP + FRONT_W
    spine_x1 = spine_x0 + SPINE_W
    front_x0, front_x1 = spine_x1 + HINGE, spine_x1 + FRONT_W

    # The whole wrap shares one gradient, so draw_front must not paint its own.
    gradient, covers.gradient = covers.gradient, lambda *a: None
    covers.draw_front(img, (px(front_x0), px(top), px(front_x1), px(bottom)), meta)
    covers.gradient = gradient

    d = ImageDraw.Draw(img)
    safe = px(0.45)
    bx0, bx1 = px(back_x0) + safe, px(back_x1) - safe
    by = px(top + 0.7)
    blurb = meta["back_cover_blurb"]
    fh = font(covers.SANS_BOLD, 0.27 * DPI)
    for line in wrap(d, blurb[0], fh, bx1 - bx0):
        d.text((bx0, by), line, font=fh, fill=AMBER)
        by += int(fh.size * 1.3)
    by += px(0.12)
    fbody = font(covers.SANS, 0.15 * DPI)
    for para in blurb[1:]:
        for line in wrap(d, para, fbody, bx1 - bx0):
            d.text((bx0, by), line, font=fbody, fill=SOFT)
            by += int(fbody.size * 1.4)
        by += px(0.1)
    by += px(0.1)
    fa = font(covers.SERIF_ITALIC, 0.145 * DPI)
    for line in wrap(d, meta["author_short_bio"], fa, bx1 - bx0):
        d.text((bx0, by), line, font=fa, fill=SOFT)
        by += int(fa.size * 1.4)

    bc_x1 = px(back_x1 - BARCODE_X)
    bc_y1 = px(bottom - BARCODE_Y)
    bc_w, bc_h = px(2.0), px(1.2)
    d.rectangle([bc_x1 - bc_w, bc_y1 - bc_h, bc_x1, bc_y1], fill=(255, 255, 255))
    if by > bc_y1 - bc_h - px(0.1):
        raise RuntimeError("Back cover text overlaps the barcode area")

    sx0, sx1 = px(spine_x0), px(spine_x1)
    d.rectangle([sx0, 0, sx1, H], fill=SPINE)
    spine_w = sx1 - sx0
    text_h = spine_w - 2 * px(SPINE_MARGIN)
    strip_len = px(FRONT_H - 0.9)
    strip = Image.new("RGBA", (strip_len, spine_w), (0, 0, 0, 0))
    sd = ImageDraw.Draw(strip)
    title = meta["title"].upper()
    scale = 0.5
    while True:
        ft = font(covers.SANS_BOLD, text_h * 0.5 * scale * 2)
        fa2 = font(covers.SANS, text_h * 0.36 * scale * 2)
        used = sd.textlength(title, font=ft) + sd.textlength(
            meta["author"].upper(), font=fa2
        )
        if used + px(0.45) <= strip_len:
            break
        scale -= 0.01
    sd.text((0, spine_w / 2), title, font=ft, fill=WHITE, anchor="lm")
    sd.text(
        (strip_len, spine_w / 2),
        meta["author"].upper(),
        font=fa2,
        fill=AMBER,
        anchor="rm",
    )
    img.alpha_composite(strip.rotate(-90, expand=True), (sx0, px(top + 0.45)))

    rgb = img.convert("RGB")
    rgb.save(out_png, "PNG", dpi=(DPI, DPI))
    tmp = str(out_pdf) + ".tmp.jpg"
    rgb.save(tmp, "JPEG", quality=95, dpi=(DPI, DPI))
    pdfmetrics.registerFont(TTFont("CoverSans", covers.SANS))
    c = rl_canvas.Canvas(
        str(out_pdf),
        pagesize=(FULL_W * inch, FULL_H * inch),
        initialFontName="CoverSans",
    )
    c.setTitle(f"{meta['title']} - Hardcover Cover")
    c.setAuthor(meta["author"])
    c.drawImage(tmp, 0, 0, width=FULL_W * inch, height=FULL_H * inch)
    c.showPage()
    c.save()
    os.remove(tmp)


if __name__ == "__main__":
    white = "--white" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--white"]
    if args:
        d = args[0]
        covers.SANS_BOLD = f"{d}/LiberationSans-Bold.ttf"
        covers.SANS = f"{d}/LiberationSans-Regular.ttf"
        covers.SERIF_ITALIC = f"{d}/LiberationSerif-Italic.ttf"
        covers.MONO = args[1]
    if white:
        use_white_theme()
    suffix = "-white" if white else ""
    meta = json.loads((ROOT / "book.json").read_text(encoding="utf-8"))
    build(
        meta,
        ROOT / "dist" / f"hardcover-cover{suffix}.pdf",
        ROOT / "dist" / f"hardcover-cover{suffix}-preview.png",
    )
