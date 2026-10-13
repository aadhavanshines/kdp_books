# WLC-200 Sample Engineering Data (fictional)

Everything here is invented for the book *AI for Engineers*: Ardent Drive Systems, the WLC-200 window-lift controller, its people, requirements, tests, logs, defects and lessons. Any resemblance to a real company or product is coincidental.

| Folder | Contents |
| --- | --- |
| `spec/` | The system requirements specification, versions 1.2 and 1.3 |
| `tests/` | The test suites for v1.2 and v1.3, with requirement traces |
| `hil/2026-10-06/` | Twelve HIL bench logs from one night, a manifest, and `hil/limits-v1.3.json` |
| `defects/` | Thirty defect reports |
| `fmea/` | DFMEA structure, functions, existing controls and the company rating scales |
| `knowledge/` | Lessons learned, test procedures and the bench guide |
| `testdb/` | `wlc200.db`, a SQLite database with ten nights of results |
| `labels/` | An engineer's answers, used to grade every project |
| `data/` | The scripts that generate the logs, defects and database |

The `labels/` folder holds the answers. Don't show it to the AI tools you are testing.

To regenerate the generated files:

```
python data/make_hil_logs.py
python data/defects_source.py
python data/make_testdb.py
```
