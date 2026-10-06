# Chapter 15: Teaching Claude Your Project: CLAUDE.md and Memory

Every time you start a new session, Claude begins with no memory of your previous conversations. It can read your code, but it can't read your mind or your history: the commands you prefer, the bug you fixed last week, the rule that every new feature must handle time zones. Without help, you'd repeat yourself in every session.

Claude Code solves this with **CLAUDE.md**, a file of instructions Claude reads at the start of every session, and **auto memory**, notes Claude keeps for itself. This chapter shows you how to use both.

## What CLAUDE.md Is

`CLAUDE.md` is a plain text file, written in Markdown, that lives in your project folder. Whatever you write in it, Claude reads before your first message, every session. Think of it as the briefing you'd give a new teammate on their first day: how to run things, how the project is organized, and the rules that aren't obvious from the code.

You don't have to write it from scratch. Run this command inside Claude Code:

```
/init
```

Claude reads your project and writes a starter `CLAUDE.md`. When `/init` was run on the habit tracker, Claude replied:

```
Claude's reply:
I created CLAUDE.md at the repo root. I didn't run the tests or
the app; I wrote it from reading README.md, SPEC.md, app.py, and
grepping static/app.js and test_app.py.

It covers:
- Commands: setup, run, and pytest including a single-test form.
  No linter or build is configured, and the file says so.
- Architecture: the create_app(db_path, today_func) factory and
  the injectable "today" that the tests depend on; the
  X-Client-Date timezone handling, and that new endpoints must
  use current_today(); the pure compute_streaks function; the
  schema details.
- Tests: how the fixtures are set up, including the simulated
  UTC server.
```

Here's the "Commands" section of the file it wrote:

```
@include projects/04-habit-tracker/CLAUDE.md#L9-L13
```

And here is one of its architecture rules, which captures the lesson of the time zone bug from Chapter 10:

```
@include projects/04-habit-tracker/CLAUDE.md#L23-L23
```

That last sentence is the kind of thing that makes CLAUDE.md valuable. The rule isn't obvious from reading any one file, it was learned the hard way, and forgetting it would quietly reintroduce a bug.

## Does It Work?

To find out, a brand-new session was given this request, with no mention of time zones:

```
Add an API endpoint GET /api/today that returns how many habits
are marked done today and how many there are in total. Add a
test.
```

Claude's reply:

```
Claude's reply:
GET /api/today now returns {"done": n, "total": n}: how many
habits are marked done today, and how many habits there are. The
full suite passes (34 tests).

It uses current_today(), so "today" is the user's date from the
X-Client-Date header. A user in a different timezone from the
server gets their own day.

I added two tests in test_app.py:
- test_today_summary: covers the empty case, and checks that
  completions on other days aren't counted.
- test_today_summary_uses_users_date: uses the UTC-server
  fixture and checks that the count follows the client's date.

I also added the endpoint to the lists in README.md and SPEC.md.
```

The new endpoint followed the project's rule, tested the tricky time zone case, and kept the documentation up to date, all without being asked. That's what a good CLAUDE.md buys you: consistency across sessions, without repeating yourself.

## What to Put in CLAUDE.md

Keep it short and specific. For each line, ask: "Would Claude make a mistake without this?" If not, leave it out.

| Include | Leave out |
| --- | --- |
| Commands Claude can't guess (how to run, test, deploy) | Anything Claude can learn by reading the code |
| Rules that differ from common practice | General advice like "write clean code" |
| Hard-won lessons ("always use `current_today()`") | Long tutorials or documentation |
| Testing instructions | File-by-file descriptions |
| Environment quirks (required environment variables) | Information that changes often |
| How you like to work ("explain changes in plain English") | Secrets of any kind |

A long CLAUDE.md is worse than a short one: important rules get lost among unimportant ones. If Claude ignores a rule, the file may be too long, or the rule may be unclear. Treat CLAUDE.md like code: review it, prune it, and test whether changes actually change Claude's behavior.

> **Tip:** If one rule is critical and keeps being missed, mark it with "IMPORTANT:". Use this sparingly: if everything is important, nothing is.

## Where CLAUDE.md Files Can Live

| File | Scope | Shared? |
| --- | --- | --- |
| `CLAUDE.md` in the project folder | This project | Yes, commit it to Git |
| `CLAUDE.local.md` in the project folder | This project, just you | No, add it to `.gitignore` |
| `~/.claude/CLAUDE.md` in your home folder | All your projects | No |

Use the home-folder file for personal preferences that apply everywhere, such as "I'm learning to code: explain changes in plain English" or "Use British spelling." Use the project file for anything specific to the project, and commit it so it travels with the code.

Larger projects can split instructions into topic files inside a `.claude/rules/` folder, and CLAUDE.md can pull in other files with `@` (for example, `See @README.md for the API`). For most beginner projects, one short file is plenty.

> **Note:** Claude Code can also read `AGENTS.md`, an instruction file used by some other AI coding tools, so a project already set up for another tool works without changes.

## Auto Memory

Besides the instructions you write, Claude Code can keep its own notes, called **auto memory**. As you work, Claude saves things that would be useful in future sessions: your preferences, corrections you've given it ("don't use that library"), and project context it can't work out from the code, such as a deadline or where your issue tracker lives. It skips anything already in the code or in CLAUDE.md.

These notes are stored on your computer, separately for each project, and loaded at the start of each session. Type `/memory` to see and edit them, to edit your CLAUDE.md files, or to turn auto memory on or off.

> **Warning:** Memory and CLAUDE.md are instructions, not locks. Claude follows them very consistently, but they don't *force* anything. For rules that must never be broken, such as "never edit the database file," use permissions and hooks (Chapter 17), which are enforced by Claude Code itself.

## Keeping Memory Healthy

- **Update CLAUDE.md when you learn something.** After fixing a tricky bug, ask: "Add a short rule to CLAUDE.md so this mistake doesn't happen again."
- **Prune regularly.** Remove rules that no longer apply.
- **Check what's loaded.** The `/context` command shows what's taking up Claude's attention, including your CLAUDE.md files.
- **Never store secrets.** CLAUDE.md is usually committed to Git, and memory files are plain text.

> **Try It:** Run `/init` in the expense tracker project. Read the CLAUDE.md it creates and delete anything Claude could figure out by itself. Then add one rule of your own, such as "Every new command needs tests for bad input," and ask for a new feature in a fresh session to see whether the rule is followed.

## Key Takeaways

- CLAUDE.md is a briefing Claude reads at the start of every session. Run `/init` to create one.
- Include commands, non-obvious rules, and hard-won lessons. Leave out what Claude can read in the code.
- Keep it short; long files bury important rules.
- Use the project file for shared rules, `CLAUDE.local.md` for personal project notes, and `~/.claude/CLAUDE.md` for preferences across all projects.
- Auto memory lets Claude keep its own notes; review them with `/memory`.
- Instructions guide Claude, but don't enforce. Use permissions and hooks for hard rules.
