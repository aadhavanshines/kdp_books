# Chapter 9: Project 3: An Expense Tracker in Python

So far, everything you've built runs in a web browser. Your third project runs in the terminal: a command-line tool, written in Python, that records your spending and summarizes it by category. It's also your first project with **automated tests**, written by Claude and run by Claude before it tells you it's finished.

## Why a Command-Line Tool?

Command-line tools are the workhorses of computing. They're quick to build, easy to automate, and perfect for personal productivity: renaming hundreds of photos, cleaning up a spreadsheet, or tracking expenses. They also teach you how programs take input and produce output, without the distraction of designing a screen.

## Setting Up Python for a Project

Professional Python projects use a **virtual environment**: a private folder of packages for one project, so different projects don't interfere with each other. It sounds technical, but it's three commands.

Make a new folder for the project, go into it, and create the environment:

```
mkdir expense-tracker
cd expense-tracker
python3 -m venv .venv
```

On Windows, type `python` instead of `python3`. Then **activate** the environment. On macOS and Linux:

```
source .venv/bin/activate
```

On Windows PowerShell:

```
.venv\Scripts\Activate.ps1
```

Your prompt now starts with `(.venv)`, showing the environment is active. Install pytest, the testing tool:

```
pip install pytest
```

> **Tip:** You have to activate the environment each time you open a new terminal for this project. If a command says "No module named pytest" even though you installed it, the environment probably isn't active. You can also simply ask Claude to set up and use the virtual environment for you.

Set up Git as usual, then start Claude Code in this folder.

## The Prompt

```
Build a command-line expense tracker in Python called expenses.py.
I want to use it like this:

  python expenses.py add 12.50 food "Lunch with Sam"
  python expenses.py add 40 transport "Train pass" --date 2026-10-01
  python expenses.py list
  python expenses.py summary
  python expenses.py summary --month 2026-10

Requirements:
- Save expenses in expenses.csv next to the script.
- Use today's date unless I give --date (format YYYY-MM-DD).
- "summary" shows the total for each category, biggest first,
  and the overall total.
- Give friendly error messages for bad input, such as a negative
  amount or a date in the wrong format, instead of a crash.
- Use only the Python standard library.

Also write tests with pytest in test_expenses.py. Run them and
make sure they all pass before you finish.
```

Two techniques make this prompt work:

- **Example commands.** Instead of describing the interface in words, the prompt shows exactly how you'll use it. Examples are the clearest specification there is.
- **"Run them and make sure they all pass before you finish."** This gives Claude a check it can run by itself, so it doesn't stop until the code actually works.

## The Result

Claude finished in four turns. Its reply, lightly shortened:

```
Claude's reply:
I've built expenses.py and test_expenses.py, and all 25 pytest
tests pass. I haven't run the exact example commands from your
message by hand. The tests cover the same cases.

Bad input. You get a one-line "Error: ..." message and exit
code 1, with no traceback, for:
- an amount that is negative, zero, not a number, nan/inf, or
  has more than 2 decimal places
- a date in the wrong format or one that doesn't exist, like
  2026-02-30
- a bad --month
- an empty category
- a corrupted line in the CSV

Choices I made
- Amounts are handled as exact decimals, so ten 0.10 entries
  total exactly 1.00.
- Categories are lowercased, so Food and food are summed
  together.
- A missing or empty CSV gives "No expenses yet." instead of an
  error.
```

Twenty-five tests from a one-paragraph request. Notice the "choices I made" again: exact decimals (the same money lesson as Chapter 5), and lowercased categories so "Food" and "food" don't become two separate lines in your summary. If you'd prefer categories to keep their capitals, now you know to ask.

## Try It Out

Run the commands from your prompt. Here's what the tracker printed when they were run for this book (the third command uses "Food" with a capital F on purpose):

```
python expenses.py add 12.50 food "Lunch with Sam"
python expenses.py add 40 transport "Train pass" --date 2026-10-01
python expenses.py add 8.25 Food "Coffee and cake"
python expenses.py summary
```

```
Terminal output:
Added 12.50 to food on 2026-10-06.
Added 40.00 to transport on 2026-10-01.
Added 8.25 to food on 2026-10-06.
transport       40.00
food            20.75
---------------------
TOTAL           60.75
```

The two food expenses were combined, with the biggest category first, exactly as requested. Now try to break it:

```
python expenses.py add -5 food "Refund?"
python expenses.py add 5 food "Snack" --date 10/01/2026
```

```
Terminal output:
Error: Amount must be greater than zero.
Error: '10/01/2026' is not a valid date. Use the format
YYYY-MM-DD, e.g. 2026-10-01.
```

Friendly messages, no crash, and nothing saved. That's what "give friendly error messages instead of a crash" buys you.

## Reading the Tests

Open `test_expenses.py`. Tests are often the easiest code to read, because each one describes a single behavior. Here's one from Claude's test file:

```
@include projects/03-expense-tracker/test_expenses.py#L46-L50
```

Read it like a sentence: "For each of these bad amounts (negative five, zero, letters, not-a-number, infinity, too many decimals, nothing at all, and an absurdly huge number), adding an expense should fail with exit code 1, print an error, and not create the file." One short test checks eight situations. (The last one, `1e30`, wasn't in Claude's original tests. It was added in Chapter 23, after an automated review found that a huge amount crashed the program, a good reminder that even 25 passing tests don't cover everything.) This is what lets you change the code later with confidence: if you break any of these behaviors, a test will tell you.

And here is the code those tests check:

```
@include projects/03-expense-tracker/expenses.py#L20-L35
```

Each check is a rule, and each rule has a human-readable message. You could add a new rule yourself, such as "amounts over 10,000 need confirmation," by asking Claude, and you'd ask it to add a test at the same time.

## Running the Tests Yourself

Any time you or Claude change the code, run the tests:

```
python -m pytest
```

```
Terminal output:
.........................                    [100%]
25 passed in 0.14s
```

Each dot is a passing test. A failing test shows an `F` and a detailed report of what went wrong, which you can paste straight back to Claude.

> **Note:** You've now seen two kinds of checking: Claude testing its own work, and you testing by hand. Both matter. Claude's tests catch regressions quickly; your hands-on testing catches the things nobody thought to write a test for. Chapter 12 goes deeper.

## Commit

```
Commit the expense tracker and its tests.
```

> **Try It:** Add a `budget` command: `python expenses.py budget food 200` sets a monthly budget, and `summary` shows a warning when a category goes over. Ask Claude to write tests for the new behavior first, then implement it, and run all the tests at the end.

## Key Takeaways

- Command-line tools are quick to build and great for personal automation.
- Use a virtual environment for each Python project, and activate it in each new terminal.
- Example commands are the clearest way to describe how a tool should work.
- Ask Claude to write tests and run them before finishing. It gives Claude a way to check itself.
- Tests read like specifications: each one describes a behavior.
- Run `python -m pytest` after every change. Paste failures back to Claude.
