"""Build all KDP deliverables for the book.

Usage: python3 build/build.py
Outputs go to dist/.
"""
import json
from pathlib import Path

from diagrams import build_diagrams
from covers import build_ebook_cover, build_paperback_cover
from epub_build import build_epub
from interior_pdf import build_interior
from mdparse import load_manuscript

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def main():
    meta = json.loads((ROOT / "book.json").read_text())
    build_diagrams(ROOT / "manuscript" / "images")
    manuscript = load_manuscript(ROOT / "manuscript")
    DIST.mkdir(exist_ok=True)

    cover_jpg = DIST / "ebook-cover.jpg"
    build_ebook_cover(meta, cover_jpg)
    print(f"eBook cover:      {cover_jpg.relative_to(ROOT)}")

    epub_path = DIST / "prompt-engineering-mastery.epub"
    build_epub(meta, manuscript, cover_jpg, epub_path, ROOT / "manuscript")
    print(f"eBook (EPUB):     {epub_path.relative_to(ROOT)}")

    interior = DIST / "paperback-interior-6x9.pdf"
    pages = build_interior(meta, manuscript, interior, ROOT / "manuscript")
    print(f"Paperback interior: {interior.relative_to(ROOT)} ({pages} pages)")

    cover_pdf = DIST / "paperback-cover.pdf"
    info = build_paperback_cover(meta, pages, cover_pdf, DIST / "paperback-cover-preview.png")
    print(f"Paperback cover:  {cover_pdf.relative_to(ROOT)} "
          f"(spine {info['spine_in']:.3f} in, full size {info['full_w_in']:.3f} x {info['full_h_in']:.3f} in)")

    words = sum(len(p.read_text().split()) for p in (ROOT / "manuscript").glob("*.md"))
    (DIST / "build-info.json").write_text(json.dumps({
        "pages": pages, "words": words, "spine_in": round(info["spine_in"], 4),
        "cover_size_in": [round(info["full_w_in"], 4), round(info["full_h_in"], 4)],
    }, indent=2) + "\n")


if __name__ == "__main__":
    main()
