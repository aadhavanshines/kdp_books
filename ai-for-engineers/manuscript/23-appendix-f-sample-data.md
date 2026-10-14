# Appendix F: The WLC-200 Sample Data and Generator Scripts

Everything about Ardent Drive Systems and the WLC-200 is fictional, created for this book: the company, the product, its people, requirements, tests, logs, defects, analyses and lessons. No real company's document and no standard's text was used. The files are in `projects/wlc200`.

## Folders

| Folder | Contents | Used in |
| --- | --- | --- |
| `spec/` | The System Requirements Specification, version 1.2 (36 requirements) and version 1.3 (34 requirements) | Chapters 5, 6, 7 |
| `tests/` | The test suites for version 1.2 (36 test cases) and version 1.3, with requirement traces | Chapters 7, 14 |
| `hil/2026-10-06/` and `hil/2026-10-07/` | Two nights of HIL bench logs: twelve runs each, a manifest per night; `hil/limits-v1.3.json` holds the limits | Chapters 8, 9, 15 |
| `defects/` | Thirty defect reports, with seven duplicates | Chapters 10, 15 |
| `fmea/` | The DFMEA structure and functions, existing controls, and the company's rating scales | Chapter 11 |
| `knowledge/` | Five lessons learned, two test procedures and the bench guide | Chapters 7, 8, 11, 12 |
| `testdb/` | `wlc200.db`, a SQLite database: test cases, ten nights of results, defects | Chapters 9, 14, 15 |
| `labels/` | The engineer's answers for every project, adjudications and recorded corrections | Every project's grader |
| `data/` | The scripts that generate the logs, the defects and the database | This appendix |

> **Warning:** The `labels` folder holds the answers. Never put it where a tool under test can read it. Project 4's `prepare.py` copies only the inputs into Claude Code's workspace for this reason.

## The Planted Problems

The data contains deliberate problems, so each tool has something real to find:

- **Specification v1.2:** a conflict (45 s and 60 s), two ambiguous requirements, an untestable one, a missing value, a compound requirement, a duplicate and a process requirement (Chapter 5).
- **Specification v1.3:** seven changes of meaning, three additions, five deletions and one change of wording only (Chapter 7).
- **Night of 6 October (software 2.4.0-rc3):** a late pinch stop when cold (14 ms against 10 ms), a missing CAN frame (112 ms gap), one opening above 140 °C, and passing runs close to their limits (Chapter 8).
- **Night of 7 October (software 2.4.0-rc4):** the CAN and thermal faults fixed, the cold pinch fault still present (13 ms), and a new late stop at 16 V (12 ms, with a peak force of 103.2 N) (Chapters 8 and 15).
- **Defects:** seven duplicates written in different words, and severities from S1 to S4 (Chapter 10).
- **Knowledge:** fifteen answerable questions and three that the documents can't answer (Chapter 12).

## The Generators

The logs are produced by a simple simulation of the window, the motor, the pinch rod and the controller, with measurement noise and the faults above:

```
python data/make_hil_logs.py     # both nights and their truth files
python data/defects_source.py    # defects.json and the defect labels
python data/make_testdb.py       # the v1.3 test suite and wlc200.db
```

The truth files for the logs are measured from the generated samples with the same method as the test procedures, not taken from the simulation's settings. Chapter 8 explains why: the first version used a set value, and the analyzer measured the noisy log correctly where the truth file didn't.

## Corrections

`labels/TRUTH-CORRECTIONS.md` records every change made to an answer file after a tool's output disagreed with it, with the original value and the reason. There are four: one measurement (Chapter 8), one adjudication of review labels (Chapter 5), one key phrase in the knowledge questions (Chapter 12) and the FMEA keyword list, which was made stricter (Chapter 11).

## Reusing the Data

You may use the WLC-200 data to learn, teach and test your own tools. It's small enough to read in an afternoon and has known answers for every task, which makes it a useful benchmark when you try a new model or prompt. Replace it with your own data, and write your own labels, before trusting a tool with real work.
