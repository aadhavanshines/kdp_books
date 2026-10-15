# Appendix C: Common Errors and How to Fix Them

Every programmer sees these errors every day. Read the last line of the traceback first: it names the error and gives the reason. Then look at the frames above it, from the bottom, for the first line in your own code (Chapter 16).

## The Messages

These are the exact messages, tested on Python 3.12 to 3.15. Your tracebacks will also show the file and line:

```
@include code/appendix/errors.txt
```

## What They Mean

| Error | Usual cause | Fix |
| --- | --- | --- |
| `SyntaxError` | A missing quote, bracket or colon; a misspelled keyword | Check the line shown and the line before it (Chapter 1) |
| `IndentationError` | A block not indented after a colon, or mixed tabs and spaces | Indent blocks by four spaces; let your editor do it (Chapter 4) |
| `NameError` | A typo in a name, or using a variable before assigning it | Check the spelling; Python often suggests the right name (Chapter 2) |
| `TypeError` | An operation on the wrong type, such as `str + int`; a function called with the wrong number of arguments | Convert with `str()`, `int()` or `float()`, or use an f-string; check the call (Chapters 2 and 8) |
| `ValueError` | The right type with a wrong value, such as `int("twelve")` | Check input with `try` and `except`, and ask again (Chapter 10) |
| `KeyError` | A dictionary key that isn't there | Use `in` or `get(key, default)` (Chapter 7) |
| `IndexError` | A list index past the end; the last index is `len(items) - 1` | Check the length; loop over items rather than indexes (Chapter 6) |
| `AttributeError` | A method that the type doesn't have, or a value that's unexpectedly `None` | Check the type with `type(x)`; find where the `None` came from (Chapters 12 and 19) |
| `ZeroDivisionError` | Dividing by zero, often an average of an empty list | Check for zero or empty input first (Chapter 5) |
| `FileNotFoundError` | A wrong file name, or running the program from a different folder | Check the name and the current folder (Chapter 10) |
| `ModuleNotFoundError` | A package not installed, or installed in a different environment | Activate the right virtual environment and `python -m pip install` it (Chapter 17) |
| `UnboundLocalError` | Assigning to a global variable inside a function | Pass the value in as a parameter and `return` the result (Chapter 8) |
| `RecursionError` | A recursive function without a base case that stops it | Add or fix the base case (Chapter 8) |

## Mistakes Without Error Messages

These don't stop your program; they make it give wrong answers.

- **Adding input without converting it.** `input` returns text, so `"12" + "30"` is `"1230"`. Convert with `int` or `float` (Chapter 3).
- **`==` where you meant `=`.** A line such as `total == 0` compares and throws the answer away; `total` doesn't change. (The opposite mistake, `=` in an `if` condition, is caught with a `SyntaxError`.) (Chapter 4)
- **Off-by-one ranges.** `range(1, 10)` stops at 9. `range(len(items))` starts at 0 (Chapters 5 and 16).
- **Comparing floats exactly.** `0.1 + 0.2 == 0.3` is `False`. Round, use `math.isclose`, or use `Decimal` for money (Chapters 2 and 11).
- **Two names for one list.** `b = a` doesn't copy a list; changing `b` changes `a`. Use `a.copy()` (Chapter 6).
- **A list as a default value**, as in `def f(items=[])`: the same list is shared by every call. Use `None` and create the list inside the function, or `field(default_factory=list)` in a dataclass (Chapters 12 and 13).
- **Changing a list while looping over it.** Items get skipped. Loop over a copy, or build a new list (Chapter 6).
- **`return` inside a loop by accident.** The function stops after the first item. Check the indentation of `return`.
- **A generator used twice.** The second time it's empty. Make a list if you need the values more than once (Chapter 14).

## Installation and Environment Problems

- **`python` is not recognized** (Windows) or **command not found**: Python isn't installed, or the terminal was opened before installing. Open a new terminal; on macOS and Linux, try `python3` (Chapter 1).
- **`externally-managed-environment`** when installing a package: your system protects its own Python. Create and activate a virtual environment first (Chapter 17).
- **A package is installed, but `import` fails**: it was installed for a different Python. Always install with `python -m pip`, inside the activated environment.
- **`UnicodeDecodeError`** when reading a file: the file isn't in the expected encoding. Pass `encoding="utf-8"` when reading and writing (Chapter 10).
