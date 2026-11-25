"""Turn raw Claude app screenshots into book figures.

Raw captures live in screens-raw/ (git-ignored: they contain the author's
account details). Each figure here is cropped, has every personal detail
(account name, chat titles, other artifacts) destroyed by pixelation plus a
heavy blur, and gets numbered labels that the text refers to.

Usage: python3 build/screens.py   (writes manuscript/images/shot-*.png)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "screens-raw"
OUT = ROOT / "manuscript" / "images"
BOLD = str(ROOT / "fonts" / "AtkinsonHyperlegible-Bold.ttf")
INK, PAPER = (20, 20, 20), (255, 255, 255)
SCALE = 2  # upscale so the labels and edges stay crisp in print

# name: (raw file, crop box, private boxes to destroy, labels [(x, y, n)]) in raw pixels
SHOTS = {
    "shot-home": ("home.jpg", (0, 0, 1260, 679),
                  [(845, 238, 1155, 284), (6, 250, 228, 640), (30, 648, 175, 674), (815, 480, 1165, 602)],
                  [(205, 53, 1), (205, 81, 2), (205, 108, 3), (205, 136, 4), (205, 164, 5), (205, 192, 6), (110, 234, 7),
                   (612, 360, 8), (1126, 326, 9), (618, 396, 10), (1046, 428, 11), (1186, 396, 12), (205, 660, 13)]),
    "shot-plus-menu": ("plus-menu.jpg", (560, 285, 1240, 615), [(893, 455, 1170, 610)],
                       [(910, 392, 1), (910, 422, 2), (910, 489, 3), (910, 512, 4), (910, 535, 5), (910, 565, 6), (910, 588, 7)]),
    "shot-model-picker": ("model-picker.jpg", (600, 285, 1180, 679), [(1108, 455, 1170, 600)], []),
    "shot-first-chat": ("first-chat.jpg", (440, 40, 1130, 679), [],
                        [(462, 176, 1), (462, 223, 2), (462, 513, 3), (462, 575, 4)]),
    "shot-artifact": ("artifact.jpg", (0, 0, 1568, 679), [],
                      [(460, 198, 1), (460, 260, 2), (590, 17, 3), (1110, 600, 4), (1560, 40, 5)]),
    "shot-lease": ("lease.jpg", (440, 80, 1130, 555), [],
                   [(965, 155, 1), (462, 322, 2), (462, 385, 3), (462, 448, 4)]),
    "shot-incognito": ("incognito.jpg", (480, 230, 1090, 640), [], []),
    "shot-project-create": ("project-create.jpg", (560, 175, 1010, 505), [], []),
    "shot-project-instructions": ("project-instructions.jpg", (480, 130, 1090, 550), [], []),
    "shot-project": ("project.jpg", (300, 40, 1290, 420), [],
                     [(1266, 156, 1), (1266, 199, 2), (1266, 243, 3), (1266, 286, 4), (318, 150, 5)]),
    "shot-scheduled-task": ("scheduled-task.jpg", (480, 85, 1090, 595), [],
                            [(1050, 120, 1), (1050, 198, 2), (500, 343, 3), (820, 464, 4)]),
}


def destroy(img, box):
    """Pixelate then blur a region so no text in it can be recovered."""
    x0, y0, x1, y1 = box
    region = img.crop(box)
    w, h = region.size
    small = region.resize((max(1, w // 14), max(1, h // 14)), Image.BILINEAR)
    region = small.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(6))
    img.paste(region, (x0, y0))


def label(d, x, y, n, r=15):
    d.ellipse([x - r - 2, y - r - 2, x + r + 2, y + r + 2], fill=PAPER)
    d.ellipse([x - r, y - r, x + r, y + r], fill=INK)
    f = ImageFont.truetype(BOLD, int(r * 1.25))
    d.text((x, y + 1), str(n), font=f, fill=PAPER, anchor="mm")


def build(name):
    raw, crop, private, labels = SHOTS[name]
    img = Image.open(RAW / raw).convert("RGB")
    for box in private:
        destroy(img, box)
    cx, cy = crop[0], crop[1]
    img = img.crop(crop)
    img = img.resize((img.width * SCALE, img.height * SCALE), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    for x, y, n in labels:
        label(d, (x - cx) * SCALE, (y - cy) * SCALE, n, 15 * SCALE)
    # thin frame so a white screen doesn't melt into the white page
    d.rectangle([0, 0, img.width - 1, img.height - 1], outline=(150, 150, 150), width=SCALE * 2)
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / f"{name}.png", dpi=(300, 300), optimize=True)
    print("screen", name, img.size)


if __name__ == "__main__":
    import sys
    for n in sys.argv[1:] or SHOTS:
        if (RAW / SHOTS[n][0]).exists():
            build(n)
        else:
            print("missing raw capture for", n)
