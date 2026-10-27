# Chapter 8: Skills

Tools give Sparrow abilities; **skills** teach it how to use them for a particular job. A skill is a folder with a `SKILL.md` file: a short header with a name and a one-line description, then plain-language instructions, sometimes with a script. "To log an expense, read `expenses.csv`, add a line, save it." "For a morning briefing, check to-dos, then reminders, then memory." This chapter writes the skill loader and Sparrow's three starter skills.

## Why Skills

You could put every procedure in the house rules, but the system prompt would grow with each one, and you'd pay for all of them on every turn. Skills solve that with **progressive disclosure**: only each skill's name and description go into the prompt (one line each), and the model reads the full instructions with `read_skill` when a request matches. A hundred skills cost a hundred lines in the prompt, not a hundred pages.

Skills are also easy to write and share. They're plain text, so you can write one in a few minutes, and the model follows instructions written for a person. That's what made skills so popular in OpenClaw, and also what made them dangerous: a skill is instructions your agent will follow with your permissions, written by whoever wrote it.

> **Real-World Story:** In the ClawHavoc campaign of early 2026, attackers uploaded hundreds of skills to ClawHub with useful-sounding names, such as cryptocurrency tools and YouTube utilities. Each had a "Prerequisites" section telling the user to download and run a helper program first. The helper was malware. Koi Security's review found 341 malicious skills out of 2,857, and later scans found more. The skills didn't exploit a bug; they simply asked, in plain language, for something harmful, and people (and agents) followed the instructions.

Sparrow's answer has two parts. New skills can only be installed with your approval (Chapter 15). And whatever a skill says, its instructions run through the same tools and checks as everything else: a skill can't give Sparrow network access in the sandbox, reveal a secret, or reach outside the files folder, because none of that is possible through `call_tool`.

## The Skill Format

Here is the expense-logging skill from Chapter 3's chat, `templates/skills/expense-log/SKILL.md`:

```
@include sparrow/templates/skills/expense-log/SKILL.md
```

The header between the `---` lines is YAML with two fields. The `name` is lowercase letters, numbers and hyphens, and matches the folder. The `description` says what the skill does, and that line is all the model sees until it reads the skill, so it should say *when* to use it. The body is the instructions, in Markdown.

This skill has a script beside it, `totals.py`:

```python
@include sparrow/templates/skills/expense-log/totals.py
```

Why a script, when the model can add numbers? Because it can't always add them *reliably*, especially across many rows, and a script gives the same answer every time. The skill tells Sparrow to run it with `run_command`, which runs it in the sandbox, where the skills folder appears read-only at `/skills` and your files folder at `/work`, the current directory. When you asked "What are this month's totals?" in Chapter 3, this script produced the numbers.

The other two starter skills show different styles. The daily briefing is a recipe of tool calls:

```
@include sparrow/templates/skills/daily-briefing/SKILL.md
```

And the packing list combines asking, remembering and writing a file:

```
@include sparrow/templates/skills/packing-list/SKILL.md
```

Notice how specific they are. "At most five bullet points, most urgent first." "Grouped into Clothes, Toiletries, Tech, Documents, Other." Vague skills give vague results; a good skill reads like instructions to a capable new assistant on their first day.

## Loading Skills

`sparrow/skills.py` reads and checks skill files:

```python
@include sparrow/skills.py#L1-L38
```

`parse_skill` splits the file at the first two `---` lines, reads the header with `yaml.safe_load`, and checks both fields. The name must match the pattern `NAME`: start with a letter or digit, then up to 40 letters, digits and hyphens. That rules out names like `../../evil` that could become a path outside the skills folder, and names with spaces or capitals that the model might mistype. The description is joined onto one line, because it goes into a one-line-per-skill list in the prompt, and a multi-line description could add extra lines that look like extra skills.

```python
@include sparrow/skills.py#L41-L73
```

`load` reads every `*/SKILL.md` folder, sorted so the order is stable. A broken skill, with a missing header or a bad name, is **skipped and reported**, not fatal: one bad file shouldn't stop Sparrow from starting or hide every other skill. The problems are kept in `self.problems`, and `doctor` prints them (Chapter 10).

`index` makes the list for the system prompt, and `read` returns one skill's instructions, or, for a name that doesn't exist, a helpful message listing the ones that do, so the model can correct itself.

Skills are loaded fresh on every call. Reading three small files takes well under a millisecond, and it means a skill you add or edit by hand works on the very next message, with no restart.

## Writing Skills

```python
@include sparrow/skills.py#L75-L89
```

`write` saves a new skill. It checks the name, writes the header with `yaml.safe_dump` (so a description with a colon or quotes is escaped properly rather than breaking the YAML), and then parses the file it just wrote. If the result isn't a valid skill, it raises, so Sparrow never leaves a broken skill behind. As its docstring says, `write` doesn't decide whether writing is allowed; the gateway calls it only after you approve.

## Skills in Action

When you send "I spent 12.50 on lunch and 30 on a taxi today. Log them, please," this is what happens, as recorded in the audit log of the Chapter 3 session:

1. The system prompt lists `expense-log: Record an expense in expenses.csv and report totals by category for a month.` The house rules say to read a matching skill first.
2. Sparrow calls `read_skill` with `expense-log` and gets the instructions.
3. It calls `read_file` for `expenses.csv`, which doesn't exist yet.
4. It calls `write_file` with the header and two rows, dated from the system prompt's "Right Now" section.
5. It answers with what it logged.

When you ask for totals, it calls `run_command` with `python3 /skills/expense-log/totals.py 2026-10` and reports the script's output. The end-to-end test in Chapter 22 checks this sequence, including that `read_skill` came first and the totals came from the sandbox, three times in a row.

> **Tip:** To teach Sparrow something new, you don't need to write code. Make a folder in `workspace/skills/`, write a `SKILL.md` with a clear description and specific steps, and send a message that matches. If it isn't used when you expect, the description is usually the problem: make it say when the skill applies.

## Key Takeaways

- A skill is a folder with a `SKILL.md`: a name, a one-line description, and instructions; it may include scripts.
- Only names and descriptions go in the prompt; full instructions are read when needed.
- Scripts make calculations reliable; they run in the sandbox like any other command.
- Broken skills are skipped and reported, never fatal; new skills are checked after writing.
- Skills are powerful instructions written by someone else, so installing one needs your approval, and every skill still works only through Sparrow's checked tools.
