# Chapter 10: Files and Exceptions

Until now, everything your programs knew was lost when they ended. Files fix that: a program can save its data and read it back next time. Files also bring new ways for things to go wrong, such as a missing file, damaged data, or a disk that's full, so this chapter also covers **exceptions**: how to catch errors, recover from them and raise your own. At the end, Pocket Library will remember your books between runs.

## Reading and Writing Text Files

The easiest way to work with files is the `Path` class from the `pathlib` module. A `Path` represents a file or folder name and has methods to read, write and inspect it:

```
@include code/ch10/write_and_read.py
```

```
@include code/ch10/write_and_read.out
```

- `write_text` creates the file, or replaces it completely if it exists, and writes a string to it. `\n` is the **newline** character, which ends a line.
- `open("a")` opens the file for **appending**: writing at the end, keeping what's there. `"w"` would empty it first and `"r"`, the default, opens it for reading.
- `read_text` reads the whole file into one string. For large files, loop over the open file instead, as the second block does: each pass gives one line, including its newline, which `rstrip` removes.
- `exists` checks whether the file is there; `stat().st_size` gives its size in bytes.

The `with` statement opens the file and guarantees that it's closed again when the block ends, even if an error happens inside it. Always use `with` when you open a file. Chapter 18 explains how it works.

> **Tip:** Always pass `encoding="utf-8"`. Without it, Python uses your computer's default encoding, which differs between Windows and other systems, and a file with accented letters or symbols written on one computer may not read correctly on another.

Relative file names like `notes.txt` refer to the **current working directory**: the folder you were in when you ran the program. If a program can't find a file that's clearly there, check which folder you ran it from.

## CSV Files

A **CSV** (comma-separated values) file is a simple spreadsheet: one row per line, with the fields separated by commas. Spreadsheet programs can open and save CSV files, which makes them the most common way to exchange tabular data. Here's `books.csv`:

```
@include code/ch10/books.csv
```

The `csv` module reads and writes them correctly, including awkward cases like a comma inside a field:

```
@include code/ch10/csv_report.py
```

```
@include code/ch10/csv_report.out
```

`csv.DictReader` reads each row as a dictionary, using the first line for the keys. Everything it reads is a string, so convert numbers with `int` or `float` before calculating, and compare with strings, as in `book["rating"] == "5"`. `csv.writer` writes rows given as lists. Open CSV files with `newline=""`, as here; the `csv` module handles line endings itself.

## JSON Files

**JSON** (JavaScript Object Notation) stores nested data, like dictionaries containing lists, as text. It looks almost exactly like Python, and it's the standard format for settings files and for data sent over the web:

```
@include code/ch10/json_demo.py
```

```
@include code/ch10/json_demo.out
```

`json.dumps` turns Python values into JSON text, and `indent=2` makes it readable; `json.loads` turns JSON text back into Python values. JSON writes `True`, `False` and `None` as `true`, `false` and `null`, and it has no tuples or sets: tuples come back as lists, and sets can't be saved directly.

## Exceptions

When something goes wrong while a program runs, Python **raises an exception**. If nothing handles it, the program stops and prints a traceback. You've seen many: `NameError`, `TypeError`, `ValueError`. A `try` statement lets you handle them:

```
@include code/ch10/exceptions.py
```

```
@include code/ch10/exceptions.out
```

Python runs the `try` block. If an exception of the type named in `except` happens, Python jumps to the `except` block instead of stopping. The optional `else` block runs only if there was no exception, and `finally` runs in every case, which makes it the place for clean-up. `except ValueError as error` gives the exception a name, so you can print its message.

Catch only the exceptions you expect and know how to handle, and keep the `try` block short. A bare `except:` that catches everything also hides typos and real bugs.

## Asking Until the Answer Is Valid

In Chapter 3, typing `twelve` instead of a number crashed the program. Now you can fix that:

```
@include code/ch10/ask_number.py
```

```
@include code/ch10/ask_number.out
```

This function handles both kinds of bad input: text that isn't a number (`int` raises `ValueError`, and the `except` block asks again) and a number outside the range (checked with an `if`). It returns only when it has a valid answer. You'll find a function like this useful in many programs.

## When a File Is Missing

Files are a common source of exceptions: the file isn't there, it's in a different folder, or you don't have permission to read it.

```
@include code/ch10/missing_file.py
```

```
@include code/ch10/missing_file.out
```

The first attempt catches `FileNotFoundError` and carries on with an empty text. The second has no `try`, and the program stops. Notice that the traceback is longer this time: the error happened inside Python's own `pathlib` code, which your program called. Read it from the bottom: the last line says what went wrong, and the **first** frame that names your file says which of your lines caused it. The frames in between are Python's own code; their details differ between Python versions.

## Raising Your Own Exceptions

Your functions can raise exceptions too, when they're asked to do something that makes no sense:

```
@include code/ch10/raise_errors.py
```

```
@include code/ch10/raise_errors.out
```

`raise ValueError(...)` stops the function and hands the problem to the caller, with a message explaining it. That's better than quietly storing a rating of 9, which would cause a confusing problem much later. The caller decides what to do: here, it catches the error and prints the message.

## Project: Pocket Library, Version 4

Version 4 loads the library from `library.json` when it starts and saves it when it ends:

```
@include code/ch10/library_v4.py
```

Starting with the three books in `library.json` and adding one more:

```
@include code/ch10/library_v4.out
```

Run it again and the new book is still there. `load_books` handles a missing file (the first run, before anything has been saved) by returning an empty list, and a damaged file by saying so and starting again. `ask_year` uses the pattern from `ask_int`. The rest of the program doesn't need to know about JSON at all: it calls `load_books` and `save_books`. If you later change how books are stored, as Chapter 23 does with a database, only those two functions change.

## Try It

1. Run `library_v4.py` twice, adding a book each time. Open `library.json` in a text editor and look at it.
2. Damage `library.json` by deleting a bracket, and run the program again. Then put the bracket back.
3. In `exceptions.py`, call `safe_divide("10", 2)`. Which exception is it, and why isn't it caught?

## Exercises

1. **File statistics.** Write `file_stats(path)`, which returns a tuple of the number of lines, words and characters in a text file.
2. **Average rating.** Write `average_rating(csv_path)`, which returns the average of the `rating` column in a CSV file like `books.csv`.
3. **Safe division.** Write `divide(a_text, b_text)`, which divides two numbers given as strings and returns the result as a string, or a friendly message for text that isn't a number and for division by zero.

## Key Takeaways

- `Path.read_text` and `write_text` read and write whole files; `with open(...)` handles files line by line and closes them safely. Always give `encoding="utf-8"`.
- Use the `csv` module for spreadsheets and the `json` module for nested data and settings.
- `try` and `except` handle exceptions you expect; `else` runs when there was none and `finally` always runs. Catch specific exceptions only.
- `raise` reports a problem to the caller. Keep file handling in a few functions so that the rest of the program doesn't depend on the format.
