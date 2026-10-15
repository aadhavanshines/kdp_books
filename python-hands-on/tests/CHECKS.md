# Pre-Publication Check Report

Final state: 291 pages (6 x 9 in), about 35,600 words including code, 27 chapters in five parts, and appendices A to E. Checked in October 2026 on Python 3.12.3, 3.13.14, 3.14.8 and 3.15.0, with the package versions in `requirements.txt`.

## Code

| Check | Result |
| --- | --- |
| Every listing (`tests/run_listings.py`) | 685 checks: 158 listings and 14 shell sessions, each on 4 Python versions; 0 failures. Output compared with the printed `.out` file; typed input fed from `.in` files and echoed as in a terminal |
| Outputs that legitimately vary | `timeit_demo.py` and `profile_demo.py` print timings, so only a clean run is checked and the book says the numbers are one run's; `debug_me.py` (pdb session) is compared on 3.15, and the book notes that 3.12 stops one line later. Speed claims in the text are checked as ratios by `check_speed.py` and `threads_download.py` |
| Error messages | Tracebacks compared by the text before the error and the final error line; Appendix C's 13 error messages are doctested on all 4 versions |
| Exercises | 38 solution files (and the Chapter 15 test file), all run on all 4 versions; Chapter 19's solution also passes `mypy --strict` |
| Tests inside the book | pytest suites for Chapters 15, 17, 23, 25 and 26 pass on all versions, including a mocked test of the email script's `--send` path (no real mail is sent) |
| Packaging (`tests/check_packaging.py`) | The Chapter 17 package installed with `pip install -e ".[test]"` in a fresh venv on each version: identical transcripts; its wheel builds with `python -m build`, installs and runs |
| Generated data | `make_sales.py` regenerates `sales.csv` byte for byte (checked on 3.12) |
| Manuscript (`tests/check_manuscript.py`) | 339 included files resolve; every listing in `code/` is printed somewhere; every code line typed directly in the text comes from a tested file or is a doctested `>>>` session; the folder tree matches `code/`; the conversion table is evaluated; 0 problems |
| Front cover program (`tests/check_cover_code.py`) | Prints exactly the output shown on the cover, on all 4 versions |
| Style | `ruff format` (76 columns, so no code line wraps in print) and `ruff check`: clean, apart from the deliberate mistakes (`typo.py`, `indent_error.py`, `name_error.py`, `scope.py`) |
| Network | No listing calls the internet; the web API examples run a local server on a free port |

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; smallest inside margin 0.776 in (KDP minimum 0.5 in); smallest outside margin 0.572 in; every chapter, part and appendix starts on a right-hand page; no large gaps |
| Wrapped lines in print | Only 5 lines of program output wrap (Python's own traceback frames in Chapter 10, profiler lines in Chapter 22, one long error message in Appendix C); no code a reader types wraps |
| Paperback cover | 12.905 x 9.250 in = 2 x 0.125 bleed + 2 x 6 in + 0.655 in spine (291 x 0.002252); barcode area clear |
| eBook covers | Dark (`ebook-cover.jpg`) and white (`ebook-cover-white.jpg`), 1600 x 2560 px; no Python logo used |
| Spelling (codespell) | Clean, except the deliberate typo `auther` in Chapter 12 |
| Grammar (LanguageTool, en-US) | Real issues fixed; remaining flags are false positives around code |
| Facts checked against primary sources (October 2026) | Python 3.15.0 release (python.org); Windows Python install manager and the end of the old installer with 3.16 (python.org); free-threaded build supported since 3.14 and not the default (PEP 779); Starlette's `httpx2` deprecation message (read in the installed source) |
| Copyright | All text written for this book; the poem lines in Chapter 9 are by Wordsworth (1807, public domain); all people, books, shops and figures in the examples are fictional; email addresses use `.example` |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit) |
| Not verified here | Running on Windows and macOS (the book's commands for those systems follow the official documentation); sending real email; calling real third-party APIs |
