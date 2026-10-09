# Appendix C: Troubleshooting

Most of these problems happened while this book was being written. Each entry gives the symptom you'll see, the likely cause, and the fix.

## Setting Up and Connecting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'claude_agent_sdk'` | The SDK isn't installed in the Python you're using, or the virtual environment isn't active | Activate the environment (Chapter 2), then `pip install claude-agent-sdk` |
| "Not logged in · Please run /login" | No API key in the environment | Set `ANTHROPIC_API_KEY` in the terminal or secret store the agent runs from |
| "401 API key is invalid" | The key is wrong, deleted or has extra characters | Copy the key again from the Console, or create a new one |
| "Self-signed certificate detected" | A company proxy inspects HTTPS traffic | Set `NODE_EXTRA_CA_CERTS` to your company's certificate bundle; for `pip`, use its `--cert` option or `PIP_CERT` |
| "Claude Code 2.1.215 does not support this model; version 2.1.280 or newer is required" | Your SDK version is older than the model | Upgrade the SDK, run your evals, then deploy (Chapter 22) |
| `unrecognized_model` in the logs | The SDK was released before this model | Usually harmless, but its cost estimates are wrong: calculate cost from tokens (Chapter 22) |
| Usage-limit or rate-limit errors | Too many requests, or the account's limit was reached | Wait for the reset time; spread out parallel runs; check the Console's limits |

## The Agent Doesn't Use Its Tools

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The agent says it has no tools for the job | The MCP server wasn't connected when the session started | Add `"alwaysLoad": True`; check the `init` message's server status (Chapter 13) |
| A tool is never called | Its name isn't in `allowed_tools` and the mode is `dontAsk`; or its description doesn't say when to use it | Use the tool's full name: `mcp__`, the server name, two underscores, then the tool name. Improve the description |
| The agent calls a tool with the wrong input | The input format is unclear | Describe the inputs; return errors that say what's allowed (Chapter 5) |
| An MCP server shows `failed` | The server crashed on start | Run it by itself (for example with `--check`) and read its error |
| `CanUseToolShadowedWarning` | A tool is in `allowed_tools`, so your `can_use_tool` callback is never asked about it | Remove the tool from `allowed_tools` if a person should approve it |

## The Run Ends Badly

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `subtype` is `error_max_turns` | The agent needed more turns, or looped | Read the transcript; raise `max_turns` only if the task really needs it |
| `subtype` is `error_max_budget_usd` | The run hit its cost limit | Check for loops or huge tool results before raising the limit |
| "error result: success" | The API failed, and your code reported the subtype instead of the message | Report `result.result` and check `is_error` (Chapters 4 and 20) |
| `subtype` is `success`, but the answer is empty or wrong | The agent finished, but didn't do the job | Check outputs with code; never treat `success` as correct (Chapter 9) |
| No `structured_output` | The output didn't match the schema, or the run ended early | Check `subtype` and `is_error`; simplify the schema; read the transcript |
| The run takes much longer than usual | Large tool results, many turns, or retries | Look at `num_turns` and tool result sizes |

## Commands, Files and the Sandbox

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| A sandbox warning, and commands run anyway | The sandbox's requirements are missing (on Linux, `bubblewrap` and `socat`) | Install them, and check the sandbox is active before running (Chapter 9) |
| "Read-only file system" from a command | The sandbox is working: the command tried to write outside the allowed folder | Write inside the working folder, or widen the sandbox deliberately |
| A command is refused | It doesn't match the `Bash(...)` rules in `allowed_tools` | Allow that command pattern, or change the instructions |
| `PermissionError` inside a container | The folder belongs to root and the container runs as a normal user | `chown` the folder in the Dockerfile (Chapter 20) |
| The agent can't find a file | `cwd` points somewhere else | Use paths relative to `cwd`, or set `cwd` to the right folder |

## Quality Problems

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The same wrong answer in every run | Unclear instructions or definitions | Define your terms in the prompt (Chapter 6) |
| A rule is broken occasionally | The rule is only a request in the prompt | Move it into the schema, the tool code or the options (Chapter 19) |
| Numbers are slightly wrong | The model did arithmetic | Do arithmetic in tools or check it with code (Chapter 7) |
| Made-up facts or quotes | No grounding, or no check | Require quotes and verify them with code (Chapter 8) |
| The agent follows instructions found in content | Prompt injection | Say content is data; remove dangerous tools; enforce limits in code (Chapter 23) |
| A check fails but the output looks right | The checker is too strict | Read the output first; fix the checker if it's wrong (Chapter 16) |
| Results get worse after an upgrade | Model, SDK or prompt changed behaviour | Compare eval results before and after; roll back if needed (Chapter 22) |

## Web Apps

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| The chat page loads but replies never arrive | The server crashed or the agent call failed | Read the server's terminal output; check the API key |
| Each message starts a new conversation | The client isn't reused between requests | Keep one `ClaudeSDKClient` per chat (Chapter 12) |
| The server slows down over time | Old conversations are never closed | Limit open chats and close the oldest (Chapter 12) |
