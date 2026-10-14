# AI for Engineers

*Automate Product Development and Validation with Claude: Requirements, Test Cases, FMEA, Test Logs and Reports, from Your First Prompt to Production Tools*, by Aadhavan Muthurengan.

Ten real tools for one fictional product, the WLC-200 smart window-lift controller of Ardent Drive Systems, built with the Claude Agent SDK for Python (verified on version 0.2.164) and Claude Code, and checked by code against an engineer's answers.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter. `@include` lines pull code and real outputs from `projects/` at build time, so the printed code is the tested code. |
| `projects/wlc200/` | The fictional engineering record: specifications, test suites, HIL logs, defects, FMEA inputs, knowledge base, test database, and the answers (`labels/`). See its README. |
| `projects/p01-...` to `p10-...` | The ten projects, each with its grader and recorded runs (`output/`). `common/` holds the shared helper and price table. |
| `tests/` | Offline tests of every project's checks (`python3 -m pytest -q tests`), and the price table. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams. |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers, paperback interior PDF, paperback cover PDF. |

## Run a project

```
cd projects
pip install claude-agent-sdk pandas matplotlib python-docx openpyxl mcp pytest
export ANTHROPIC_API_KEY=...
cd p01-req-review
python review.py ../wlc200/spec/WLC-200-SRS-v1.2.md
python grade.py output/review-WLC-200-SRS-v1.2.json
```

All data is fictional. Keep `projects/wlc200/labels` away from any tool under test.

## Check and build

```
python3 -m pytest -q tests          # offline checks, no API calls
python3 build/build.py              # writes dist/
```

`tests/CHECKS.md` lists the checks run before release.
