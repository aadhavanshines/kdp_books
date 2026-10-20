# Release Checks: The Coding Interview Playbook

Run on 19 October 2026 before release, and again on 20 October 2026 after the full technical audit below.

| Check | Result |
| --- | --- |
| `tests/run_problems.py --cases 20000`, and `--cases 5000` with seeds 1, 2 and 3 | 0 failures |
| `tests/run_all_versions.sh --cases 2000` | 128 code files (120 problems, 7 Python toolkit demos, 1 design example), 0 failures on Python 3.12.3, 3.13.14, 3.14.8 and 3.15.0 |
| `tests/make_examples.py --check` | Every printed example and demo output matches the code (0 stale files) |
| `tests/run_translations.sh` | Java (javac 21) and C++ (g++ 13, `-Wall -Werror`) translations print the expected output |
| `tests/check_cover_code.py` | The program on the front cover runs and prints `[1, 3]`, as shown |
| `ruff check` and `ruff format --check` (code, tests) | Clean, line length 76 |
| EPUBCheck 5.1.0 | 0 fatals, 0 errors, 0 warnings |
| `build/check_pdf.py` | 279 pages; margins within KDP limits; 40 TOC entries; no chapter starts on a left-hand page |
| codespell | Clean (one intentional hit: the prefix `"stap"` in an autocomplete example) |
| LanguageTool (en-US) | Reviewed; real issues fixed, remaining hits are false positives such as `O(n)` spacing and the variable `i` |
| Personal email search | Not present anywhere in the book or repository |

## How the tests work

Each problem file defines `SOLUTIONS` (the book's solution first, then a brute-force or reference version), `EXAMPLES` with expected results, and usually `random_case`. The harness checks every solution against the examples, then compares all solutions on thousands of random inputs. Design problems replay random sessions of operations against a simple reference class. Where no simpler reference exists, a property is checked instead: for the config diff (Problem 23.6), applying the computed changes to the old configuration must produce the new one.

Bugs these tests caught while the book was written, both described in the text: `has_prefix("")` on an empty trie returned True (Problem 20.1), and a hand-computed expected value for the telemetry example was wrong (Problem 23.2).

## Originality

All problem statements, stories and example inputs were written for this book. Example inputs that resembled well-known published examples were replaced with new ones during review.

## Technical audit (20 October 2026)

A second, systematic pass over every problem, after an editorial review asked for one.

**Solutions.** Every problem file was run with 20,000 random cases (ten times the release setting) and with three further random seeds, on top of the four Python versions. Every problem has at least two independent solutions or a property check, except Safe Queens, whose examples are checked against a brute force and whose test checks all ten known counts for n = 1 to 10. Two tests were strengthened: the "is it possible" formula in Problem 13.6 is now checked against trying every arrangement, and the buggy `has_prefix` shown in Chapter 27 is now tested to fail exactly as the text says.

**Complexity statements.** Every "Complexity" line and every inline cost claim in Chapters 5 to 23 and 28 was checked by hand against the code it describes. Corrected:

- 6.5: `sorted(a + b)` is not O(N log N) in Python; Timsort merges the two sorted runs in linear time.
- 9.3: division used `int(a / b)`, which goes through floating point and is wrong above about 2^53; it is now exact integer arithmetic, with a test on 10^20.
- 13.2: bucket sort avoids the heap but still sorts tied tags; wording fixed.
- 13.5: "O(n)" used n for two things; now "O(number of tasks)".
- 14.4: O(1) extra space ignored the sorted copy; now stated.
- 15.5: the text said the tests check n = 1 to 10; they now do.
- 15.6: Catalan growth stated precisely (4^n divided by n times the square root of n).
- 17.3: union-find with path compression alone is O(n log n) worst case; "nearly O(n)" needs union by size, now explained.
- 7.2: "as written below" referred to code that wasn't there; reworded.

**Prose figures and cross-references.** Every "Problem X.Y" and "Chapter N" reference (about 200) was checked against the title and content it points to; all were correct. Every numeric example in the prose (bit operations table, estimates in Chapter 25, the 300-million-call figure, 62^7, `math.comb(8, 2)`) was recomputed.

**Facts.** Company claims were re-checked against current sources. Meta's hiring page confirms the authorized AI assistant for select roles. Amazon's "half Leadership Principles, half coding and system design" comes from its SDE III prep page, so Chapters 1 and 26 now say that instead of applying it to all software roles. The Google in-person interview source now cites Sundar Pichai's June 2025 podcast remarks.

**Print check.** All 279 pages were rendered and reviewed visually, and checked automatically for text or images outside the safe area, Markdown leaking into the output, headings stranded at the bottom of a page, and nearly empty pages. Fixed: a figure that floated into the middle of a code block (Chapter 24), a dialogue whose lines ran together in one box (Chapter 2), and two pages holding a single overflow bullet. Blank pages are the intended left-hand pages before chapter openings.
