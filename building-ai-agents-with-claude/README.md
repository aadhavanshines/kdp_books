# Building AI Agents with Claude

*A Beginner's Guide to Agents That Use Tools, Remember, and Get Real Work Done, from Your First Agent to Production*, by Aadhavan Muthurengan.

Nine real agents for one fictional business, Amudha's Home Bakes, built with the Claude Agent SDK for Python (verified on version 0.2.164) and checked by code.

## Folders

| Folder | Contents |
| --- | --- |
| `manuscript/` | The book in Markdown, one file per chapter. `@include` lines pull code and real outputs from `projects/` at build time, so the printed code is the tested code. |
| `projects/` | The nine agents (`01-pantry-chef` to `09-shopmate`), each with its graders, recorded runs (`evals/`) and sample data. |
| `tests/` | Offline tests (`pytest tests`), `verify_all.py` (runs every agent once and grades it), the model comparison, and the price table. |
| `build/` | The build pipeline: Markdown parser, PDF interior, EPUB, covers, diagrams, terminal and browser screenshots. |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook cover, paperback interior PDF, paperback cover PDF. |

## Run an agent

```
cd projects/02-inbox-triage
pip install claude-agent-sdk rich
export ANTHROPIC_API_KEY=...
python agent.py
python grade.py
```

Each chapter lists any extra packages. All data is fictional; email and web addresses use reserved `.example` domains.

## Check and build

```
python3 -m pytest -q tests          # offline checks, no API calls
python3 tests/verify_all.py         # runs every agent for real (about 1 US dollar)
python3 build/build.py              # writes dist/
```

`tests/CHECKS.md` lists the checks run before release.
