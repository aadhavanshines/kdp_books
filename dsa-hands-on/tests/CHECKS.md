# Pre-Publication Check Report

Final state: 406 pages (6 x 9 in), about 46,900 words including code, 34 chapters in seven parts, and appendices A to E. Checked on 28 October 2026 on Python 3.12.3, 3.13.5, 3.14.8 and 3.15.0, with pytest 9.1.1 and matplotlib 3.11.2 (`requirements.txt`).

## Code

| Check | Result |
| --- | --- |
| Every listing (`tests/run_listings.py`) | 972 checks: 243 listings (including 77 exercise solutions and the pytest runs), each on 4 Python versions; 0 failures. Output compared with the printed `.out` file; benchmarks run in quick mode |
| Test method | Every structure and pattern solution is checked against a built-in, a brute force or a model on random inputs (seed 2026) |
| Benchmarks (`tests/record_benchmarks.py`) | Recorded on Python 3.15 with interleaved rounds; each printed table and its chart come from the same run |
| Version comparison (`tests/record_versions.py`) | Chapter 33's suite, 3 passes in rotation over the 4 versions, fastest time kept |
| Line widths (`tests/check_widths.py`) | Every code and output line fits in 76 characters |
| Manuscript (`tests/check_manuscript.py`) | 449 included files resolve; every listing is printed somewhere; the doctest session runs on 4 versions; 0 problems |
| Shared files (`tests/sync_common.py --check`) | Every copy of `bench.py` and the shared modules is current |
| Front cover program (`tests/check_cover_code.py`) | Prints exactly the output shown on the cover, on all 4 versions |
| Style | `ruff format` (76 columns) and `ruff check`: clean |

## Book

| Check | Result |
| --- | --- |
| EPUBCheck 5.1 | 0 fatals, 0 errors, 0 warnings |
| Interior PDF (`build/check_pdf.py`) | All fonts embedded; no missing glyphs; smallest inside margin 0.786 in; smallest outside margin 0.579 in; every chapter, part and appendix starts on a right-hand page; no large gaps |
| Visual proof | Sample pages of the new chapters, cheat-sheet tables and sources table inspected |
| Paperback cover | 13.164 x 9.250 in, 0.914 in spine (406 x 0.002252); barcode area clear |
| eBook covers | Dark and white, 1600 x 2560 px; no logos |
| Spelling (codespell) | Clean (the only flag is "O(ND)", the name of Myers' algorithm) |
| Facts | 44 facts checked against primary or published sources; see `research/facts.md` and Appendix E |
| Trademarks | No other book or series named in the title, subtitle, description or keywords; trademark notice on the copyright page |
| Copyright | All text and code written for this book; no copied text |
| Privacy | The author's personal email address appears nowhere in the book or repository (checked before every commit) |
| Not verified here | Windows and macOS (the code is pure Python with no platform-specific calls); the JIT and free-threaded builds (Chapter 33 uses default builds) |
