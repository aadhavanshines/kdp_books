"""Check the paperback interior PDF before upload.

Measures, on every page: the inside (gutter) and outside margins of the
text and images, whether every chapter, part and appendix starts on a
right-hand page, and large unplanned gaps at the bottom of pages.
Usage:  python3 build/check_pdf.py [dist/paperback-interior-6x9.pdf]
"""
import sys

import pymupdf

PATH = sys.argv[1] if len(sys.argv) > 1 else "dist/paperback-interior-6x9.pdf"
doc = pymupdf.open(PATH)
W = doc[0].rect.width
GUTTER_MIN = 0.625 if doc.page_count > 300 else 0.5  # KDP, 301-500 pages
inside, outside, gaps = [], [], []
starts = {pg for _, _, pg in doc.get_toc()}
for i, page in enumerate(doc):
    n = i + 1
    boxes = [b[:4] for b in page.get_text("blocks") if b[4].strip()]
    boxes += [im["bbox"] for im in page.get_image_info()]
    boxes += [d["rect"] for d in page.get_drawings() if d["rect"].width < W]
    if not boxes:
        continue
    left = min(b[0] for b in boxes) / 72
    right = (W - max(b[2] for b in boxes)) / 72
    # Odd pages are right-hand pages: the gutter is on the left.
    gin, gout = (left, right) if n % 2 else (right, left)
    inside.append((round(gin, 3), n))
    outside.append((round(gout, 3), n))
    bottom = max(b[3] for b in boxes if b[3] < page.rect.height - 50)
    gap = (page.rect.height - 72 * 0.75 - bottom) / 72
    next_starts = (n + 1) in starts or (n + 2) in starts
    if gap > 2.5 and n not in starts and not next_starts and 10 < n < doc.page_count:
        gaps.append((round(gap, 2), n))
even_starts = sorted(pg for pg in starts if pg % 2 == 0)
print(f"pages: {doc.page_count}")
print(f"smallest inside margin: {min(inside)[0]} in (page {min(inside)[1]}), "
      f"KDP minimum {GUTTER_MIN} in")
print(f"smallest outside margin: {min(outside)[0]} in (page {min(outside)[1]}), "
      "KDP minimum 0.25 in")
print(f"TOC entries: {len(starts)}; starting on a left-hand page: {even_starts or 'none'}")
print(f"gaps over 2.5 in before the end of a chapter: {sorted(gaps, reverse=True)[:8] or 'none'}")
ok = min(inside)[0] >= GUTTER_MIN and min(outside)[0] >= 0.25 and not even_starts
sys.exit(0 if ok else 1)
