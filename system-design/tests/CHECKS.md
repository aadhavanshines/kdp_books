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
| `build/check_pdf.py` | 263 pages at release, 279 after the 23 October revision; margins within KDP limits; 51 TOC entries; no chapter starts on a left-hand page; no gap over 2.5 in before a chapter ends |
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

## Revision: real-world stories and more pictures (23 October 2026)

Added after a review asked for real-life examples, interesting facts, real-world issues and more pictures.

- **Real-World Story and Interesting Fact boxes** (29 in Chapters 0 to 34), **Chapter 37, "Lessons From Real Outages"** (eight incidents, from AWS S3 in 2017 to Atlassian in 2022), and **Appendix F**, which lists a source for every box. Every fact was checked against the company's own postmortem, paper or statement, or contemporary reporting where none exists; the checks are logged in `research/facts.md`. Figures the sources didn't confirm (GitLab's data size, a Ticketmaster user count) were left out, and contested claims are marked as such (Google's 2006 latency experiment).
- **Seven new pictures:** six charts drawn by `build/charts.py` (LRU hit rate against cache size, the retry storm with and without jitter, the latency histogram with mean and percentiles, adaptive bitrate over time, Pokémon GO's planned and actual traffic, and how long eight outages lasted) and one diagram (staged rollout). The four model charts are computed at build time from the tested models, through small data helpers (`retry_slots`, `sample_latencies`, `timeline`) that have their own consistency tests.
- **Harness fix:** printed examples now show sets in sorted order. One example (Chapter 22) printed a set whose order depended on string hashing, so `make_examples.py --check` could report it as stale on some runs.
- After the revision: all 58 model files pass on Python 3.12 to 3.15 (`--cases 2000`); `make_examples.py --check` reports 0 stale files; ruff, EPUBCheck (0 errors, 0 warnings), `check_pdf.py` (279 pages, 51 TOC entries) and codespell are clean; LanguageTool's new hits were reviewed and fixed; all new pages were rendered and reviewed visually.

## Editorial review fixes (23 October 2026)

An outside review of the 279-page PDF was checked point by point.

- **Missing superscript glyph (confirmed, three places).** The body fonts have no superscript zero (⁰), so "2¹⁰" printed as "2¹" in Appendix A, "0.98⁵⁰" as "0.98⁵" in Chapter 15, and "10¹⁰" as "10¹" in Chapter 33. The source text was right; the PDF builder now prints superscripts as raised ordinary digits, and `build/check_pdf.py` fails if any page contains a character the fonts can't draw.
- **`daily_to_qps` (confirmed).** Chapter 3's examples called a wrapper the book never showed; its three-line definition is now printed before the examples.
- **Chapter 2 time budget (confirmed).** Steps 1 to 5 added up to 26 to 30 minutes, against a 25-minute target. The budget is now 5, 3 to 5, 3, 2 to 3 and 10 minutes (23 to 26), with deep dives 12 to 15; the table, the framework diagram, Chapter 3 and Appendix C were updated together.
- **Precision added where the review asked:** estimates labeled as first-order with their assumptions (Chapter 3); decimal units stated explicitly, with binary units shown in Appendix A; quorum model assumptions and why quorum overlap isn't linearizability (Chapter 8); what "never lost" requires of the broker and producer (Chapter 10); what cursors don't guarantee (Chapter 4); unique machine IDs as a hard requirement for Snowflake IDs (Chapter 12); a scoring table and a "what would have raised the rating" note for each mock interview (Chapter 36).
- After the fixes: 281 pages; all 58 model files pass on Python 3.12 to 3.15; 0 stale examples; EPUBCheck clean; `check_pdf.py` clean, including no undrawable characters; every "Chapter N" reference points to an existing chapter; changed pages reviewed visually.
