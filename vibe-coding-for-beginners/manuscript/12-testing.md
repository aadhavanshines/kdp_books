# Chapter 12: Testing: Making Sure It Works

When you write code by hand, you change it slowly, and you remember what you changed. When an AI writes code, it can change dozens of lines in seconds, sometimes in places you didn't expect. Automated tests are how you keep up. They let you, and Claude, prove that everything that worked yesterday still works today.

You've already seen tests in action: Claude wrote 25 tests for the expense tracker and more than 30 for the habit tracker, and a failing test helped fix the time zone bug. This chapter explains how to use testing deliberately.

## Why Tests Matter More with AI

Three reasons:

1. **Speed creates risk.** Fast changes mean fast breakage. A test suite catches a broken feature seconds after it breaks, instead of days later when a user notices.
2. **Tests let Claude check itself.** Claude stops when the work looks done. With tests, "looks done" becomes "proven done," and Claude keeps going until the tests pass.
3. **Tests are a precise specification.** "Each person pays $39.33" is unambiguous in a way that "the split should be correct" never is.

## Kinds of Tests

| Kind | What it checks | Example from this book |
| --- | --- | --- |
| Unit tests | One small piece of logic on its own | `compute_streaks` returns the right numbers across a month boundary |
| API or integration tests | Several pieces working together | Adding a duplicate habit through the API returns 409 |
| End-to-end (browser) tests | The whole app, driven like a user would | Typing a bill amount in a real browser shows the right split |
| Manual testing | Everything else, by a person | Does the app feel right on your phone? |

Most of your automated tests should be fast unit and API tests, with a few end-to-end tests covering the most important user journeys. And manual testing never goes away: automated tests only check what someone thought to check.

## Test-First: Let the Tests Lead

A powerful pattern with Claude is to write the tests *before* the code:

```
I want to add a "budget" command to the expense tracker. First,
write tests that describe the behavior: setting a budget,
showing a warning in the summary when a category is over budget,
and rejecting negative budgets. Run them and confirm they fail.
Don't write the feature yet.
```

Then, once you've read the tests and agree they describe what you want:

```
Now implement the budget command so all the tests pass. Don't
change the tests.
```

This is called **test-driven development**, and it works remarkably well with AI. The tests become a contract you've reviewed, and the implementation has a clear finish line.

> **Warning:** When a test fails, a lazy fix is to change the test so it passes. AI can fall into this trap too, for example by loosening an expected value. Add "Don't change the tests to make them pass. If you think a test is wrong, stop and explain why" to your prompts, and when you review changes, look closely at any edits to test files.

## Thinking of Edge Cases

Bugs live at the edges. When you ask for tests, or test by hand, run through this checklist:

- **Empty**: no input, an empty list, a blank form.
- **Zero, negative, and huge numbers.**
- **Special characters**: apostrophes (O'Brien), emoji, accented letters, HTML like `<b>`.
- **Dates and times**: midnight, month ends, leap years, other time zones.
- **Duplicates**: the same name twice, the same button clicked twice quickly.
- **Old data**: records saved by an earlier version of the app.
- **Failure**: no internet, a missing file, an API that's down.

You can also simply ask: "What edge cases should we test for this feature? List them, then write tests for the important ones."

## Browser Tests with Playwright

Unit tests can't tell you whether the page actually works when someone clicks it. For that, you need an **end-to-end test** that drives a real browser. The most popular tool for this is **Playwright**, and Claude can write Playwright tests for you.

Every web project in this book was checked with Playwright tests. Here's part of the test for the tip calculator:

```
@include tests/test_01_tip_calculator.py#L7-L27
```

Each test opens the page in a real (invisible) browser, types the numbers, clicks the buttons, and checks what's on screen, exactly as a user would, but in a fraction of a second. To use Playwright yourself, ask Claude:

```
Add Playwright browser tests (in Python, with pytest) for this
app. Cover adding a task, marking it done, filtering, and
reloading the page. Set up whatever needs installing, run the
tests, and show me the results.
```

Claude will install the `playwright` package, download a browser for it, and write and run the tests.

## Tests Can Be Wrong Too

Here's a story from writing this book. To check the to-do app's due dates, a test froze the browser's clock at "9 p.m. on October 6" and checked the labels in two time zones: Los Angeles and Tokyo. Los Angeles passed. Tokyo failed: a task due on October 6 showed as "Overdue" instead of "Due today."

It looked like a time zone bug in the app. It wasn't. The *test* was wrong. It had set the time to 9 p.m. without saying which time zone, so the computer running the test used its own clock's zone, UTC. And 9 p.m. UTC on October 6 is 6 a.m. on October 7 in Tokyo. In Tokyo, October 6 really *was* overdue. The app was right.

The fix was one change in the test, which now carries a comment so nobody makes the mistake again:

```
@include tests/test_02_todo_app.py#L89-L90
```

With the time zone stated explicitly, both cities passed.

The lesson: when a test fails, the bug might be in the test. Before asking Claude to "fix the code so the test passes," ask it to "figure out whether the code or the test is wrong, and explain."

## Making Tests a Habit

A few habits keep testing painless:

- **Run the tests after every change.** Better yet, ask Claude to: "run the tests after each step."
- **Every bug gets a test.** When you fix a bug, the test that proves the fix stays forever.
- **Keep tests fast.** A suite that takes seconds gets run; one that takes ten minutes gets skipped.
- **Tell Claude how to test, once.** In Chapter 16, you'll record the test command in a file Claude reads at the start of every session. In Chapter 18, you'll go further, with a hook that runs the tests automatically whenever Claude finishes a task and won't let it stop while any test fails.

> **Tip:** Claude Code includes a built-in `/verify` skill that builds and runs your app to confirm a change actually works, rather than relying only on tests. Try it after a change to a web app.

## How Much Testing Is Enough?

For a personal toy, a few manual checks may be enough. For anything you share, aim for:

- a test for every rule (like streaks, rounding, or validation),
- a test for every bug you've fixed,
- at least one end-to-end test of the most important user journey,
- and a manual check on the devices your users actually use.

The projects in this book reached that bar. Across the six apps, Claude wrote more than 120 tests of its own, and the book's independent checks added 40 more, including browser tests in several time zones, on phone-sized screens, and with an accessibility checker.

> **Try It:** Pick the habit tracker or the to-do app and ask Claude, "What are the five most important behaviors of this app that don't have a test yet? Write tests for them and run them." Read the tests it writes. Do they match how you expect the app to behave?

## Key Takeaways

- With AI writing code quickly, automated tests are your safety net.
- Use unit tests for logic, API tests for the back end, and a few browser tests for key journeys. Keep testing by hand too.
- Test-first works well with Claude: agree on the tests, then let Claude make them pass.
- Watch for tests being weakened to make them pass.
- Bugs live at the edges: empty, zero, huge, special characters, dates, duplicates, old data, and failures.
- A failing test can mean the test is wrong. Ask Claude to determine which.
- Every fixed bug should leave a test behind.
