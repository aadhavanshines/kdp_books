# Chapter 11: Modules and the Standard Library

As programs grow, one file isn't enough. A **module** is simply a Python file whose functions and variables other files can use. Python comes with hundreds of modules, called the **standard library**, which handle dates, random numbers, statistics, files and folders, command-line arguments and much more. People often say Python comes with "batteries included". In this chapter you'll write your own module, take a tour of the most useful standard modules, and build two small tools: a folder tidier and a command-line program.

## Importing a Module

Any `.py` file is a module. Here's a small one, `shapes.py`:

```
@include code/ch11/shapes.py
```

A second file in the same folder can use it:

```
@include code/ch11/use_shapes.py
```

```
@include code/ch11/use_shapes.out
```

There are two forms of import:

- `import shapes` runs `shapes.py` once and makes its contents available with a prefix: `shapes.circle_area`, `shapes.UNIT`. The prefix makes clear where each name comes from.
- `from shapes import rectangle_area` makes one name available directly, without a prefix. It's shorter, but readers have to look at the imports to see where `rectangle_area` comes from.

You can also rename an import: `import statistics as stats`. Avoid `from shapes import *`, which imports everything; it makes code hard to follow and can silently replace names you already have. Put imports at the top of the file.

## Scripts and Modules: `__name__`

When `use_shapes.py` imports `shapes`, nothing is printed, even though `shapes.py` ends with two `print` calls. That's because of the last block in `shapes.py`. Python sets a special variable, `__name__`, to `"__main__"` in the file you run, and to the module's name in a file that's imported. So the code under `if __name__ == "__main__":` runs only when you run `shapes.py` directly:

```
@include code/ch11/shapes.out
```

This lets a file be both a useful module and a program you can run to try it out. You'll see this pattern in most Python files, including the exercise solutions in this book.

## A Tour of the Standard Library

These modules come with every Python installation:

```
@include code/ch11/stdlib_tour.py
```

```
@include code/ch11/stdlib_tour.out
```

- **math** has mathematical functions and constants: square roots, rounding down (`floor`) and up (`ceil`), trigonometry and `pi`.
- **random** makes random choices. `random.seed(1)` makes the sequence repeatable, as in Chapter 5. `choice` picks one item from a list and `shuffle` mixes a list in place.
- **statistics** calculates the mean (average), median (middle value) and mode (most common value), and more.
- **collections** has specialized containers. A `Counter` counts things for you, replacing the `get` pattern from Chapter 7, and `most_common(2)` gives the top two. A `defaultdict(list)` creates an empty list the first time you use a new key, so you can append straight away.
- **decimal** does exact decimal arithmetic, which is what you want for money. Create decimals from strings, like `Decimal("19.99")`, and `quantize` rounds to a given number of places.

## Dates and Times

The `datetime` module handles dates, times and the differences between them:

```
@include code/ch11/dates.py
```

```
@include code/ch11/dates.out
```

Subtracting two dates gives a `timedelta`, whose `days` is the number of days between them. Adding a `timedelta` moves a date forward. `strftime` ("string format time") formats a date with codes such as `%A` for the weekday name, `%d` for the day, `%B` for the month name and `%Y` for the four-digit year; `strptime` ("string parse time") reads a date from text in a given format. `isoformat` gives the international standard format, `2026-10-15T14:30:00`, which sorts correctly and is the best choice for files.

The program uses fixed dates so that its output always matches the book. In your own programs, `date.today()` and `datetime.now()` give the current date and time.

## Project: Tidy a Folder

Everybody has a downloads folder full of mixed files. This program sorts a folder's files into subfolders by type:

```
@include code/ch11/tidy_folder.py
```

```
@include code/ch11/tidy_folder.out
```

The `/` operator joins paths: `folder / "images"` is the `images` folder inside `files_to_tidy`, written correctly for your operating system. `iterdir` lists what's in a folder, `suffix` gives a file's extension, `mkdir(exist_ok=True)` creates a folder unless it's already there, and `rename` moves a file. Finally, `rglob("*")` lists everything in the folder and all its subfolders. On Windows, the paths print with backslashes instead of forward slashes.

> **Warning:** Programs that move, rename or delete files can do a lot of damage very quickly. Try them on a copy of a folder first, or make them print what they would do before they do it. Chapter 26 shows how to add a "dry run" option.

## Project: A Command-Line Tool

Many useful programs take their settings from the command line instead of asking questions. The `argparse` module reads command-line arguments, checks them, and writes the help text for you:

```
@include code/ch11/greet_cli.py
```

Run with `python greet_cli.py Zara --times 2 --shout`, it prints:

```
@include code/ch11/greet_cli.out
```

`name` is a **positional argument**: required, and identified by its position. `--times` and `--shout` are **options**: they're optional and identified by name. `type=int` converts the text to a number (and gives a clear error if it isn't one), and `action="store_true"` makes `--shout` a switch that's `True` when present. Run `python greet_cli.py --help` and `argparse` prints a usage summary built from the descriptions; run it without a name and it explains what's missing.

## Finding More

The standard library is documented at docs.python.org, under "Library Reference". When you need to do something common, such as compressing files, sending email, reading web pages or working with times in other time zones, check there first: it's often already done. Beyond the standard library, the **Python Package Index** (PyPI) has hundreds of thousands of packages written by others. Chapter 17 shows how to install them safely.

## Try It

1. Run `python shapes.py`, then `python use_shapes.py`. Explain why "Testing shapes.py" appears only once.
2. Use `datetime` to calculate how many days old you are, using your real birthday and `date.today()`.
3. Run `greet_cli.py` with `--help`, then with `--times two`. Read the messages.

## Exercises

1. **Dice.** Write `roll_dice(rolls, seed=None)`, which rolls two dice `rolls` times and returns a `Counter` of the totals. Print a bar of `#` signs for each total from 2 to 12. Which total is most common? (Hint: `random.Random(seed)` makes a separate random number generator, so a seed doesn't affect the rest of the program.)
2. **Days between.** Write `days_between(a, b)`, which takes two dates as `"YYYY-MM-DD"` strings and returns the number of days between them, whichever comes first. (Hint: `date.fromisoformat`.)

## Key Takeaways

- Any `.py` file is a module. `import module` gives access with a prefix; `from module import name` imports one name.
- Code under `if __name__ == "__main__":` runs only when the file is run directly, not when it's imported.
- The standard library covers maths, randomness, statistics, counting, exact decimals, dates, files and folders, and command-line arguments, among much else.
- `pathlib` paths join with `/` and can be listed, created and moved. `argparse` turns command-line arguments into a tidy object, with help text for free.
