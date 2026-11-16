# Claude AI for Small Business

**100 Ready-to-Use Workflows to Automate Emails, Marketing, Admin and Customer Service, No Coding Needed**

by Aadhavan Muthurengan

## Files to upload (`dist/`)

| File | Use |
| --- | --- |
| `claude-ai-for-small-business.epub` | Kindle eBook manuscript |
| `ebook-cover.jpg` | Kindle cover (1708 x 2562 px) |
| `paperback-interior-6x9.pdf` | Paperback interior (219 pages, black and white) |
| `paperback-cover.pdf` | Paperback wrap cover (12.743 x 9.250 in, spine 0.493 in) |
| `paperback-cover-preview.png` | Preview only, not for upload |

Listing details (title, description, categories, keywords, prices) are in `metadata/kdp-listing.md`. Checks are in `tests/CHECKS.md`.

## Bonus files (`bonus/`)

Generated from the manuscript on every build, so they always match the book: `Prompt-Library.md`, `Prompt-Library.txt`, `Workflow-Index.csv` and eight fill-in templates. Host these at the address set as `bonus_url` in `book.json`; Appendix A prints that address.

## Build

```
python3 build/build.py      # bonus files, EPUB, interior PDF, covers
python3 build/check_pdf.py  # margins, fonts, chapter starts, gaps
```

Needs Python 3 with reportlab, ebooklib, cairosvg, Pillow and PyMuPDF, and the Playfair Display fonts (in `fonts/`, OFL) installed for cairosvg.

## Structure

- Part I (Chapters 1 to 4): setup, prompts, ground rules
- Part II (Chapters 5 to 14): the 100 workflows
- Part III (Chapters 15 to 19): toolkit, connectors, 30-day plan, quick-starts by business type, troubleshooting
- Appendices: A bonus files, B workflow index, C glossary, D quick reference, E worksheets (paperback only)
