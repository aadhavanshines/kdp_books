---
name: ship-check
description: Pre-commit checklist. Runs tests, scans changes for debug leftovers, and checks docs match the code.
disable-model-invocation: true
allowed-tools: Bash(pytest *) Bash(python -m pytest *) Bash(.venv/bin/python -m pytest *) Bash(git status *) Bash(git diff *) Read Grep
---

# Ship check

Run these steps in order, then give the verdict.

1. **Tests**: run `python -m pytest` with the project's `.venv` Python if it exists. Report pass/fail counts and any failures.
2. **Changed files**: run `git status --short` and list the files (staged, unstaged, untracked).
3. **Debug leftovers**: look only at the changed lines (`git diff HEAD`) and new untracked files for `print(`, `console.log`, `debugger`, `breakpoint()`, `TODO`, and `FIXME`. Report each with file and line.
4. **Docs match code**: if routes, request/response fields, or streak rules changed, compare `app.py` with `README.md` (endpoint summary) and `SPEC.md` (features, streak rules, API). Report anything out of date.
5. **Verdict**: end with one line, either **Ready to commit** or **Not ready**, followed by a short list of what must be fixed. Failing tests, debug code, or stale docs mean Not ready.

Keep the report short. Do not edit any files.
