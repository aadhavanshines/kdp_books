# Proof Before Scale

**AI for Business Leaders: A 90-Day Playbook to Choose, Fund, Govern and Scale AI That Pays Back**

by Aadhavan Muthurengan

## Files to upload (`dist/`)

| File | Use |
| --- | --- |
| `proof-before-scale.epub` | Kindle eBook manuscript |
| `ebook-cover.jpg` | Kindle cover (1708 x 2562 px) |
| `paperback-interior-6x9.pdf` | Paperback interior (191 pages, black and white) |
| `paperback-cover.pdf` | Paperback wrap cover (12.680 x 9.250 in, spine 0.430 in) |
| `paperback-cover-preview.png` | Preview only, not for upload |

Listing details are in `metadata/kdp-listing.md`. Checks are in `tests/CHECKS.md`.

## Build

```
python3 build/build.py      # EPUB, interior PDF, covers
python3 build/check_pdf.py  # margins, fonts, chapter starts, gaps
```

Needs Python 3 with reportlab, ebooklib, cairosvg, Pillow and PyMuPDF. Fonts are in `fonts/` (Liberation and DejaVu for the interior; Playfair Display, which must also be installed for cairosvg to draw the cover).

## Structure

- Part I (Chapters 1 to 3): the leader's view
- Part II (Chapters 4 to 7): choosing and funding, including the worked business case
- Part III (Chapters 8 to 14): every function, plus quick-starts for ten industries
- Part IV (Chapters 15 to 21): governance, people, measurement, the 90-day plan, scaling, the board, objections
- Appendices: A templates, B prompts for leaders, C glossary, D worksheets (paperback only)

The running example, Northfield Supply, and all its people and figures are fictional.
