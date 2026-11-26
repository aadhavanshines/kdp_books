"""Book images for the Blender section, made from the real files in blender-demo/."""
from pathlib import Path
from PIL import Image, ImageDraw
from screens import label

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "blender-demo"
OUT = HERE / "manuscript" / "images"


def framed(img, name):
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, img.width - 1, img.height - 1], outline=(150, 150, 150), width=4)
    img.save(OUT / f"{name}.png", dpi=(300, 300), optimize=True)
    print(name, img.size)


win = Image.open(SRC / "blender-window.png").convert("RGB").crop((560, 0, 1910, 860))
d = ImageDraw.Draw(win)
for x, y, n in [(130, 600, 1), (1235, 128, 2), (1000, 440, 3)]:
    label(d, x, y, n, 26)
framed(win, "shot-blender-window")

framed(Image.open(SRC / "mug-final.png").convert("RGB"), "img-blender-mug")

frames = [Image.open(SRC / "turntable" / f"f_{i:04d}.png").convert("RGB") for i in (1, 10, 19, 28)]
strip = Image.new("RGB", (4 * 600 + 3 * 16, 450), "white")
for k, f in enumerate(frames):
    strip.paste(f.resize((600, 450), Image.LANCZOS), (k * 616, 0))
framed(strip, "img-blender-turntable")

badge0 = Image.open(SRC / "harbor-beans-badge.svg.png").convert("RGB").resize((900, 900), Image.LANCZOS)
badge = Image.new("RGB", (1800, 980), "white"); badge.paste(badge0, (450, 40))
framed(badge, "img-harbor-badge")

hero = Image.open(SRC / "site-hero.png").convert("RGB").crop((0, 0, 2400, 1214))
framed(hero, "shot-harbor-site")

# Harbor Run game: title, gameplay and game-over screens from the real artifact
panels = [Image.open(SRC / "game" / f"{n}.jpg").convert("RGB").crop((893, 37, 1347, 679)) for n in ("title", "play", "over")]
gw = sum(p.width for p in panels) + 2 * 14
game = Image.new("RGB", (gw, panels[0].height), "white")
x = 0
for p in panels:
    game.paste(p, (x, 0)); x += p.width + 14
game = game.resize((game.width * 2, game.height * 2), Image.LANCZOS)
framed(game, "shot-harbor-run")

framed(Image.open(SRC / "harbor-run-boat.png").convert("RGB"), "img-harbor-run-boat")

# Computer use: the finished Numbers sheet Claude built on screen
num = Image.open(SRC / "numbers" / "final.jpg").convert("RGB").crop((0, 85, 700, 640))
num = num.resize((num.width * 2, num.height * 2), Image.LANCZOS)
d = ImageDraw.Draw(num)
for x, y, n in [(610, 62, 1), (1080, 330, 2), (1340, 840, 3)]:
    label(d, x, y, n, 26)
framed(num, "shot-numbers-computer-use")
