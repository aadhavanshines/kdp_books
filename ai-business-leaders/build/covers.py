"""Paperback wrap cover (back, spine, front, with bleed) and the Kindle eBook cover.

All vector: white background, black Playfair Display title, one deep-green accent,
and a simple "small proof, then scale" bar motif. No third-party logos.
"""
import io
from pathlib import Path

import cairosvg
from PIL import Image

PER_PAGE = 0.002252          # inches per page, white paper, black ink
BLEED = 9                    # points (0.125 in)
SERIF, SANS = "Playfair Display", "Arial"
INK, GREEN, PAPER, MUTED, LIGHT = "#141414", "#0E6B4E", "#FFFFFF", "#4B4B4B", "#E3EEE9"


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def text(x, y, s, size, weight=700, anchor="middle", color=INK, family=SANS, extra=""):
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-weight="{weight}" '
            f'font-size="{size}" fill="{color}" text-anchor="{anchor}" {extra}>{esc(s)}</text>')


def bars(cx, base, s=1.0):
    """One small proven bar (with a tick), then four rising bars: proof, then scale."""
    o = []
    w, gap = 30 * s, 14 * s
    heights = [26, 44, 66, 92, 124]
    x0 = cx - (5 * w + 4 * gap) / 2
    for i, h in enumerate(heights):
        h *= s
        x = x0 + i * (w + gap)
        fill = GREEN if i == 0 else LIGHT
        stroke = "" if i == 0 else f'stroke="{GREEN}" stroke-width="{1.4 * s:.2f}" stroke-dasharray="{3 * s:.1f} {2.5 * s:.1f}"'
        o.append(f'<rect x="{x:.1f}" y="{base - h:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" {stroke}/>')
    # tick above the first bar
    tx, ty = x0 + w / 2, base - heights[0] * s - 16 * s
    o.append(f'<path d="M{tx - 8 * s:.1f} {ty:.1f} L{tx - 2 * s:.1f} {ty + 6 * s:.1f} L{tx + 9 * s:.1f} {ty - 7 * s:.1f}" '
             f'fill="none" stroke="{GREEN}" stroke-width="{3.2 * s:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
    # arrow along the tops
    ax0, ax1 = x0 + w + gap / 2, x0 + 5 * w + 4 * gap + 6 * s
    o.append(f'<line x1="{x0 - 6 * s:.1f}" y1="{base + 0.5:.1f}" x2="{ax1:.1f}" y2="{base + 0.5:.1f}" stroke="{INK}" stroke-width="{1.2 * s:.2f}"/>')
    o.append(text(x0 + w / 2, base + 15 * s, "PROVE", 8.5 * s, 700, color=GREEN, extra=f'letter-spacing="{1.2 * s:.1f}"'))
    o.append(text((ax0 + ax1) / 2, base + 15 * s, "THEN SCALE", 8.5 * s, 700, color=MUTED, extra=f'letter-spacing="{1.2 * s:.1f}"'))
    return "".join(o)


def front(ox, oy, w, h):
    cx = ox + w / 2
    o = [f'<rect x="{ox}" y="{oy - BLEED}" width="{w + BLEED}" height="{h + 2 * BLEED}" fill="{PAPER}"/>']
    o.append(f'<rect x="{ox}" y="{oy - BLEED}" width="{w + BLEED}" height="{BLEED + 9}" fill="{GREEN}"/>')
    o.append(text(cx, oy + 52, "AI FOR BUSINESS LEADERS", 12.5, 700, color=GREEN, extra='letter-spacing="3"'))
    for i, word in enumerate(["Proof", "Before", "Scale"]):
        o.append(text(cx, oy + 138 + i * 82, word, 88, 900, color=INK, family=SERIF))
    o.append(f'<rect x="{cx - 46}" y="{oy + 326}" width="92" height="3.5" fill="{GREEN}"/>')
    o.append(text(cx, oy + 358, "A 90-Day Playbook to Choose, Fund, Govern", 15.5, 700))
    o.append(text(cx, oy + 380, "and Scale AI That Pays Back", 15.5, 700))
    o.append(bars(cx, oy + 548, 1.0))
    o.append(text(cx, oy + h - 30, "AADHAVAN MUTHURENGAN", 14, 700, extra='letter-spacing="2.6"'))
    return "".join(o)


def back(ox, oy, w, h):
    cx = ox + w / 2
    left = ox + 54
    o = [f'<rect x="0" y="0" width="{ox + w}" height="{oy + h + BLEED}" fill="{PAPER}"/>']
    o.append(f'<rect x="0" y="0" width="{ox + w}" height="{BLEED + 9}" fill="{GREEN}"/>')
    o.append(text(cx, oy + 62, "Most AI pilots never pay back.", 25, 900, family=SERIF))
    o.append(text(cx, oy + 92, "Yours can.", 25, 900, family=SERIF, color=GREEN))
    para = [
        "Your board wants an AI plan. Your team is already using",
        "AI tools. Your CFO wants to know what you got for the money.",
        "This book gives you one simple rule and the method behind it:",
        "prove an AI use case pays back on a small scale, then scale it.",
    ]
    for i, ln in enumerate(para):
        o.append(text(cx, oy + 128 + i * 18, ln, 12, 400, color=MUTED))
    o.append(text(left, oy + 218, "INSIDE", 11.5, 700, "start", GREEN, extra='letter-spacing="2"'))
    bullets = [
        ["A full three-year business case with real numbers,", "including the costs most proposals leave out"],
        ["How to find, score and choose your first use cases"],
        ["Build, buy or configure, and how to test vendors"],
        ["Use cases that pay back in sales, marketing, service,", "finance, operations, HR, legal and IT"],
        ["Governance without bureaucracy, and a one-page policy"],
        ["Leading people through the change, honestly"],
        ["A week-by-week 90-day plan, plus templates for every step"],
    ]
    y = oy + 240
    for lines in bullets:
        o.append(f'<rect x="{left}" y="{y - 8.5}" width="7" height="7" fill="{GREEN}"/>')
        for ln in lines:
            o.append(text(left + 17, y, ln, 11.5, 700, "start"))
            y += 16
        y += 6
    o.append(text(left, oy + 456, "Aadhavan Muthurengan writes practical guides to AI for working", 10.5, 400, "start", MUTED))
    o.append(text(left, oy + 470, "professionals, including the AI Skillup series.", 10.5, 400, "start", MUTED))
    o.append(text(left, oy + 506, "No jargon. No code. No vendor to sell.", 13, 700, "start"))
    o.append(text(left, oy + 520, "Just decisions you can defend.", 13, 700, "start", GREEN).replace(f'y="{oy + 520:.1f}"', f'y="{oy + 526:.1f}"'))
    o.append(text(left, oy + 610, "BUSINESS / LEADERSHIP / AI", 9, 700, "start", MUTED, extra='letter-spacing="1.4"'))
    # barcode area: KDP prints a 2 x 1.2 in barcode 0.25 in from the spine-side and bottom trim edges
    o.append(f'<rect x="{ox + w - 18 - 144}" y="{oy + h - 18 - 86.4}" width="144" height="86.4" fill="#FFFFFF" stroke="#DDDDDD" stroke-width="0.6"/>')
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
        sp.append(f'<g transform="translate({mid - 4.2:.2f} {H / 2}) rotate(90)">'
                  + text(-40, 0, "Proof Before Scale", 14, 900, "end", PAPER, SERIF)
                  + text(-30, -0.5, "AI for Business Leaders", 9.5, 700, "start", "#7FD1B2", extra='letter-spacing="0.8"')
                  + text(255, -0.5, "AADHAVAN", 10, 700, "end", PAPER, extra='letter-spacing="1.6"')
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
    im = Image.open(io.BytesIO(png)).convert("RGB")
    im.save(out_jpg, "JPEG", quality=92)
    # Bordered version for the Kindle upload: a 4 px slate edge (same as the other 2026
    # covers) keeps the white cover from melting into Amazon's white page.
    from PIL import ImageDraw
    ImageDraw.Draw(im).rectangle([0, 0, im.width - 1, im.height - 1], outline=(156, 162, 174), width=4)
    im.save(Path(out_jpg).with_name("ebook-cover-bordered.jpg"), "JPEG", quality=92)
