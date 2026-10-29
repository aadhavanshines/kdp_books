# Data Structures and Algorithms in Python, Hands-On

*Every Structure Built, Tested and Timed, with Interview Patterns, Exercises and Solutions*, by Aadhavan Muthurengan.

The code and chapter notebooks are published for readers at [github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on](https://github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on); copy changes to `code/` there too, and rebuild the notebooks.

Thirty-four chapters in seven parts, from Big O and timing to the interview patterns and an LRU cache project. Every listing is a real file in `code/`, run on Python 3.12, 3.13, 3.14 and 3.15 with the pinned packages in `requirements.txt`, and the manuscript pulls code and output from those files at build time, so the printed code is the tested code. Benchmark tables and charts come from one recorded run of the printed benchmark listing.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter. `@include` lines pull listings and their outputs from `code/`. |
| `code/ch01` to `code/ch33` | Every listing (`.py`), its recorded output (`.out`), pytest commands (`.cmd`), benchmark markers (`.runonly`) and exercise solutions (`solution_*`). |
| `code/common/bench.py` | The timing module from Chapter 3; each chapter folder that uses it has a copy (`tests/sync_common.py`). |
| `tests/` | The checks. See `tests/CHECKS.md`. |
| `build/` | The build pipeline: Markdown parser, chart figures, PDF interior, EPUB, covers. |
| `research/` | Sources for the real-world uses and facts. |
| `metadata/` | KDP listing details ($12.99 Kindle in KDP Select, $24.99 paperback). |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Check the code

One virtual environment per Python version in `.venvs/py3.12` to `.venvs/py3.15` (not committed; `tests/setup_venvs.sh` makes them with uv). Then:

```
python3 tests/run_listings.py          # every listing, on every version (benchmarks in quick mode)
python3 tests/check_widths.py          # no code or output line is wider than the printed page
python3 tests/check_manuscript.py      # printed code is tested code; nothing tested is left out
python3 tests/sync_common.py --check   # every copy of bench.py and the shared modules is current
python3 tests/check_cover_code.py      # the program on the front cover prints what it shows
python3 tests/check_notebooks.py       # every chapter notebook matches the listings and runs
.venvs/py3.15/bin/python tests/make_notebooks.py   # rebuild code/chNN/chNN.ipynb after changing a listing
python3 tests/record_benchmarks.py     # re-record benchmark tables and charts (Python 3.15)
python3 tests/record_versions.py       # re-run Chapter 33's suite on all four versions
python3 tests/run_listings.py --record # re-record .out files after changing a listing
```

## Build

```
python3 build/build.py                 # draws the charts, then writes dist/
python3 build/check_pdf.py             # margins, page starts, gaps, missing glyphs
python3 ../tools/white_covers.py dsa-hands-on   # white-background eBook cover
```

All people, towns, companies and data in the examples are fictional.
