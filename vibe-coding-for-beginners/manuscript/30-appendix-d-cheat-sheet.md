# Appendix D: Claude Code Cheat Sheet

A quick reference to the commands, shortcuts, and files used in this book. Type `/help` inside Claude Code for the full, current list for your version.

## Starting Claude Code (in the terminal)

| Command | What it does |
| --- | --- |
| `claude` | Start an interactive session in the current folder |
| `claude "task"` | Start a session with a first request |
| `claude -c` | Continue the most recent conversation in this folder |
| `claude -r` | Choose a past conversation to resume |
| `claude -p "task"` | Run once without a conversation (headless mode) |
| `claude --permission-mode plan` | Start in plan mode |
| `claude --worktree <name>` | Start in a separate git worktree for parallel work |
| `claude --model <model>` | Start with a specific model |
| `claude --version` | Show the installed version |
| `claude update` | Check for and install updates |
| `claude doctor` | Check the health of your installation |

## Inside a Session

| Command | What it does |
| --- | --- |
| `/help` | Show available commands |
| `/init` | Create a CLAUDE.md for this project |
| `/clear` | Start a fresh conversation |
| `/compact [focus]` | Summarize the conversation to free up context |
| `/context` | Show what's using the context window |
| `/btw <question>` | Ask a side question without adding it to the conversation |
| `/rewind` | Undo changes or conversation back to a checkpoint |
| `/resume` | Switch to a past conversation |
| `/rename <name>` | Name the current session |
| `/usage` | Show usage, limits, and estimated session cost |
| `/model` | Change the model |
| `/effort` | Change how hard Claude thinks |
| `/permissions` | Manage allow, ask, and deny rules |
| `/hooks` | See configured hooks |
| `/memory` | Edit CLAUDE.md files and auto memory |
| `/mcp` | Manage MCP server connections and sign-ins |
| `/plugin` | Browse and install plugins |
| `/code-review` | Review your current changes for bugs |
| `/security-review` | Review your branch's changes for security problems |
| `/verify` | Run your app to confirm a change works |
| `/install-github-app` | Set up Claude on GitHub |
| `/login` | Switch accounts or log in again |
| `/exit` | Leave Claude Code |

## Keyboard Shortcuts

| Keys | What they do |
| --- | --- |
| Shift+Tab | Cycle permission modes |
| Esc | Stop Claude mid-step (your work so far is kept) |
| Esc, Esc | Open the rewind menu (with an empty prompt) |
| Ctrl+C | Interrupt; with nothing running, clear the input; twice to exit |
| Ctrl+D (twice) | Exit Claude Code |
| Shift+Enter, or `\` then Enter | New line without sending |
| Ctrl+G | Edit your prompt (or a plan) in your text editor |
| Ctrl+V (Alt+V on Windows) | Paste an image |
| Ctrl+R | Search your previous prompts |
| Ctrl+O | Show the detailed transcript of what Claude did |
| Up arrow | Previous prompt |
| `?` | Show shortcut help |

## Special Characters in Prompts

| Type | Meaning |
| --- | --- |
| `/` at the start | Run a command or skill |
| `@path` | Point Claude at a file |
| `!` at the start | Run a terminal command yourself and share its output |

## Permission Modes

| Mode | Without asking, Claude may... |
| --- | --- |
| Manual | Only read |
| Accept edits | Read, edit files, and run simple file commands |
| Plan | Read and explore; no changes until you approve a plan |
| Auto | Do almost everything, with a safety checker reviewing actions |

## Files and Folders

| Location | Purpose |
| --- | --- |
| `CLAUDE.md` | Project instructions, read every session (commit it) |
| `CLAUDE.local.md` | Your personal notes for this project (don't commit) |
| `~/.claude/CLAUDE.md` | Your instructions for all projects |
| `.claude/settings.json` | Project permissions and hooks (commit it) |
| `.claude/settings.local.json` | Your personal project settings (don't commit) |
| `~/.claude/settings.json` | Your settings for all projects |
| `.claude/skills/<name>/SKILL.md` | A project skill, run with `/<name>` |
| `~/.claude/skills/<name>/SKILL.md` | A personal skill for all projects |
| `.claude/agents/<name>.md` | A project subagent |
| `.mcp.json` | Shared project MCP servers |

## MCP Commands (in the terminal)

| Command | What it does |
| --- | --- |
| `claude mcp add --transport http <name> <url>` | Add a remote server |
| `claude mcp add <name> -- <command>` | Add a local server |
| `claude mcp list` | List servers and their status |
| `claude mcp get <name>` | Show details of one server |
| `claude mcp remove <name>` | Remove a server |

## Headless Options

| Option | What it does |
| --- | --- |
| `-p` | Run once and print the result |
| `--output-format json` | Print the result as JSON |
| `--permission-mode dontAsk` | Refuse anything not explicitly allowed |
| `--allowedTools "..."` | Pre-approve specific tools |
| `--max-turns <n>` | Limit the number of steps |
| `--max-budget-usd <amount>` | Stop at an estimated cost limit |
