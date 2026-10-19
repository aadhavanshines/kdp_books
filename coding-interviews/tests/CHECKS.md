# Release Checks: The Coding Interview Playbook

Run on 19 October 2026 before release.

| Check | Result |
| --- | --- |
| `tests/run_all_versions.sh --cases 2000` | 128 code files (120 problems, 7 Python toolkit demos, 1 design example), 0 failures on Python 3.12.3, 3.13.14, 3.14.8 and 3.15.0 |
| `tests/make_examples.py --check` | Every printed example and demo output matches the code (0 stale files) |
| `tests/run_translations.sh` | Java (javac 21) and C++ (g++ 13, `-Wall -Werror`) translations print the expected output |
| `tests/check_cover_code.py` | The program on the front cover runs and prints `[1, 3]`, as shown |
| `ruff check` and `ruff format --check` (code, tests) | Clean, line length 76 |
| EPUBCheck 5.1.0 | 0 fatals, 0 errors, 0 warnings |
| `build/check_pdf.py` | 281 pages; margins within KDP limits; 40 TOC entries; no chapter starts on a left-hand page |
| codespell | Clean (one intentional hit: the prefix `"stap"` in an autocomplete example) |
| LanguageTool (en-US) | Reviewed; real issues fixed, remaining hits are false positives such as `O(n)` spacing and the variable `i` |
| Personal email search | Not present anywhere in the book or repository |

## How the tests work

Each problem file defines `SOLUTIONS` (the book's solution first, then a brute-force or reference version), `EXAMPLES` with expected results, and usually `random_case`. The harness checks every solution against the examples, then compares all solutions on thousands of random inputs. Design problems replay random sessions of operations against a simple reference class. Where no simpler reference exists, a property is checked instead: for the config diff (Problem 23.6), applying the computed changes to the old configuration must produce the new one.

Bugs these tests caught while the book was written, both described in the text: `has_prefix("")` on an empty trie returned True (Problem 20.1), and a hand-computed expected value for the telemetry example was wrong (Problem 23.2).

## Originality

All problem statements, stories and example inputs were written for this book. Example inputs that resembled well-known published examples were replaced with new ones during review.
