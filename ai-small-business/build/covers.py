"""Paperback wrap cover (back, spine, front, with bleed) and the Kindle eBook cover.

All vector: cream background, Playfair Display title, orange accent, simple line icons
for the four kinds of work the book covers. No third-party logos.
"""
import io
from pathlib import Path

import cairosvg
from PIL import Image

PER_PAGE = 0.002252          # inches per page, white paper, black ink
BLEED = 9                    # points (0.125 in)
SERIF, SANS = "Playfair Display", "Liberation Sans"
INK, ORANGE, CREAM, PAPER, MUTED = "#1F1B16", "#D2581E", "#F6EFE2", "#FFFDF8", "#4A4239"


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size, weight=700, anchor="middle", color=INK, family=SANS, extra=""):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-weight="{weight}" '
            f'font-size="{size}" fill="{color}" text-anchor="{anchor}" {extra}>{esc(s)}</text>')


def icon(kind, cx, cy, s=1.0):
    """A 44 x 44 line icon centred on (cx, cy)."""
    st = f'fill="none" stroke="{INK}" stroke-width="{2.6 * s:.2f}" stroke-linecap="round" stroke-linejoin="round"'
    g = f'<g transform="translate({cx - 22 * s:.2f} {cy - 22 * s:.2f}) scale({s})">'
    if kind == "email":
        g += f'<rect x="4" y="10" width="36" height="25" rx="3" {st}/><path d="M5 12 L22 25 L39 12" {st}/>'
    elif kind == "marketing":
        g += (f'<path d="M6 18 L6 27 L12 27 L30 36 L30 9 L12 18 Z" {st}/>'
              f'<path d="M12 27 L15 37" {st}/><path d="M35 15 Q40 22.5 35 30" {st}/>')
    elif kind == "admin":
        g += (f'<rect x="9" y="7" width="26" height="32" rx="3" {st}/><rect x="16" y="4" width="12" height="6" rx="2" {st}/>'
              f'<path d="M14 19 L17 22 L22 16" {st}/><path d="M25 19 L30 19" {st}/>'
              f'<path d="M14 29 L17 32 L22 26" {st}/><path d="M25 29 L30 29" {st}/>')
    elif kind == "service":
        g += (f'<path d="M6 9 H38 a3 3 0 0 1 3 3 V28 a3 3 0 0 1 -3 3 H20 L11 38 V31 H6 a3 3 0 0 1 -3 -3 V12 a3 3 0 0 1 3 -3 Z" {st}/>'
              f'<circle cx="14" cy="20" r="1.6" fill="{INK}"/><circle cx="22" cy="20" r="1.6" fill="{INK}"/>'
              f'<circle cx="30" cy="20" r="1.6" fill="{INK}"/>')
    return g + "</g>"


def front(ox, oy, w, h):
    cx = ox + w / 2
    o = [f'<rect x="{ox}" y="{oy - BLEED}" width="{w + BLEED}" height="{h + 2 * BLEED}" fill="{CREAM}"/>']
    # top band
    o.append(f'<rect x="{ox}" y="{oy - BLEED}" width="{w + BLEED}" height="{BLEED + 10}" fill="{ORANGE}"/>')
    o.append(text(cx, oy + 50, "THE NEXT STEP AFTER THE BASICS", 11.5, 700, color=MUTED, extra='letter-spacing="2.6"'))
    o.append(text(cx, oy + 128, "Claude AI", 80, 900, color=INK, family=SERIF))
    o.append(text(cx, oy + 180, "for Small Business", 43, 700, color=ORANGE, family=SERIF))
    o.append(f'<rect x="{cx - 60}" y="{oy + 200}" width="120" height="3.5" fill="{INK}"/>')
    o.append(text(cx, oy + 232, "100 Ready-to-Use Workflows to Automate", 16.5, 700))
    o.append(text(cx, oy + 254, "Emails, Marketing, Admin and Customer Service", 16.5, 700))
    # four tiles
    tiles = [("email", "Emails"), ("marketing", "Marketing"), ("admin", "Admin"), ("service", "Customer Service")]
    tw_, th_, gap = 84, 92, 12
    x0 = cx - (4 * tw_ + 3 * gap) / 2
    ty = oy + 284
    for i, (k, label) in enumerate(tiles):
        x = x0 + i * (tw_ + gap)
        o.append(f'<rect x="{x:.1f}" y="{ty}" width="{tw_}" height="{th_}" rx="12" fill="{PAPER}" stroke="#E2D6C2" stroke-width="1.2"/>')
        o.append(icon(k, x + tw_ / 2, ty + 38, 1.0))
        if label == "Customer Service":
            o.append(text(x + tw_ / 2, ty + 72, "Customer", 11.5, 700))
            o.append(text(x + tw_ / 2, ty + 85, "Service", 11.5, 700))
        else:
            o.append(text(x + tw_ / 2, ty + 78, label, 11.5, 700))
    # big badge
    by = oy + 470
    o.append(f'<circle cx="{cx}" cy="{by}" r="62" fill="{ORANGE}"/>')
    o.append(f'<circle cx="{cx}" cy="{by}" r="55" fill="none" stroke="{CREAM}" stroke-width="1.4" stroke-dasharray="3 4"/>')
    o.append(text(cx, by + 6, "100", 50, 900, color=CREAM, family=SERIF))
    o.append(text(cx, by + 28, "WORKFLOWS", 10.5, 700, color=CREAM, extra='letter-spacing="1.6"'))
    # side notes beside the badge
    o.append(text(cx - 82, by - 12, "Copy-paste", 13.5, 700, "end"))
    o.append(text(cx - 82, by + 6, "prompts", 13.5, 700, "end"))
    o.append(text(cx - 82, by + 24, "+ examples", 13.5, 400, "end", MUTED))
    o.append(text(cx + 82, by - 12, "Time-saved", 13.5, 700, "start"))
    o.append(text(cx + 82, by + 6, "notes", 13.5, 700, "start"))
    o.append(text(cx + 82, by + 24, "+ templates", 13.5, 400, "start", MUTED))
    # pill
    o.append(f'<rect x="{cx - 92}" y="{oy + 552}" width="184" height="30" rx="15" fill="{INK}"/>')
    o.append(text(cx, oy + 572, "NO CODING NEEDED", 13, 700, color=CREAM, extra='letter-spacing="2"'))
    o.append(text(cx, oy + h - 30, "AADHAVAN MUTHURENGAN", 15, 700, extra='letter-spacing="2.4"'))
    return "".join(o)


def back(ox, oy, w, h):
    cx = ox + w / 2
    left = ox + 54
    o = [f'<rect x="0" y="0" width="{ox + w}" height="{oy + h + BLEED}" fill="{CREAM}"/>']
    o.append(f'<rect x="0" y="0" width="{ox + w}" height="{BLEED + 10}" fill="{ORANGE}"/>')
    o.append(text(cx, oy + 62, "Get your evenings back.", 30, 900, family=SERIF))
    para = [
        "You already know an AI assistant can write. This book shows",
        "you exactly what to ask it for the jobs that eat your week:",
        "the emails, the posts, the quotes, the rota, the receipts and",
        "the reply to the customer who is not happy.",
    ]
    for i, ln in enumerate(para):
        o.append(text(cx, oy + 98 + i * 19, ln, 13, 400, color=MUTED))
    o.append(text(left, oy + 188, "INSIDE", 11.5, 700, "start", ORANGE, extra='letter-spacing="2"'))
    bullets = [
        ["100 workflows for marketing, social media,", "sales emails, customer service, admin,",
         "bookkeeping prep and hiring"],
        ["A copy-paste prompt, an example result and", "a time-saved note for every workflow"],
        ["Proposals, quotes, meetings, planning", "and growth"],
        ["Safe habits: what to share, what to check", "and what to keep human"],
        ["How to connect your email, calendar", "and documents"],
        ["Quick-start lists for ten types of business"],
        ["A 30-day plan to build the habit with your team"],
    ]
    y = oy + 210
    for lines in bullets:
        o.append(f'<rect x="{left}" y="{y - 8.5}" width="7" height="7" fill="{ORANGE}"/>')
        for ln in lines:
            o.append(text(left + 17, y, ln, 12, 700, "start"))
            y += 16.5
        y += 6
    by = oy + 460
    o.append(f'<rect x="{left}" y="{by}" width="{w - 108}" height="58" rx="10" fill="{PAPER}" stroke="#E2D6C2" stroke-width="1.2"/>')
    o.append(text(left + 16, by + 21, "Bonus: downloadable prompt library and templates", 12, 700, "start"))
    o.append(text(left + 16, by + 38, "Business profile, brand voice guide, FAQ sheet, reply rules,", 10.5, 400, "start", MUTED))
    o.append(text(left + 16, by + 51, "weekly planner, AI use policy, monthly review and more.", 10.5, 400, "start", MUTED))
    o.append(text(left, oy + 560, "No coding. No jargon.", 14, 700, "start"))
    o.append(text(left, oy + 580, "Claude drafts. You decide.", 14, 700, "start", ORANGE))
    o.append(text(left, oy + 610, "BUSINESS / SMALL BUSINESS", 9, 700, "start", MUTED, extra='letter-spacing="1.4"'))
    # barcode area: KDP prints the barcode here, bottom right of the back cover
    o.append(f'<rect x="{ox + w - 44 - 144}" y="{oy + h - 44 - 86}" width="144" height="86" fill="#FFFFFF"/>')
    return "".join(o)


def build_paperback_cover(meta, pages, out_pdf, preview_png):
    tw, th = meta["trim"]["width_in"] * 72, meta["trim"]["height_in"] * 72
    spine = pages * PER_PAGE * 72
    W, H = 2 * BLEED + 2 * tw + spine, 2 * BLEED + th
    fx = BLEED + tw + spine
    sx = BLEED + tw
    sp = [f'<rect x="{sx:.2f}" y="0" width="{spine:.2f}" height="{H}" fill="{INK}"/>']
    if pages >= 79:
        mid = sx + spine / 2
        sp.append(f'<g transform="translate({mid + 4.5:.2f} {H / 2}) rotate(90)">'
                  + text(-150, 0, "Claude AI", 13, 900, "end", CREAM, SERIF)
                  + text(-145, 0, "for Small Business", 13, 700, "start", ORANGE, SERIF)
                  + text(60, -0.5, "AADHAVAN MUTHURENGAN", 9.5, 700, "start", CREAM, extra='letter-spacing="1.2"')
                  + "</g>")
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.2f}pt" height="{H}pt" viewBox="0 0 {W:.2f} {H}">'
           + back(BLEED, BLEED, tw, th) + "".join(sp) + front(fx, BLEED, tw, th) + "</svg>")
    Path(out_pdf).write_bytes(cairosvg.svg2pdf(bytestring=svg.encode()))
    cairosvg.svg2png(bytestring=svg.encode(), write_to=str(preview_png), output_width=1800)
    return {"spine_in": spine / 72, "full_w_in": W / 72, "full_h_in": H / 72}


def build_ebook_cover(meta, out_jpg):
    tw, th = meta["trim"]["width_in"] * 72, meta["trim"]["height_in"] * 72
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{tw}" height="{th}" viewBox="0 0 {tw} {th}">'
           + front(0, 0, tw, th) + "</svg>")
    png = cairosvg.svg2png(bytestring=svg.encode(), output_width=1708)   # 1708 x 2562 px (2:3, 6x9)
    Image.open(io.BytesIO(png)).convert("RGB").save(out_jpg, "JPEG", quality=92)
