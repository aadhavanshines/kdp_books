# Chapter 23: Automation: Headless Mode, Scripts, and GitHub Actions

Until now, you've worked with Claude Code in a conversation. But Claude Code can also run without you: inside a script, on a schedule, or on GitHub whenever someone opens a pull request. This chapter shows you how, starting with a single command and ending with an AI teammate that responds to `@claude` on GitHub.

## Headless Mode: `claude -p`

Add `-p` (short for "print") to run Claude Code once, non-interactively: it does the task, prints the result, and exits.

```
claude -p "Explain what this project does in three sentences"
```

That's **headless mode**, and it's how every project session in this book was run and recorded. You can also feed it input from another command with a **pipe** (`|`), which sends one command's output into the next. For example, to get a plain-English summary of your project's history:

```
git log --oneline | claude -p "Summarize these commits for a non-technical reader in at most 5 short bullet points. No preamble."
```

When this was run on the habit tracker's history, Claude produced:

```
Claude's reply:
- Wrote the project plan (spec) and built the first working
  version of the habit tracker.
- Made "today" follow the user's own local date, so people in
  other time zones see the right day.
- Added project guidance notes and automatic safety checks
  (including blocking access to secret files) to help the AI
  assistant work consistently.
- Set a 30-character limit on habit names, and added a
  pre-release check plus a code-review helper.
- Prepared the app for live use online and set up automatic
  testing on every change.
```

That's a weekly status report in one line. Other everyday uses:

```
cat error.log | claude -p "What's the most likely cause of these errors?"
```

```
claude -p "Review the changes in the last commit for bugs" --permission-mode plan
```

> **Note:** On Windows PowerShell, use `Get-Content error.log | claude -p "..."` instead of `cat`.

## Controlling Headless Runs

When nobody is watching, you need limits. These options matter most:

| Option | What it does |
| --- | --- |
| `--permission-mode plan` | Read-only: Claude can look but not change anything |
| `--permission-mode dontAsk` | Anything not explicitly allowed is refused, rather than waiting for an approval that will never come |
| `--allowedTools "Read" "Bash(python -m pytest *)"` | Pre-approves exactly these tools |
| `--max-turns 10` | Stops after a set number of steps |
| `--max-budget-usd 2.00` | Stops when the estimated cost reaches a limit |
| `--output-format json` | Prints the result as JSON, for other programs to read |

For example, a locked-down run that can only read files and run the tests:

```
claude -p "Run the tests and summarize any failures" --permission-mode dontAsk --allowedTools "Read" "Bash(python -m pytest *)"
```

The JSON output format includes more than the answer: the number of turns, the estimated cost, and a session ID you can resume later with `claude -r`. The cost figures quoted in this book came from these fields.

## Scripts That Use Claude

Because `claude -p` is just a command, you can put it in scripts. Here's a small one that asks Claude to review each Python file in a folder, one at a time, and saves the reviews:

```
for f in *.py; do
  claude -p "Review $f for bugs and unclear code. Reply in at most
  5 bullet points." --permission-mode plan > "review-$f.txt"
done
```

Each run is a separate, fresh session, so the reviews don't influence each other.

When this script was run on the expense tracker from Chapter 9, the review it produced contained a useful lesson. Two of its claims, checked by hand:

- "A huge value such as `1e30` makes `quantize` raise `InvalidOperation`... The user gets a traceback." **True.** Typing `python expenses.py add 1e30 food` crashed the program, even though all 25 of its tests passed. A follow-up session wrote a failing test for it, fixed it, and the program now says `Error: '1e30' is too large an amount.`
- "`add -5 food` is read by argparse as an unknown option, so the message is confusing." **False.** Running it printed the friendly `Error: Amount must be greater than zero.`, exactly as shown in Chapter 9.

One review, one real bug found, and one confident mistake. That's typical of AI reviews, and of human ones: valuable leads that you must verify before acting on. This "fan-out" pattern scales to big jobs, such as updating hundreds of files. Try your prompt on two or three files first, fix what goes wrong, and only then run it on everything.

> **Warning:** Automation multiplies mistakes as well as work. Before running a script over many files: commit first, use the narrowest permissions that work, set `--max-turns` and `--max-budget-usd`, and test on a few files.

## Claude on GitHub

The **Claude Code GitHub Action** runs Claude Code on GitHub's computers in response to events in your repository. Once it's set up, you can write `@claude` in any issue or pull request comment:

- "@claude why is the streak test failing on this pull request?"
- "@claude implement this issue and open a pull request."
- "@claude review this pull request for security problems."

Claude reads the repository, does the work, and replies or pushes commits, following your `CLAUDE.md` along the way.

### Quick Setup

The easiest way to set it up is from inside Claude Code, in your project folder:

```
/install-github-app
```

You'll need admin access to the repository and the GitHub CLI logged in (Chapter 13). The command installs the Claude GitHub App, stores your credentials as a repository **secret** (GitHub's safe storage for keys), and prepares a pull request with the workflow file. Merge that pull request, and `@claude` works.

### The Workflow File

Whether you use quick setup or do it by hand, the result is a workflow file in `.github/workflows/`. Here is the one used for the habit tracker:

```
@include projects/04-habit-tracker/.github/workflows/claude.yml
```

Reading it from the top:

- **`on`**: run when someone posts a comment on an issue or a pull request review.
- **`if`**: only start if the comment mentions `@claude`, so other comments don't use up minutes.
- **`timeout-minutes`**: stop runaway jobs after 30 minutes.
- **`permissions`**: what the job may do in your repository: change code, comment on pull requests and issues, and read CI results.
- **`steps`**: check out the code, then run the Claude Code action with your API key, taken from the repository's secrets, and a limit of 15 turns.

This file passed **actionlint**, the GitHub Actions checker, as did the test workflow from Chapter 15.

### Automatic Pull Request Reviews

You can also have Claude review every pull request automatically, posting comments on the lines it has concerns about. Quick setup offers a review workflow, and the Claude Code documentation includes a ready-made example using the `code-review` plugin.

> **Warning:** Each run uses GitHub Actions minutes and Claude usage. Keep `@claude` requests specific, keep CLAUDE.md concise (it's read on every run), and set turn limits and timeouts. Never paste API keys into workflow files; always use repository secrets.

## Safety for Unattended Work

When Claude works without you, your guardrails do all the guarding. Before automating anything:

- **Start read-only.** Reviews and summaries can't break anything. Graduate to code changes later.
- **Have changes arrive as pull requests**, never pushed straight to `main`. A person reviews and merges.
- **Keep CI tests on**, so every AI change is tested before anyone looks at it.
- **Use the narrowest permissions** and limits that let the job work.
- **Be careful with public repositories.** Anyone can open an issue, and issue text might contain instructions aimed at the AI. Restrict who can trigger runs, and don't let automated runs act on untrusted content without review.

> **Try It:** Put the habit tracker on GitHub, run `/install-github-app`, and once the workflow is merged, open an issue saying "@claude what does the streak calculation do when today isn't ticked yet? Point me to the code." Read Claude's reply on the issue.

## Key Takeaways

- `claude -p` runs Claude Code once, without a conversation. Pipe input into it for quick reports.
- Control unattended runs with permission modes, `--allowedTools`, `--max-turns`, and `--max-budget-usd`.
- Scripts can fan work out over many files. Commit first and test on a few files.
- The Claude Code GitHub Action lets you mention `@claude` in issues and pull requests.
- Set it up with `/install-github-app`; keep keys in repository secrets.
- Unattended AI changes should arrive as pull requests, be tested by CI, and be reviewed by a person.
