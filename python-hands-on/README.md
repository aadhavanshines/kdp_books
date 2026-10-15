# Python Programming Hands-On

*Learn Python from Basic to Advanced by Writing Real Programs, with Exercises, Solutions and Every Example Tested*, by Aadhavan Muthurengan.

Twenty-seven chapters from a first `print` to a SQLite app, data analysis, a FastAPI web API and automation scripts. Every listing is a real file in `code/`, run on Python 3.12, 3.13, 3.14 and 3.15, and the manuscript pulls code and output from those files at build time, so the printed code is the tested code.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter. `@include` lines pull listings and their outputs from `code/`. |
| `code/ch01` to `code/ch26` | Every listing (`.py`), its recorded output (`.out`), typed input (`.in`), arguments (`.args`), commands (`.cmd`), shell sessions (`.txt`), data files and exercise solutions (`solution_*`). |
| `code/appendix/` | Shell sessions for the cheat sheet and the common-errors appendix. |
| `tests/` | The checks: `run_listings.py`, `check_packaging.py`, `check_manuscript.py`, `check_cover_code.py`. See `tests/CHECKS.md`. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams. |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Check the code

One virtual environment per Python version in `.venvs/py3.12` to `.venvs/py3.15` (not committed), each with `requirements.txt` installed. Then:

```
python3 tests/run_listings.py         # every listing and session, on every version
python3 tests/check_packaging.py      # Chapter 17 package: install, run, test, build a wheel
python3 tests/check_manuscript.py     # printed code is tested code; nothing tested is left out
python3 tests/check_cover_code.py     # the program on the front cover prints what it shows
python3 tests/run_listings.py --record   # re-record .out files after changing a listing
```

## Build

```
python3 build/build.py                # writes dist/
```

All people, books and figures in the examples are fictional. Email addresses use the reserved `.example` domain.
