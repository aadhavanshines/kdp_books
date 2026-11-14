"""KDP checks for the interior: page size, safe margins (gutter by page parity), embedded fonts."""
import sys
from pathlib import Path
import fitz

ROOT = Path(__file__).resolve().parent.parent
doc = fitz.open(ROOT / "dist" / "paperback-interior-6x9.pdf")
n = doc.page_count
GUT = 0.375 if n <= 150 else 0.5
bad = []
ins, outs = [], []
for i, pg in enumerate(doc):
    num = i + 1
    if abs(pg.rect.width - 432) > 0.5 or abs(pg.rect.height - 648) > 0.5:
        bad.append(f"page {num}: size")
    boxes = [fitz.Rect(b[:4]) for b in pg.get_text("blocks") if b[4].strip()] + [d["rect"] for d in pg.get_drawings()]
    if not boxes:
        continue
    left, right = min(b.x0 for b in boxes) / 72, (432 - max(b.x1 for b in boxes)) / 72
    top, bottom = min(b.y0 for b in boxes) / 72, (648 - max(b.y1 for b in boxes)) / 72
    gin, gout = (left, right) if num % 2 else (right, left)
    ins.append((round(gin, 3), num)); outs.append((round(min(gout, top, bottom), 3), num))
    for f in pg.get_fonts():
        if "+" not in f[3]:
            bad.append(f"page {num}: font not embedded {f[3]}")
print(f"{n} pages, 6 x 9 in. Smallest gutter {min(ins)} (KDP minimum {GUT}); smallest outer margin {min(outs)} (minimum 0.25)")
if min(ins)[0] < GUT or min(outs)[0] < 0.25:
    bad.append("margin too small")
for b in bad[:10]:
    print("PROBLEM:", b)
print("OK" if not bad else f"{len(bad)} problem(s)")
sys.exit(1 if bad else 0)
