# Pre-Publication Check Report

Final state: 209 pages (6 x 9 in), about 21,400 words of prose plus code, 28 chapters in five parts, and appendices A to F. Checked in October 2026 on Python 3.12.3, 3.13.5, 3.14.8 and 3.15.0, with numpy 2.5.4, pandas 3.0.6, matplotlib 3.11.2, openpyxl 3.1.5 and pytest 9.1.1 (`requirements.txt`).

## Code and Data

| Check | Result |
| --- | --- |
| Every listing (`tests/run_listings.py`) | 416 checks: 105 listings (including 29 solution files and the Chapter 19 pytest run), each on 4 Python versions; 0 failures. Output compared with the printed `.out` file |
| Datasets (`tests/check_data.py`) | `make_data.py` regenerates all 10 files byte for byte identical on all 4 versions |
| Line widths (`tests/check_widths.py`) | Every code and output line fits in 76 characters, so nothing wraps in print |
| Manuscript (`tests/check_manuscript.py`) | 211 included files resolve; every listing in `code/` is printed somewhere; the folder tree matches `code/`; 0 problems |
| Charts | All 13 charts are drawn at build time by the printed listings (`build/figures.py`), in a print-friendly style |
| Front cover program (`tests/check_cover_code.py`) | Prints exactly the output shown on the cover, on all 4 versions |
| Style | `ruff format` (76 columns) and `ruff check`: listings and tests clean |
| Network | No listing calls the internet; databases are SQLite in memory or local files |

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.786 in (KDP minimum 0.5 in); smallest outside margin 0.593 in; every chapter, part and appendix starts on a right-hand page; no large gaps |
| Visual proof | All 209 pages inspected; two tables with an escaped `\|` fixed in the parser, one badly spaced justified line reworded |
| Paperback cover | 12.721 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.471 in spine (209 x 0.002252); barcode area clear |
| eBook covers | Dark (`ebook-cover.jpg`) and white (`ebook-cover-white.jpg`), 1600 x 2560 px; no logos |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool, en-US) | Remaining flags reviewed: false positives around code and deliberate style |
| Facts checked against primary or published sources (October 2026) | Reinhart-Rogoff and Herndon, Ash and Pollin (2013); Public Health England's 15,841 missed cases (October 2020); gene names converted by Excel (Ziemann et al. 2016) and the HGNC renames (2020); Berkeley admissions (Bickel et al. 1975); the Challenger O-ring chart (Rogers Commission, Tufte and his critics); WHO 2021 PM2.5 guideline; Net Promoter Score (Reichheld 2003; Keiningham et al. 2007); origin of pandas (2008, open-sourced 2009); the bootstrap (Efron 1979); Anscombe's quartet (1973); Excel worksheet limits. See `research/facts.md` and Appendix E |
| Copyright | All text and code written for this book; no copied text |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit) |
| Not verified here | Running on Windows and macOS (the commands for those systems follow the official documentation); Excel itself (Excel files are written and read with openpyxl) |
