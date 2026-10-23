# The System Design Interview Playbook

*A Step-by-Step Framework, 20 Worked Designs, Tested Building Blocks and Mock Interviews to Prepare for Senior Engineering Interviews at Top Tech Companies*, by Aadhavan Muthurengan.

Thirty-nine chapters in four parts. Part I: what the system design round evaluates (from companies' published guidance where it exists), a seven-step framework, back-of-the-envelope estimation, and networking and APIs. Part II: eleven building-block chapters, from scaling out and caching to replication, partitioning, queues, rate limiting, IDs and clocks, probabilistic data structures, reliability, and observability and security. Part III: twenty complete worked designs. Part IV: four full mock interviews, lessons from eight real outages, common mistakes and study plans. Appendices: numbers cheat sheet, building-blocks reference, one-page template, design index, glossary, sources for the real-world stories. "Real-World Story" and "Interesting Fact" boxes throughout tie the ideas to published incidents and designs, each checked against the company's own postmortem, paper or statement (`research/facts.md`). Status as of October 2026.

The designs are generic teaching designs; none is claimed to describe any company's systems, and no prompt is claimed to have been asked by any company.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter; `images/` holds the generated diagrams. Code and example output are pulled in with `@include` lines. |
| `code/` | Runnable Python models of the building blocks (such as `ch09/b01_hash_ring.py`), the design components (such as `ch29/d01_ledger.py`) and the estimates for each design (`chNN/estimate.py`), each with examples, a reference check and a random-case generator. `common/estimates.py` holds the estimation helpers. `*.examples.txt` and `*.demo.txt` are generated from the code. |
| `tests/` | `run_problems.py` (test harness), `run_all_versions.sh` (Python 3.12 to 3.15), `make_examples.py` (regenerates printed output), `check_cover_code.py`, and `CHECKS.md`, the report of the release checks. |
| `research/` | `facts.md`: interview-process sources, the papers behind the building blocks, and the originality policy. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams (`diagrams.py` draws all 31) and charts (`charts.py` plots 6, computed from the tested models or from published incident figures). |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Test and build

```
tests/run_all_versions.sh --cases 2000      # every model on Python 3.12-3.15
python3 tests/make_examples.py --check      # printed output matches the code
python3 tests/check_cover_code.py           # the program on the cover
python3 build/build.py                      # diagrams, EPUB, interior PDF, covers
python3 tools/white_covers.py               # (from the repo root) white eBook covers
```
