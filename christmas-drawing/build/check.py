"""Checks for the KDP files: trim size, page count, fonts, safe margins, cover size."""
import sys
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
PER_PAGE = 0.002252
OUT_MIN, GUTTER_MIN = 0.375 * 72, 0.5 * 72   # 101-150 pages need a 0.5 in gutter

problems = []
doc = fitz.open(ROOT / "dist" / "interior.pdf")
n = doc.page_count
for i, pg in enumerate(doc):
    num = i + 1
    if abs(pg.rect.width - 612) > 0.5 or abs(pg.rect.height - 792) > 0.5:
        problems.append(f"page {num}: size {pg.rect}")
    inner_left = num % 2 == 1          # odd pages are right-hand pages: gutter on the left
    left_min = GUTTER_MIN if inner_left else OUT_MIN
    right_max = 612 - (OUT_MIN if inner_left else GUTTER_MIN)
    boxes = [d["rect"] for d in pg.get_drawings() if d["rect"].width < 600]  # skip page background
    boxes += [fitz.Rect(b[:4]) for b in pg.get_text("blocks")]
    for b in boxes:
        if b.x0 < left_min - 0.5 or b.x1 > right_max + 0.5 or b.y0 < OUT_MIN - 0.5 or b.y1 > 792 - OUT_MIN + 0.5:
            problems.append(f"page {num}: content outside safe area at {tuple(round(v) for v in b)}")
            break
    for f in pg.get_fonts():
        if f[1] not in ("ttf", "cff", "Type1C", "TrueType") and "+" not in f[3]:
            problems.append(f"page {num}: font not embedded {f}")

cover = fitz.open(ROOT / "dist" / "cover.pdf")[0].rect
spine = n * PER_PAGE
want_w = 2 * 8.5 + spine + 0.25
if abs(cover.width / 72 - want_w) > 0.01 or abs(cover.height / 72 - 11.25) > 0.01:
    problems.append(f"cover is {cover.width/72:.3f} x {cover.height/72:.3f} in, want {want_w:.3f} x 11.25")

print(f"interior: {n} pages, 8.5 x 11 in; cover {cover.width/72:.3f} x {cover.height/72:.3f} in, spine {spine:.3f} in")
for p in problems:
    print("PROBLEM:", p)
print("OK" if not problems else f"{len(problems)} problem(s)")
sys.exit(1 if problems else 0)
