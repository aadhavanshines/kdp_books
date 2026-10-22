# Release Checks: The System Design Interview Playbook

Run on 22 October 2026 before release. The raw output is in `results/release-checks-2026-10-22.txt`.

| Check | Result |
| --- | --- |
| `tests/run_all_versions.sh --cases 2000` | 58 model files (building blocks, design components and per-design estimates), 0 failures on Python 3.12.3, 3.13.14, 3.14.8 and 3.15.0 |
| `tests/run_problems.py --cases 20000`, and `--cases 5000` with seeds 1, 2 and 3 | 0 failures in all four runs (Python 3.11.15) |
| `tests/make_examples.py --check` | Every printed example and demo output matches the code (0 stale files) |
| `tests/check_cover_code.py` | The program on the front cover runs and prints `(116, 347)` and `20.0 TB/day`, as shown |
| `ruff check` and `ruff format --check` (code, tests) | Clean, line length 76 |
| EPUBCheck 5.1.0 | 0 fatals, 0 errors, 0 warnings |
| `build/check_pdf.py` | 263 pages; margins within KDP limits; 49 TOC entries; no chapter starts on a left-hand page; no gap over 2.5 in before a chapter ends |
| codespell | Clean (intentional hits: the abbreviation "OT", for operational transformation) |
| LanguageTool (en-US) | Reviewed; one real issue fixed (a missing comma), the remaining hits are false positives such as "a write" used as a noun and `O(log n)` spacing |
| Personal email search | Not present anywhere in the book or repository |

## How the tests work

Each model file defines `SOLUTIONS` (the model shown in the book first, then a brute-force or reference version), `EXAMPLES` with expected results, and usually `random_case`. The harness checks every solution against the examples, then compares all of them on thousands of random inputs. Stateful components (caches, the LSM store, rate limiters, the ledger, the booking service, the scheduler) replay random sequences of operations against a simple reference. Where no simpler reference exists, a property is checked instead: quorum reads never return stale data when R + W > N, Bloom filters never give false negatives, Count-Min never underestimates, and operational transformation makes both replicas converge.

Every number the book quotes from a model (load-balancer queue lengths, cache hit rates, keys moved by consistent hashing, retry-storm peaks, percentiles, Bloom filter sizes, HyperLogLog errors, the estimates in Chapters 3 and 16 to 35) is printed by running the code; `make_examples.py --check` fails if any printed output no longer matches.

Bugs these tests caught while the book was written: the geohash neighbor search missed places at high latitudes, where cells are narrower (Chapter 27 now chooses the precision by latitude and explains why), and a retry-storm simulation put every first retry in the same time slot (the model now uses 10 ms slots).

## Originality and claims

All prompts, designs, mock-interview dialogues and example data were written for this book. The designs are generic teaching designs and are not presented as any company's systems; the few historical references (Dynamo, Kafka, Raft, the 2010 Snowflake ID announcement and others) cite their published papers or posts, listed in `research/facts.md`. Company interview practices are described from companies' own career pages where they exist, and marked as reported by candidates otherwise.

## Print check

All diagram pages were rendered and reviewed visually, and every page was checked automatically for text or images outside the safe area, Markdown leaking into the output, headings stranded at the bottom of a page, and nearly empty pages. Fixed during review: several diagram labels overlapping boxes or arrows, a replication arrow in the message-queue diagram that pointed at the wrong follower, and a table whose bold first column broke "Write-through" mid-word (the table builder now measures bold words in the bold font). Blank pages are the intended left-hand pages before chapter openings; the remaining `**` hits are Python exponents in code.
