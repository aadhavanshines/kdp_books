# The Coding Interview Playbook

*120 Original Problems with Tested Python Solutions, Patterns, System Design and Mock Interviews to Prepare for Top Tech Company Interviews*, by Aadhavan Muthurengan.

Twenty-nine chapters in four parts. Part I: how large tech companies interview (from their own published guidance), a six-step problem-solving method, Big-O, and Python for interviews. Part II: eighteen pattern chapters with 109 problems, from arrays and hashing to graphs, dynamic programming, tries, bits and data-structure design. Part III: practical coding rounds, object-oriented design, system design, behavioral interviews, and AI-assisted, take-home and online-assessment formats. Part IV: four full mock interviews and study plans. Appendices: pattern cheat sheet, complexity reference, Python to Java and C++, problem index, glossary. Status as of October 2026.

Every problem is original; none is claimed to have been asked by any company.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter; `images/` holds the generated diagrams. Code and example sessions are pulled in with `@include` lines. |
| `code/` | One file per problem (`chNN/pNN_name.py`): the solutions shown in the book, a brute force or reference version, examples and a random-case generator. `*.examples.txt` and `*.demo.txt` are generated from the code. `appendix_c/` holds the Java and C++ translations. |
| `tests/` | `run_problems.py` (test harness), `run_all_versions.sh` (Python 3.12 to 3.15), `make_examples.py` (regenerates printed examples), `run_translations.sh` (compiles and runs Java and C++), `check_cover_code.py`, and `CHECKS.md`, the report of the release checks. |
| `research/` | `facts.md`: interview-process sources and the originality policy. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams (`diagrams.py` draws all 14). |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Test and build

```
tests/run_all_versions.sh --cases 2000      # every problem on Python 3.12-3.15
python3 tests/make_examples.py --check      # printed examples match the code
tests/run_translations.sh                   # Java and C++ appendix code
python3 build/build.py                      # diagrams, EPUB, interior PDF, covers
python3 tools/white_covers.py               # (from the repo root) white eBook covers
```
