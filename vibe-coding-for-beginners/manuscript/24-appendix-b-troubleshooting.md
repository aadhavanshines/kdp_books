# Appendix B: Troubleshooting Guide

When something goes wrong, find the closest match below. If nothing fits, copy the full error message and ask Claude Code: "Explain this error and how to fix it." For problems with Claude Code itself, run `claude doctor` in your terminal or `/doctor` inside a session.

## Installing and Starting

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `claude: command not found` or "not recognized" | The terminal was open before installing, or the install folder isn't on your PATH | Close and reopen the terminal. If it persists, follow the "Fix your PATH" steps in the official troubleshooting guide. |
| The PowerShell installer fails with `The token '&&' is not a valid statement separator` | You're in PowerShell running the CMD command | Use the PowerShell install command from Chapter 3 instead. |
| `'irm' is not recognized` | You're in CMD running the PowerShell command | Use the CMD command, or open PowerShell. |
| The login browser window doesn't open | No default browser, or a remote machine | Copy the link Claude Code shows into a browser manually. |
| A message that you've reached your usage limit | You've used your plan's allowance for now | Check `/usage`; wait for the reset, or add usage credits or API credits. |
| Claude Code is slow or unresponsive | Very long session, or a network problem | Press Esc; try `/compact` or `/clear`; check your connection. |

## Python and Packages

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `python3: command not found` on Windows | Windows uses `python` | Type `python` instead. |
| `python` opens the Microsoft Store | Python isn't installed, or wasn't added to PATH | Reinstall from python.org and tick "Add python.exe to PATH". |
| `ModuleNotFoundError: No module named ...` | Package not installed, or the virtual environment isn't active | Activate `.venv`; run `pip install -r requirements.txt`. |
| PowerShell won't run `Activate.ps1` | Script execution is disabled | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again. |
| `pip` installs to the wrong place | The virtual environment isn't active | Activate it first; your prompt should show `(.venv)`. |

## Running Apps

| Problem | Likely cause | Fix |
| --- | --- | --- |
| `Address already in use` | Another copy of the app (or another program) uses the port | Stop the other copy (Ctrl+C in its terminal), or use another port (`PORT=5001`). |
| The page is blank | A JavaScript error | Open the browser's developer tools (F12), check the Console tab, and paste the error to Claude. |
| Changes don't appear in the browser | The browser cached the old version | Hard-refresh (Ctrl+Shift+R, or Cmd+Shift+R on a Mac). |
| `FileNotFoundError` | You're in the wrong folder | Check with `pwd`; `cd` into the project folder. |
| Data disappears after redeploying | The database isn't on a persistent disk | Attach a disk or volume and point the database path at it (Chapter 14). |
| The app works locally but shows the wrong day online | The server's time zone differs from the user's | See the time zone case study in Chapter 10. |

## Working with Claude

| Problem | Likely cause | Fix |
| --- | --- | --- |
| Claude ignores an instruction from earlier | The conversation is long and cluttered | `/clear` and restate the instruction; put permanent rules in CLAUDE.md. |
| Claude keeps making the same mistake | Failed attempts are polluting the context | Rewind, `/clear`, and write a better first prompt including what you learned. |
| Claude changed far more than you asked | The request was broad, or no constraint was given | Rewind; ask again with "Only change X. Don't touch Y." |
| Claude says it's done, but it doesn't work | No way to verify was given | Ask it to run the tests or the app and show the evidence. |
| Claude ignores a rule in CLAUDE.md | The file is too long, or the rule is vague | Shorten the file; make the rule specific; use a hook for hard rules. |
| Too many permission prompts | Manual mode, or no allow rules | Use Accept edits or Auto mode, or add allow rules with `/permissions`. |
| Claude edited something it shouldn't have | No guardrail for that file | Undo with Git; add a deny rule in `.claude/settings.json`. |
| A test was "fixed" by weakening it | The prompt allowed test changes | Add "Don't change the tests to make them pass." Review test diffs. |

## Git and GitHub

| Problem | Likely cause | Fix |
| --- | --- | --- |
| "Please tell me who you are" on commit | Git doesn't know your name yet | Run the two `git config --global` commands from Chapter 4. |
| `git push` is rejected | GitHub has commits you don't have | Ask Claude: "Pull the latest changes, resolve any conflicts, and push." |
| Merge conflict | Two branches changed the same lines | Ask Claude to resolve it and explain each decision; run the tests afterwards. |
| A secret was committed | It was in a file that wasn't ignored | Rotate the secret immediately; then ask Claude to remove it from the history. |
| `gh: command not found` | GitHub CLI not installed | Install it from cli.github.com and run `gh auth login`. |

## Hooks, MCP, and Automation

| Problem | Likely cause | Fix |
| --- | --- | --- |
| A hook never runs | Wrong event or matcher, or the script isn't executable | Check `/hooks`; on macOS and Linux run `chmod +x` on the script; test it with sample input. |
| A hook doesn't block something | The action used a different tool (for example, a terminal command instead of a file edit) | Add a permission deny rule, or match the other tool too (Chapter 17). |
| A Stop hook keeps Claude working forever | No loop protection | Check `stop_hook_active` and exit early when it's true. |
| MCP server shows "Failed to connect" | It's still downloading, or the command is wrong | Wait and run `claude mcp list` again; check details with `claude mcp get <name>`. |
| MCP server "Needs authentication" | The service requires a sign-in | Run `/mcp` inside Claude Code and sign in. |
| `@claude` doesn't respond on GitHub | Workflow not merged, missing secret, or no permission | Check the Actions tab for errors; confirm the `ANTHROPIC_API_KEY` secret exists. |
