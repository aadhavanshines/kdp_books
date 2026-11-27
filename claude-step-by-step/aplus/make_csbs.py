"""A+ images for Claude AI Step by Step (AI Skillup teal, Inter), featuring the real Blender brand-kit results."""
import os
from PIL import Image, ImageDraw, ImageFont

B = "../kdp_wt/claude-step-by-step/"
F = B + "fonts/"
DEMO = B + "blender-demo/"
WHITE, TEAL, INK, MUTED, LIGHT, LINE, CARD = "#FFFFFF", "#0F766E", "#141414", "#4B4B4B", "#E2F1EF", "#D8D8D8", "#F6F8F8"
S = 3
OUT = "out_csbs"


def inter(sz, weight="Bold"):
    f = ImageFont.truetype(F + "Inter.ttf", sz * S)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def canvas(w, h, bg=WHITE):
    im = Image.new("RGB", (w * S, h * S), bg)
    return im, ImageDraw.Draw(im)


def save(im, w, h, name):
    os.makedirs(OUT, exist_ok=True)
    im.resize((w, h), Image.LANCZOS).save(f"{OUT}/{name}", quality=92)
    print(name, (w, h))


def T(d, xy, t, f, fill=INK, anchor="la"):
    d.text((xy[0] * S, xy[1] * S), t, font=f, fill=fill, anchor=anchor)


def R(d, box, fill=None, outline=None, r=10, w=2):
    d.rounded_rectangle([v * S for v in box], radius=r * S, fill=fill, outline=outline, width=w * S)


def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if d.textlength(t, font=f) <= maxw * S:
            cur = t
        else:
            lines.append(cur)
            cur = wd
    lines.append(cur)
    return lines


def fit(img, w, h):
    """Center-crop an image to fill w x h (in final pixels, scaled by S)."""
    img = img.convert("RGB")
    r = max(w * S / img.width, h * S / img.height)
    img = img.resize((int(img.width * r) + 1, int(img.height * r) + 1), Image.LANCZOS)
    x, y = (img.width - w * S) // 2, (img.height - h * S) // 2
    return img.crop((x, y, x + w * S, y + h * S))


cover = Image.open(B + "dist/ebook-cover-bordered.jpg").convert("RGB")

# 1. Header 970x600
im, d = canvas(970, 600)
d.rectangle([0, 0, 970 * S, 14 * S], fill=TEAL)
ch = 520
cw = int(cover.width * ch / cover.height)
im.paste(Image.new("RGB", (cw * S + 20 * S, ch * S + 20 * S), "#E4E4E4"), (48 * S, 48 * S))
im.paste(cover.resize((cw * S, ch * S), Image.LANCZOS), (40 * S, 40 * S))
x = 40 + cw + 56
T(d, (x, 70), "AI SKILLUP SERIES", inter(15), TEAL)
T(d, (x, 98), "Stop fixing AI drafts.", inter(44, "Black"))
T(d, (x, 152), "Get finished work.", inter(44, "Black"), TEAL)
y = 226
for line in wrap(d, "The visual, step-by-step guide to Claude, tested for real: every workflow shows the exact request, Claude's real answer, and how to make it finished.", inter(19, "Regular"), 970 - x - 40):
    T(d, (x, y), line, inter(19, "Regular"), MUTED)
    y += 28
y += 18
for t in ["50 real workflows with real answers", "Real screenshots, numbered and explained",
          "Projects, memory, Research and connectors", "3D, animation, websites and games with Blender", "No coding needed"]:
    d.rectangle([x * S, (y + 7) * S, (x + 11) * S, (y + 18) * S], fill=TEAL)
    T(d, (x + 24, y), t, inter(19, "SemiBold"))
    y += 36
save(im, 970, 600, "01-header-970x600.jpg")

# 2. Three 300x300: the method
steps = [("STEP 1", "Describe", ["Who it's for", "What finished looks like", "Format and length"], "The Finished-Work Formula"),
         ("STEP 2", "Check", ["Read Claude's real answer", "Spot the slips", "Ask for one fix"], "Honest about mistakes"),
         ("STEP 3", "Repeat", ["Save it in a Project", "Turn it into a skill", "Put it on a schedule"], "Saves time every week")]
for i, (lab, word, items, foot) in enumerate(steps):
    im, d = canvas(300, 300)
    d.rectangle([0, 0, 300 * S, 8 * S], fill=TEAL)
    d.ellipse([22 * S, 30 * S, 70 * S, 78 * S], fill=TEAL if i == 2 else INK)
    T(d, (46, 54), str(i + 1), inter(26, "Black"), WHITE, "mm")
    T(d, (86, 34), lab, inter(14), TEAL)
    T(d, (86, 50), word, inter(30, "Black"))
    y = 118
    for t in items:
        d.rectangle([28 * S, (y + 6) * S, 37 * S, (y + 15) * S], fill=TEAL)
        T(d, (48, y), t, inter(17, "SemiBold"))
        y += 40
    R(d, (22, 244, 278, 280), fill=LIGHT, r=6, w=0)
    T(d, (150, 262), foot, inter(15), TEAL, "mm")
    save(im, 300, 300, f"02{'abc'[i]}-{word.lower()}-300.jpg")

# 3. Four 220x220: the real Blender brand kit
def tile220(name, pic, label):
    im, d = canvas(220, 220, CARD)
    R(d, (6, 6, 214, 214), outline=LINE, r=14, w=2)
    im.paste(pic, (12 * S, 12 * S))
    d.rectangle([12 * S, 12 * S, 208 * S, 162 * S], outline=LINE, width=S)
    T(d, (110, 190), label, inter(17), INK, "mm")
    save(im, 220, 220, name)

tile220("03a-3d-model-220.jpg", fit(Image.open(DEMO + "mug-final.png").crop((380, 160, 1260, 1000)), 196, 150), "3D model")

grid = Image.new("RGB", (196 * S, 150 * S), "white")
gw, gh = 97 * S, 74 * S
for k, n in enumerate((1, 10, 19, 28)):
    f = Image.open(DEMO + f"turntable/f_{n:04d}.png").convert("RGB").crop((150, 60, 650, 560))
    grid.paste(fit(f, 97, 74), ((k % 2) * (gw + 2 * S), (k // 2) * (gh + 2 * S)))
tile220("03b-animation-220.jpg", grid, "Animation")

site = Image.open(DEMO + "site-hero.png").convert("RGB").crop((0, 0, 2400, 1214))
site = site.resize((196 * S, int(1214 * 196 * S / 2400)), Image.LANCZOS)
pad = Image.new("RGB", (196 * S, 150 * S), "#F3EBDD")
pad.paste(site, (0, (150 * S - site.height) // 2))
tile220("03c-website-220.jpg", pad, "Website")

game = Image.open(DEMO + "game/play.jpg").convert("RGB").crop((893, 37, 1347, 679)).crop((40, 300, 454, 642))
tile220("03d-game-220.jpg", fit(game, 196, 150), "Arcade game")

# 4. Single 300x300: the official Blender connector, real window
im, d = canvas(300, 300)
T(d, (150, 22), "CLAUDE + BLENDER", inter(15), TEAL, "ma")
shot = Image.open(DEMO + "blender-window.png").convert("RGB").crop((560, 40, 1580, 860))
im.paste(fit(shot, 264, 200), (18 * S, 48 * S))
d.rectangle([18 * S, 48 * S, 282 * S, 248 * S], outline=LINE, width=S)
T(d, (150, 262), "Official connector, set up step by step", inter(13), INK, "ma")
T(d, (150, 280), "Real result from the book", inter(12, "Regular"), MUTED, "ma")
save(im, 300, 300, "04-blender-connector-300.jpg")

# 5. Comparison chart 150x300 (same recipe as chart-v2)
im = Image.new("RGB", (150, 300), "white")
t = cover.resize((150, int(cover.height * 150 / cover.width)), Image.LANCZOS)
im.paste(t, (0, (300 - t.height) // 2))
im.save(f"{OUT}/05-claude-step-by-step-150x300.jpg", quality=92)
print("chart", im.size)

# contact sheet for review
files = sorted(f for f in os.listdir(OUT) if f.endswith(".jpg") and not f.startswith("_"))
sheet = Image.new("RGB", (1300, 1000), "#DDDDDD")
sheet.paste(Image.open(f"{OUT}/01-header-970x600.jpg").resize((650, 402)), (10, 10))
x = 670
for f in files:
    if f.startswith("02"):
        sheet.paste(Image.open(f"{OUT}/{f}").resize((200, 200)), (x, 10)); x += 210
x = 10
for f in files:
    if f.startswith("03"):
        sheet.paste(Image.open(f"{OUT}/{f}"), (x, 430)); x += 230
sheet.paste(Image.open(f"{OUT}/04-blender-connector-300.jpg"), (940, 430))
sheet.paste(Image.open(f"{OUT}/05-claude-step-by-step-150x300.jpg"), (10, 680))
sheet.save(f"{OUT}/_sheet.jpg", quality=85)


# 6. Flagship use case 300x300: computer use, the real budget Claude built on screen
def flagship():
    src = Image.open(B + "manuscript/images/shot-numbers-computer-use.png").convert("RGB")
    dd = ImageDraw.Draw(src)
    dd.ellipse([1050, 302, 1110, 362], fill="white")  # hide the book's callout badge
    pic = src.crop((645, 40, 1300, 1092))
    im, d = canvas(300, 300)
    T(d, (150, 16), "CLAUDE USES YOUR COMPUTER", inter(14), TEAL, "ma")
    r = min(264 * S / pic.width, 206 * S / pic.height)
    pic = pic.resize((int(pic.width * r), int(pic.height * r)), Image.LANCZOS)
    x0 = (300 * S - pic.width) // 2
    im.paste(pic, (x0, 40 * S))
    T(d, (150, 256), "A budget built on screen, with formulas", inter(13), INK, "ma")
    T(d, (150, 276), "Real result from the book", inter(12, "Regular"), MUTED, "ma")
    save(im, 300, 300, "06-computer-use-300.jpg")


if True:
    flagship()
