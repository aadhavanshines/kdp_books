# AI Made Easy for Seniors

*A Large-Print, Step-by-Step Guide to Asking an AI Assistant Anything — Write Emails, Plan Trips, Check Health Questions, Learn New Hobbies and Spot Scams, on Your Phone or Computer*, by Aadhavan Muthurengan. Large-print 8.5 x 11 in paperback (145 pages, $14.99) and Kindle eBook ($6.99).

Sixteen short chapters in four parts (Getting Started, Everyday Help, Staying Safe, Going Further), plus 100 ready-to-use questions, a plain-English word list and a quick reference page.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown; `images/` holds the illustrations (`ill-*.jpg`) and the generated figures (`fig-*.png`). |
| `build/` | The pipeline adapted for large print: `interior_pdf.py` (16 pt Atkinson Hyperlegible, 8.5 x 11 in), `epub_build.py`, `figures.py` (phone-style example conversations), `covers.py` (wrap cover and eBook cover), `check_pdf.py`, `build.py`. |
| `art/` | `cover-front.jpg`: the painted cover scene (AI image model on Higgsfield, upscaled to 3072 x 4096). |
| `fonts/` | Atkinson Hyperlegible (Braille Institute, SIL Open Font License 1.1). |
| `metadata/` | KDP listing details. |
| `tests/` | `CHECKS.md`. |
| `dist/` | Upload-ready EPUB, eBook cover, paperback interior and wrap cover. |

## Build

```
pip install reportlab ebooklib pillow pymupdf cairosvg
cp fonts/*.ttf ~/.fonts/ && fc-cache -f
python3 build/build.py
python3 build/check_pdf.py
```
