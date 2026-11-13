"""Paperback wrap cover (back, spine, front, with bleed) and the Kindle eBook cover.

The painted scene (art/cover-front.jpg) fills the front; the title and all text are
vector, set in Atkinson Hyperlegible so they stay sharp and readable at thumbnail size.
"""
import base64
import io
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "art" / "cover-front.jpg"
BACK_ART = ROOT / "manuscript" / "images" / "ill-couple-tablet.jpg"
PER_PAGE = 0.002252          # inches per page, white paper, black ink
BLEED = 9                    # points (0.125 in)
FONT = "Atkinson Hyperlegible"
NAVY, ACCENT, CREAM = "#14284B", "#B4461C", "#FBF4E8"


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size, weight=700, anchor="middle", color=NAVY, extra=""):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{FONT}" font-weight="{weight}" '
            f'font-size="{size}" fill="{color}" text-anchor="{anchor}" {extra}>{esc(s)}</text>')


def image(path, x, y, w, h, quality=90, max_px=None):
    im = Image.open(path).convert("RGB")
    if max_px and im.width > max_px:
        im = im.resize((max_px, round(im.height * max_px / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality)
    data = base64.b64encode(buf.getvalue()).decode()
    return (f'<image x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" '
            f'preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,{data}"/>')


def front(ox, oy, w, h, art_w, art_h):
    """Front cover content; (ox, oy) is the trim corner, the art fills art_w x art_h from (ox, oy - bleed)."""
    cx = ox + w / 2
    o = [image(ART, ox, oy - BLEED, art_w, art_h, max_px=3072)]
    o.append(f'<rect x="{ox + 26}" y="{oy + 24}" width="{w - 52}" height="352" rx="26" fill="{CREAM}" fill-opacity="0.9"/>')
    o.append(f'<rect x="{cx - 104}" y="{oy + 42}" width="208" height="36" rx="18" fill="{NAVY}"/>')
    o.append(text(cx, oy + 67, "LARGE PRINT", 20, 700, "middle", "#FFFFFF", 'letter-spacing="3"'))
    o.append(text(cx, oy + 152, "AI Made Easy", 74, 700))
    o.append(text(cx, oy + 222, "for Seniors", 62, 700, "middle", ACCENT))
    o.append(f'<rect x="{cx - 150}" y="{oy + 242}" width="300" height="3" fill="{NAVY}"/>')
    o.append(text(cx, oy + 276, "A Step-by-Step Guide to Asking an", 21, 700))
    o.append(text(cx, oy + 302, "AI Assistant Anything", 21, 700))
    o.append(text(cx, oy + 334, "Write Emails  \u2022  Plan Trips  \u2022  Health Questions", 16, 400, "middle", "#26324A"))
    o.append(text(cx, oy + 357, "New Hobbies  \u2022  Spot Scams  \u2022  Phone or Computer", 16, 400, "middle", "#26324A"))
    o.append(f'<rect x="{cx - 150}" y="{oy + h - 62}" width="300" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.95"/>')
    o.append(text(cx, oy + h - 35, "Aadhavan Muthurengan", 20, 700))
    return "".join(o)


def back(ox, oy, w, h):
    cx = ox + w / 2
    o = [f'<rect x="0" y="0" width="{ox + w}" height="{oy + h + BLEED}" fill="{CREAM}"/>']
    o.append(text(cx, oy + 78, "Ask an AI assistant anything,", 30, 700))
    o.append(text(cx, oy + 116, "with confidence.", 30, 700, "middle", ACCENT))
    para = [
        "AI assistants can write a warm letter, plan a gentle trip,",
        "explain a confusing bill or a word on a doctor's letter,",
        "and teach you something new, any time of day. This friendly",
        "guide shows you exactly what to type, step by step,",
        "in large, easy-to-read print.",
    ]
    for i, ln in enumerate(para):
        o.append(text(cx, oy + 160 + i * 25, ln, 17, 400, "middle", "#1E2638"))
    bullets = [
        "Set up an AI assistant on your phone, tablet or computer",
        "Write emails, cards, letters and speeches",
        "Plan trips and days out that suit your pace",
        "Prepare for doctor visits and ask health questions safely",
        "Cook, garden, learn hobbies and record family stories",
        "Spot scams, including new AI voice-cloning tricks",
        "100 ready-to-use questions and a quick reference page",
    ]
    for i, b in enumerate(bullets):
        y = oy + 312 + i * 29
        o.append(f'<circle cx="{ox + 72}" cy="{y - 6}" r="5" fill="{ACCENT}"/>')
        o.append(text(ox + 86, y, b, 16.5, 700, "start", "#1E2638"))
    o.append(f'<rect x="{ox + 64}" y="{oy + 530}" width="{w * 0.48:.1f}" height="{w * 0.48 * 0.75:.1f}" rx="12" fill="#FFFFFF"/>')
    o.append(image(BACK_ART, ox + 68, oy + 534, w * 0.48 - 8, w * 0.48 * 0.75 - 8, max_px=1400))
    o.append(text(ox + w * 0.48 + 96, oy + 560, "A perfect gift for", 17, 700, "start"))
    o.append(text(ox + w * 0.48 + 96, oy + 584, "parents and grandparents.", 17, 700, "start"))
    o.append(text(ox + w * 0.48 + 96, oy + 616, "No jargon. No fuss.", 16, 400, "start", "#1E2638"))
    o.append(text(ox + w * 0.48 + 96, oy + 640, "Just clear steps.", 16, 400, "start", "#1E2638"))
    # barcode area: KDP prints the barcode here, bottom right of the back cover
    o.append(f'<rect x="{ox + w - 44 - 144}" y="{oy + h - 44 - 86}" width="144" height="86" fill="#FFFFFF"/>')
    return "".join(o)


def build_paperback_cover(meta, pages, out_pdf, preview_png):
    tw, th = meta["trim"]["width_in"] * 72, meta["trim"]["height_in"] * 72
    spine = pages * PER_PAGE * 72
    W, H = 2 * BLEED + 2 * tw + spine, 2 * BLEED + th
    fx = BLEED + tw + spine
    sp = [f'<rect x="{BLEED + tw:.2f}" y="0" width="{spine:.2f}" height="{H}" fill="{NAVY}"/>']
    if pages >= 79:
        # The text reads top to bottom, with the tops of the letters toward the front cover.
        # Atkinson Hyperlegible Bold reaches 0.728 em above the baseline and 0.161 em below it.
        # KDP wants 0.0625 in (4.5 pt) clear on each side of spine text, so size the text to
        # fit and centre its ink (not its baseline) on the spine.
        size = min(13, (spine - 2 * 5.5) / (0.728 + 0.161))
        baseline = BLEED + tw + spine / 2 - size * (0.728 - 0.161) / 2
        sp.append(f'<g transform="translate({baseline:.2f} {H / 2}) rotate(90)">'
                  + text(0, 0, f"AI Made Easy for Seniors    •    {meta['author']}", round(size, 2), 700,
                         "middle", "#FFFFFF")
                  + "</g>")
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.2f}pt" height="{H}pt" viewBox="0 0 {W:.2f} {H}">'
           + back(BLEED, BLEED, tw, th) + "".join(sp)
           + front(fx, BLEED, tw, th, tw + BLEED, th + 2 * BLEED) + "</svg>")
    Path(out_pdf).write_bytes(cairosvg.svg2pdf(bytestring=svg.encode()))
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(preview_png), output_width=1800)
    return {"spine_in": spine / 72, "full_w_in": W / 72, "full_h_in": H / 72}


def build_ebook_cover(meta, out_jpg):
    tw, th = meta["trim"]["width_in"] * 72, meta["trim"]["height_in"] * 72
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{tw}" height="{th}" viewBox="0 0 {tw} {th}">'
           + front(0, 0, tw, th, tw, th + BLEED) + "</svg>")
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=1978)   # 1978 x 2560 px
    Image.open(io.BytesIO(png)).convert("RGB").save(out_jpg, "JPEG", quality=92)
