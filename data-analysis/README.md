# Data Analysis with Python, Hands-On

*Clean, Explore, Visualize and Report on Real Data, from Spreadsheets to SQL, with Six Projects, Exercises and Every Example Tested*, by Aadhavan Muthurengan.

The code and data are published for readers at [github.com/aadhavanshines/data-analysis-with-python-hands-on](https://github.com/aadhavanshines/data-analysis-with-python-hands-on); copy changes to `code/` there too.

Twenty-eight chapters in five parts, from a first look at a table to six complete analysis projects. Every listing is a real file in `code/`, run on Python 3.12, 3.13, 3.14 and 3.15 with the pinned packages in `requirements.txt`, and the manuscript pulls code and output from those files at build time, so the printed code is the tested code. Every chart in the book is drawn by the listing printed next to it.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter. `@include` lines pull listings and their outputs from `code/`. |
| `code/data/` | `make_data.py`, which generates every dataset (seed 2026), and the CSV files it writes. |
| `code/ch01` to `code/ch27` | Every listing (`.py`), its recorded output (`.out`), commands (`.cmd`) and exercise solutions (`solution_*`). |
| `tests/` | The checks. See `tests/CHECKS.md`. |
| `build/` | The build pipeline: Markdown parser, chart figures, PDF interior, EPUB, covers. |
| `research/` | Sources for the real-world stories and facts. |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Check the code

One virtual environment per Python version in `.venvs/py3.12` to `.venvs/py3.15` (not committed; `tests/setup_venvs.sh` makes them). Then:

```
python3 tests/run_listings.py          # every listing, on every version
python3 tests/check_data.py            # make_data.py gives identical files on every version
python3 tests/check_widths.py          # no code or output line is wider than the printed page
python3 tests/check_manuscript.py      # printed code is tested code; nothing tested is left out
python3 tests/check_cover_code.py      # the program on the front cover prints what it shows
python3 tests/check_notebooks.py       # every chapter notebook runs and prints the .out files
.venvs/py3.15/bin/python tests/make_notebooks.py   # rebuild code/chNN/chNN.ipynb after changing a listing
python3 tests/run_listings.py --record # re-record .out files after changing a listing
```

## Build

```
python3 build/build.py                 # draws the charts, then writes dist/
python3 build/check_pdf.py             # margins, page starts, gaps, missing glyphs
```

All companies, people, cities, stocks and data in the examples are fictional.
