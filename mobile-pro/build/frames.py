"""Device frames for the book's screenshots.

phone(screen)       a generic modern phone around a screenshot (punch-hole
                    camera, thin bezel, side buttons), with a soft shadow
tv(screen)          a thin-bezel TV on a stand
spread(images, bg)  several framed devices side by side on a backdrop,
                    the middle one slightly larger, for chapter openers

The frames are drawn from scratch (no manufacturer artwork). Screens are
the real captures from build/screenshots.py.
"""

from PIL import Image, ImageDraw, ImageFilter


def _rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size[0] - 1, size[1] - 1], radius, fill=255
    )
    return mask


def _shadow(size, radius, blur, opacity=90, offset=(0, 0)):
    pad = blur * 3
    sh = Image.new("RGBA", (size[0] + 2 * pad, size[1] + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad + offset[0], pad + offset[1],
         pad + offset[0] + size[0], pad + offset[1] + size[1]],
        radius, fill=(15, 23, 42, opacity),
    )
    return sh.filter(ImageFilter.GaussianBlur(blur)), pad


def phone(screen, body=(22, 24, 29), shadow=True):
    """Wrap a screenshot (any size, portrait) in a phone frame."""
    screen = screen.convert("RGBA")
    w, h = screen.size
    unit = w / 393  # CSS-pixel width of the captures
    bezel = round(12 * unit)
    r_screen = round(46 * unit)
    r_body = r_screen + bezel
    bw, bh = w + 2 * bezel, h + 2 * bezel
    dev = Image.new("RGBA", (bw + round(8 * unit), bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(dev)
    # side buttons
    btn = body
    x_right = bw - round(2 * unit)
    d.rounded_rectangle([x_right, round(bh * 0.20), x_right + round(5 * unit),
                         round(bh * 0.30)], round(2 * unit), fill=btn)
    d.rounded_rectangle([x_right, round(bh * 0.33), x_right + round(5 * unit),
                         round(bh * 0.39)], round(2 * unit), fill=btn)
    # body with a subtle metallic rim
    d.rounded_rectangle([0, 0, bw - 1, bh - 1], r_body, fill=body)
    d.rounded_rectangle([round(2 * unit), round(2 * unit), bw - 1 - round(2 * unit),
                         bh - 1 - round(2 * unit)], r_body - round(2 * unit),
                        outline=(70, 74, 84), width=max(1, round(1.2 * unit)))
    dev.paste(screen, (bezel, bezel), _rounded_mask(screen.size, r_screen))
    # punch-hole camera
    cx, cy, cr = bezel + w // 2, bezel + round(18 * unit), round(6 * unit)
    d = ImageDraw.Draw(dev)
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=(8, 8, 10))
    d.ellipse([cx - cr // 3, cy - cr // 3, cx, cy], fill=(40, 46, 70))
    if not shadow:
        return dev
    sh, pad = _shadow((bw, bh), r_body, round(18 * unit), 70,
                      (0, round(14 * unit)))
    out = Image.new("RGBA", sh.size, (0, 0, 0, 0))
    out.alpha_composite(sh)
    out.alpha_composite(dev, (pad, pad))
    return out


def tv(screen, shadow=True):
    """A thin-bezel TV on a low stand around a 16:9 screenshot."""
    screen = screen.convert("RGBA")
    w, h = screen.size
    unit = w / 1920
    bezel = max(4, round(14 * unit))
    bw, bh = w + 2 * bezel, h + 2 * bezel
    stand_h = round(90 * unit)
    dev = Image.new("RGBA", (bw, bh + stand_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(dev)
    # stand: neck and base
    nx = bw // 2
    d.rectangle([nx - round(60 * unit), bh - 2, nx + round(60 * unit),
                 bh + round(50 * unit)], fill=(40, 42, 48))
    d.rounded_rectangle([nx - round(420 * unit), bh + round(46 * unit),
                         nx + round(420 * unit), bh + stand_h - 1],
                        round(10 * unit), fill=(30, 32, 38))
    d.rounded_rectangle([0, 0, bw - 1, bh - 1], round(10 * unit),
                        fill=(14, 15, 18))
    dev.paste(screen, (bezel, bezel))
    if not shadow:
        return dev
    sh, pad = _shadow((bw, bh), round(10 * unit), round(30 * unit), 60,
                      (0, round(24 * unit)))
    out = Image.new("RGBA", (sh.size[0], sh.size[1] + stand_h), (0, 0, 0, 0))
    out.alpha_composite(sh)
    out.alpha_composite(dev, (pad, pad))
    return out


def backdrop(size, top, bottom):
    """A vertical gradient background."""
    w, h = size
    bg = Image.new("RGBA", size)
    d = ImageDraw.Draw(bg)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)],
               fill=tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
               + (255,))
    return bg


def spread(framed, width=3000, top=(246, 247, 250), bottom=(232, 236, 243),
           gap=0.06, lift_middle=True):
    """Lay out framed devices side by side, scaled to fit `width`; with
    three or more, the middle one is drawn larger and in front."""
    n = len(framed)
    if n == 0:
        raise ValueError("no images")
    scale_mid = 1.1 if (lift_middle and n % 2 == 1 and n >= 3) else 1.0
    base_h = max(im.size[1] for im in framed)
    widths = [im.size[0] * (scale_mid if i == n // 2 and scale_mid > 1 else 1)
              for i, im in enumerate(framed)]
    total = sum(widths) * (1 + gap) - gap * sum(widths) / n
    k = width * 0.94 / total
    imgs = []
    for i, im in enumerate(framed):
        s = k * (scale_mid if i == n // 2 and scale_mid > 1 else 1)
        imgs.append(im.resize((round(im.size[0] * s), round(im.size[1] * s)),
                              Image.LANCZOS))
    height = round(max(im.size[1] for im in imgs) * 1.04)
    canvas = backdrop((width, height), top, bottom)
    x = round(width * 0.03)
    step_gap = round(gap * sum(im.size[0] for im in imgs) / n)
    order = sorted(range(n), key=lambda i: -abs(i - n // 2))  # middle last
    xs = []
    for im in imgs:
        xs.append(x)
        x += im.size[0] + step_gap
    shift = (width - (x - step_gap)) // 2 - round(width * 0.03)
    for i in order:
        im = imgs[i]
        y = (height - im.size[1]) // 2
        canvas.alpha_composite(im, (xs[i] + shift, y))
    return canvas
