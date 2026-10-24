# Pre-Publication Check Report

Final state: 216 pages (6 x 9 in), about 21,400 words of prose plus code, 28 chapters in five parts, and appendices A to F. Checked in October 2026 on Python 3.12.3, 3.13.5, 3.14.8 and 3.15.0, with numpy 2.5.4, pandas 3.0.6, matplotlib 3.11.2, openpyxl 3.1.5 and pytest 9.1.1 (`requirements.txt`).

## Code and Data

| Check | Result |
| --- | --- |
| Every listing (`tests/run_listings.py`) | 416 checks: 105 listings (including 29 solution files and the Chapter 19 pytest run), each on 4 Python versions; 0 failures. Output compared with the printed `.out` file |
| Datasets (`tests/check_data.py`) | `make_data.py` regenerates all 10 files byte for byte identical on all 4 versions |
| Line widths (`tests/check_widths.py`) | Every code and output line fits in 76 characters, so nothing wraps in print |
| Manuscript (`tests/check_manuscript.py`) | 211 included files resolve; every listing in `code/` is printed somewhere; the folder tree matches `code/`; 0 problems |
| Charts | All 13 charts are drawn at build time by the printed listings (`build/figures.py`), in a print-friendly style |
| Jupyter notebooks (`tests/check_notebooks.py`) | 27 chapter notebooks, built by `tests/make_notebooks.py` from the tested listings in book order, plus Chapter 2's `first_notebook.ipynb` (from `first_notebook.py`, `# %%` cells). Every code cell matches its .py file; every notebook runs top to bottom on Python 3.12, 3.13, 3.14 and 3.15 with Jupyter (notebook 7.6.3, ipykernel 7.4.0, nbclient 0.11.0); every cell prints exactly the listing's .out file; charts appear only for listings that save one; the example notebook's results match the saved notebook. Rebuilding gives byte-identical notebooks. The Chapter 2 screenshots are of that notebook open in Jupyter Notebook 7.6.3. GitHub Actions run 3 (24 October 2026), with the notebook check added: all four versions passed |
| Front cover program (`tests/check_cover_code.py`) | Prints exactly the output shown on the cover, on all 4 versions |
| Style | `ruff format` (76 columns) and `ruff check`: listings and tests clean |
| Public code repository | github.com/aadhavanshines/data-analysis-with-python-hands-on: the same code and data by chapter, MIT license, with a GitHub Actions workflow that regenerates the datasets and runs every listing on Python 3.12, 3.13, 3.14 and 3.15 after every change. Its first run found that `ch06/sorting.py` printed tied rows in a different order on the GitHub machines: NumPy's fastest sort depends on the processor's instruction set (AVX-512 here). Reproduced locally by switching those instructions off (`NPY_DISABLE_CPU_FEATURES`); the listing now breaks ties by `order_id`, and Chapter 6 explains why. Every listing was then run with AVX-512 on, with it off, and with AVX2 also off: identical output on all three. Run 2 (24 October 2026): all four versions passed |
| Network | No listing calls the internet; databases are SQLite in memory or local files |

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.786 in (KDP minimum 0.5 in); smallest outside margin 0.593 in; every chapter, part and appendix starts on a right-hand page; no large gaps |
| Visual proof | All pages inspected; two tables with an escaped `\|` fixed in the parser, one badly spaced justified line reworded |
| External review (October 2026) | Reported inconsistent indentation in Appendix F's generator. Not reproduced: the code printed on pages 200-205 was extracted from the PDF, is identical to `code/data/make_data.py`, and when run on all 4 versions writes all 10 CSV files byte for byte identical to the book's, with the row counts shown in Chapter 2. Acted on the review's print-size advice: chart text enlarged (labels print at about 8 pt, up from 6.5 pt), and two charts that forced 7 pt text were fixed. A second review repeated the Appendix F report for pages 201-202; measured in the PDF, those lines sit at four spaces inside `shop()`, so the code was correct, but a page that starts mid-function shows no `def` line. `shop()` was split into four short functions (same random calls in the same order, so every dataset is byte for byte unchanged), Appendix F now prints the generator in 12 parts that each start at the left margin, with a note on indentation across pages. The printed code was extracted from the final PDF again, is identical to the source, and run on all 4 versions writes all 10 files identical to the book's |
| Paperback cover | 12.736 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.486 in spine (216 x 0.002252); barcode area clear |
| eBook covers | Dark (`ebook-cover.jpg`) and white (`ebook-cover-white.jpg`), 1600 x 2560 px; no logos |
| Spelling (codespell) | Clean |
| Grammar (LanguageTool, en-US) | Remaining flags reviewed: false positives around code and deliberate style |
| Facts checked against primary or published sources (October 2026) | Reinhart-Rogoff and Herndon, Ash and Pollin (2013); Public Health England's 15,841 missed cases (October 2020); gene names converted by Excel (Ziemann et al. 2016) and the HGNC renames (2020); Berkeley admissions (Bickel et al. 1975); the Challenger O-ring chart (Rogers Commission, Tufte and his critics); WHO 2021 PM2.5 guideline; Net Promoter Score (Reichheld 2003; Keiningham et al. 2007); origin of pandas (2008, open-sourced 2009); the bootstrap (Efron 1979); Anscombe's quartet (1973); Excel worksheet limits. See `research/facts.md` and Appendix E |
| Copyright | All text and code written for this book; no copied text |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit) |
| Not verified here | Running on Windows and macOS (the commands for those systems follow the official documentation); Excel itself (Excel files are written and read with openpyxl) |
