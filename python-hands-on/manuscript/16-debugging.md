# Chapter 16: Debugging, Logging and Reading Tracebacks

Every programmer spends a large part of their time finding out why a program doesn't do what they expected. That's **debugging**, and it's a skill you can learn like any other. In this chapter you'll read a long traceback with confidence, find a bug that produces no error at all, step through a running program with Python's debugger, and use **logging** to record what a program does without cluttering it with `print` calls.

## Reading a Long Traceback

When an error happens deep inside a chain of function calls, the traceback shows the whole chain:

```
@include code/ch16/deep_traceback.py
```

```
@include code/ch16/deep_traceback.out
```

Read it in this order:

1. **The last line**: the type of error and its message. Python couldn't convert `' free'` to a float. Notice the space at the start of the string; the message quotes the value exactly.
2. **The frames, from the bottom up.** Each frame is one function call, with the file, the line number and the function's name. The bottom frame is where the error happened: `float(...)` in `parse_price`. The one above it is the line that called `parse_price`, and so on, up to the line at the top of your program that started it all.
3. **Decide where the fix belongs.** The error happened in `parse_price`, but is the bug there? `parse_price` assumes it gets a price, and `order_total` passed it the text after the colon, without checking. The real question is what should happen when an item is free. The traceback tells you where the problem showed up; you decide where it should be fixed.

The `~~~^^^` markers under each line show which part of the line was running. They're especially useful when a line contains several calls.

## Bugs Without Errors

The hardest bugs produce no error, only a wrong answer:

```
@include code/ch16/average_bug.py
```

```
@include code/ch16/average_bug.out
```

When a result is wrong, work like a scientist:

1. **Reproduce it** with the smallest input that shows the problem. A list of three numbers is easier to reason about than a file of thousands.
2. **Know what you expect.** The average of 10, 20 and 30 is 20. The program says 16.67, which is 50 divided by 3: the total is missing 10, the first number.
3. **Form a hypothesis and test it.** "The loop skips the first item." Print `i` in the loop, or check `range(1, len(numbers))` in the shell. It starts at 1.
4. **Fix it, then check the fix**, preferably with a test, so the bug can't return.

The fixed version is shorter, because Python's `sum` does the work, and it handles the empty list, which would have divided by zero:

```
@include code/ch16/average_fixed.py
```

```
@include code/ch16/average_fixed.out
```

The `assert` statements check the results right in the program. They're a lightweight form of the tests from Chapter 15.

> **Tip:** Explaining your code, line by line, to someone else, or even to a rubber duck on your desk, is a famously effective way to find bugs. Saying what each line does forces you to notice what it actually does, not what you meant it to do.

## Print Debugging

The simplest debugging tool is `print`. Add `print(f"{i=} {total=}")` inside the loop, and you see each step. The `=` in an f-string, from Chapter 3, prints the name with the value. Print debugging is quick and works everywhere; just remember to remove the prints when you're done.

## The Python Debugger

For harder problems, a **debugger** lets you pause a running program and look around. Python's debugger is called **pdb**, and the easiest way to start it is to put `breakpoint()` where you want to stop. Here's a program that should take 10% off each price:

```
@include code/ch16/debug_me.py
```

It prints `[18.99, 5.0]`, but 10% off 19.99 is 17.99, and 10% off 5.00 is 4.50. Run it, and it stops at the breakpoint with a `(Pdb)` prompt, where you can type commands. Here's the session, with the commands that were typed after each prompt:

```
@include code/ch16/debug_me.out
```

`p` prints an expression using the program's variables at that moment. `price` and `percent` are as expected, but `price * percent // 100` is `1.0`, not `1.999`. There's the bug: `//` rounds down. It should be `/`. `c` continues until the next breakpoint, which here is the next pass through the loop, and finally the program finishes.

The most useful pdb commands:

| Command | What it does |
| --- | --- |
| `p expression` | Print the value of an expression |
| `n` | Run the next line (stepping over function calls) |
| `s` | Step into the function called on this line |
| `c` | Continue until the next breakpoint |
| `l` | List the code around the current line |
| `w` | Show where you are: the chain of calls |
| `q` | Quit the program |

In a real terminal, the first line shows the full path to the file. Python 3.12 and older stop on the line **after** `breakpoint()` rather than on it; the commands work the same. Code editors such as Visual Studio Code have a graphical debugger with the same abilities: click in the margin to set a breakpoint, and hover over variables to see their values.

> **Note:** Remove `breakpoint()` calls when you've found the bug. A program that stops and waits for debugger commands is very confusing for its users.

## Logging

Print statements are for you, while you work. **Logging** is for the life of a program: a record of what it did, which you can turn up when investigating a problem and down when everything's fine. The `logging` module is part of the standard library:

```
@include code/ch16/logging_demo.py
```

```
@include code/ch16/logging_demo.out
```

Each message has a **level**, from least to most serious: `DEBUG` (details for developers), `INFO` (normal events), `WARNING` (something unexpected, but the program carries on), `ERROR` and `CRITICAL`. `basicConfig` sets which levels are shown and how messages look. Halfway through, the program raises the level to `WARNING`, and from then on, only warnings appear. The code that logs doesn't change at all; only the setting does.

Give each module its own logger with `logging.getLogger(name)`; the name appears in each message, so you can see where it came from. Notice the style of the calls: `log.debug("borrow(%r) called", title)` passes the values separately instead of using an f-string. The logging module fills them in only if the message is actually shown, which saves work for messages that are switched off.

In a real application, you'd send the log to a file as well as, or instead of, the screen: `logging.basicConfig(filename="app.log", ...)`. When a user reports a problem, the log tells you what happened.

## Try It

1. Fix `parse_price` so that `"free"` counts as 0. Where else could you fix it?
2. Run `debug_me.py` yourself. At the `(Pdb)` prompt, try `l`, `w` and `p result`, then fix the bug.
3. In `logging_demo.py`, change the first level to `logging.INFO`. Which messages disappear?

## Exercises

1. **Safe conversion.** Write `safe_int(text, default=0)`, which converts text to an integer and returns the default if it can't, logging a warning that shows the bad text.
2. **Median.** The function below should return the middle value of a list, or the average of the two middle values when the list has an even length. It has two bugs. Find and fix them, and make it raise a `ValueError` for an empty list.

```
@include code/ch16/median_bug.py
```

```
@include code/ch16/median_bug.out
```

## Key Takeaways

- Read tracebacks from the bottom: the error, then the frames from where it happened back to where it started. Then decide where the fix belongs.
- For wrong answers without errors, reproduce with a small input, know the expected result, test a hypothesis, and fix with a test.
- `breakpoint()` starts the pdb debugger: `p` prints, `n` steps, `c` continues, `q` quits.
- Use `logging` instead of `print` for messages that should stay in a program. Levels let you turn detail up or down without changing the code.
