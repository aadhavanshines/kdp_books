# Appendix C: Troubleshooting

Most of these problems happened while the projects in this book were built. Each entry gives the symptom, the likely cause and the fix.

## Setting Up

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'claude_agent_sdk'` (or `pandas`, `docx`, `openpyxl`, `mcp`) | The package isn't installed in the Python you're using, or the virtual environment isn't active | Activate `.venv` (Chapter 2), then `pip install` the package. `python-docx` is imported as `docx` |
| "Not logged in" or "401 API key is invalid" | No key, or a wrong key, in this terminal | Set `ANTHROPIC_API_KEY` again in the terminal that runs the tool |
| "You've hit your limit" or rate-limit errors | The account's usage or rate limit was reached | Wait for the reset time in the message; run fewer jobs at once |
| Certificate errors behind a company proxy | The proxy inspects HTTPS traffic | Set `NODE_EXTRA_CA_CERTS` (and `PIP_CERT` for pip) to your company's certificate bundle |

## Structured Answers

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `ClaudeError: error_max_turns` or no `structured_output` | The answer didn't match the schema, or the run ended early | Simplify the schema; check that required fields can always be filled; raise `max_turns` slightly |
| `error_max_budget_usd` | The run hit `max_budget_usd` | Large inputs or very long outputs; check the token counts before raising the limit |
| A field contains the right ID plus extra text ("TC-AP-04 (R04)"), and a check fails | A free-text field where code expects an exact value | Make it an enum built from the real IDs (Chapters 9 and 11) |
| The cost the SDK reports looks far too high or too low | The SDK version is older than the model, so its price table is wrong | Calculate the cost from the token counts, as `claude_call.py` does (Chapter 2) |
| "aclose(): asynchronous generator is already running" after a run | The program returned from inside `async for ... in query(...)` | Keep reading until the stream ends, then return, as `ask_async` does |

## Checks and Graders

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A limits check flags values that are test points, such as 79 N and 81 N | Limits and test conditions share one free-text field | Separate `measure` and `limit` in the schema; put test points in the procedure (Chapter 6) |
| A number check reads "B1A01" as "1 A" | The pattern matches numbers inside words | Require a non-word character before and after the number (Chapter 6) |
| A check flags values from the definitions section, or the ends of "50 ms ± 5 ms" | The check doesn't know those values are allowed | Allow the definitions' values and expand tolerances (Chapter 6) |
| The grader marks a correct answer wrong | The labels or key phrases are too literal, or the labels are wrong | Read the output first; record any change to the labels with a reason, and keep the original (Chapters 5 and 16) |
| The grader marks wrong answers right | Key phrases too loose | Tighten them, and limit matches to the right function or field (Chapter 11) |
| Every grading run passes, and the tool still has a bug | The test data doesn't contain the case | Review the code; make a test case for each finding (Chapter 8) |

## Claude Code in Headless Mode

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The session ends with an explanation and no code | A command was refused under `--permission-mode dontAsk` | Read `permission_denials` in the JSON output; tell Claude in the prompt which commands it may use (Chapter 8) |
| A rule such as `Bash(python3 *)` doesn't allow a compound command with `cat` or a loop | Each part of the command must be allowed | List the commands it may use, or allow the specific ones it needs |
| A command that starts with an allowed prefix also ran something else | Prefix rules are not a security boundary | Use a sandbox, container or virtual machine for isolation (Chapter 8) |
| The tool can read files it shouldn't | It works inside a folder that contains them | Give it a clean folder with only the inputs; keep answers elsewhere (Chapter 8) |

## Reports and Documents

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A report draws a wrong conclusion although every number checks out | A fact the conclusion depends on is missing from the fact sheet | Add the fact (such as the limit each night); tell Claude that it can change (Chapter 9) |
| Table columns in the Word file all have the same width | python-docx autofit | Set `table.autofit = False` and set every column's and cell's width |
| A layout change seems to need a new Claude run | The document and the text are made in one step | Save the answer and the fact sheet; rebuild the document from them (`report.py --rebuild`) |

## The MCP Server

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The agent says it has no database tools | The server failed to start or wasn't connected in time | Run `python testdb_server.py --check`; use `"alwaysLoad": True`; read the server status in the first `SystemMessage` |
| Tool calls are refused | The tool's full name isn't in `allowed_tools` | Allow `mcp__wlc200-testdb__*`, with the server's name exactly as configured |
| An attempted write to the database fails | The database is opened read-only | That's intended: the server is for questions, not changes |
