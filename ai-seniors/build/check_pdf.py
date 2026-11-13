"""Check the paperback interior PDF before upload.

Measures, on every page: the inside (gutter) and outside margins of the
text and images, whether every part opener and the tear-out quick reference
start on a right-hand page (chapters start on the next page, left or right),
blank pages after the front matter, large unplanned gaps at the bottom of pages, and
characters the fonts can't draw (they extract as NUL or U+FFFD).
Usage:  python3 build/check_pdf.py [dist/paperback-interior-8.5x11.pdf]
"""
import sys

import pymupdf

PATH = sys.argv[1] if len(sys.argv) > 1 else "dist/paperback-interior-8.5x11.pdf"
doc = pymupdf.open(PATH)
W = doc[0].rect.width
GUTTER_MIN = 0.625 if doc.page_count > 300 else 0.5 if doc.page_count > 150 else 0.375  # KDP
inside, outside, gaps, missing = [], [], [], []
starts = {pg for _, _, pg in doc.get_toc()}
for i, page in enumerate(doc):
    n = i + 1
    text = page.get_text()
    if "\x00" in text or "\ufffd" in text:
        missing.append(n)
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
    gap = (page.rect.height - 72 * 0.85 - bottom) / 72
    next_starts = (n + 1) in starts or (n + 2) in starts
    if gap > 2.5 and n not in starts and not next_starts and 10 < n < doc.page_count:
        gaps.append((round(gap, 2), n))
recto_only = [pg for _, title, pg in doc.get_toc()
              if title.startswith("Part ") or title.startswith("Appendix C")]
even_starts = sorted(pg for pg in recto_only if pg % 2 == 0)
blank = [i + 1 for i, page in enumerate(doc)
         if i >= 8 and not page.get_text("blocks") and not page.get_image_info()]
thin = [i + 1 for i, page in enumerate(doc)
        if i >= 8 and (i + 1) not in starts and not page.get_image_info()
        and 0 < sum(len(b.get("lines", [])) for b in page.get_text("dict")["blocks"]) <= 5]
print(f"pages: {doc.page_count}")
print(f"smallest inside margin: {min(inside)[0]} in (page {min(inside)[1]}), "
      f"KDP minimum {GUTTER_MIN} in")
print(f"smallest outside margin: {min(outside)[0]} in (page {min(outside)[1]}), "
      "KDP minimum 0.25 in")
print(f"TOC entries: {len(starts)}; parts or quick reference starting on a left-hand page: "
      f"{even_starts or 'none'}")
print(f"blank pages after the front matter: {blank or 'none'}")
print(f"pages with only a few lines (header and page number included): {thin or 'none'}")
print(f"gaps over 2.5 in before the end of a chapter: {sorted(gaps, reverse=True)[:8] or 'none'}")
print(f"pages with characters the fonts can't draw: {missing or 'none'}")
ok = (min(inside)[0] >= GUTTER_MIN and min(outside)[0] >= 0.25 and not even_starts
      and not missing and not blank and not thin)
sys.exit(0 if ok else 1)
