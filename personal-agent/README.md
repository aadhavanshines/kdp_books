# Build Your Own AI Personal Agent

*An Always-On Assistant That Chats Where You Do, Remembers, Learns Skills, Works on a Schedule and Runs Safely in a Sandbox, Built and Tested End to End in Python*, by Aadhavan Muthurengan.

The book builds **Sparrow**, a personal agent in the style of OpenClaw (gateway, channels, Markdown workspace memory, skills, heartbeat) with the safety layer that NemoClaw and OpenShell add (sandbox, egress policy, credential injection, privacy routing, approvals, audit log). Claude is the brain, through the Claude Agent SDK. Every line of Sparrow's code is printed in the book, pulled from the tested files at build time; `build/check_book.py` proves it.

The code is published for readers at [github.com/aadhavanshines/build-your-own-ai-personal-agent](https://github.com/aadhavanshines/build-your-own-ai-personal-agent); copy changes to `sparrow/`, `tests/`, `evals/`, `deploy/` and `examples/` there too.

## Folders

| Folder | Contents |
| --- | --- |
| `sparrow/` | The agent: gateway, brain, tools, memory, skills, scheduler, channels, safety layer, templates. |
| `tests/` | 161 unit, functional, security and robustness tests with a scripted brain (no API key needed). |
| `evals/` | Real-model evaluations (16 scenarios x 3 runs), the system test, the benchmark, and their recorded results. |
| `deploy/` | systemd user service, Dockerfile and run script. |
| `examples/` | The first Agent SDK example from Chapter 4. |
| `transcripts/` | Recorded real sessions and outputs included in the book. |
| `manuscript/` | The book in Markdown. `@include` lines pull code and recorded output from the files above. |
| `build/` | Build pipeline: parser, PDF interior, EPUB, covers, diagrams, screenshot and transcript recorders, checks. |
| `metadata/` | KDP listing details. |
| `dist/` | Upload-ready files: EPUB, eBook covers (dark and white), paperback interior PDF, paperback cover PDF. |

## Check and build

```
pip install -r requirements.txt     # in a Python 3.12+ virtual environment
pytest                              # 161 tests, about 25 seconds
python evals/run_evals.py           # real model, about US$0.50
python evals/system_test.py         # real process, crash and restart
python evals/benchmark.py           # Sparrow's own overhead

python3 build/check_book.py         # every Sparrow line printed; widths fit
python3 build/build.py              # dist/: EPUB, PDF interior, covers
python3 build/check_pdf.py          # margins, chapter starts, gaps, glyphs
```

Results from the recorded runs: 160/161 tests on Python 3.12 to 3.15 (1 Mac-only test skipped on Linux); 48/48 real-model runs (US$0.5213); system test 11/11; benchmark about 7 ms per message. The tests also run on macOS in the public repository's CI.

`build/webchat_shots.py` and `build/transcripts.py` re-record the screenshots and terminal sessions with the real model (a few US cents).
