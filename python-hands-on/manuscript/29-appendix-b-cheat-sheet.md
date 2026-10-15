# Appendix B: Python Cheat Sheet

A quick reminder of the syntax used most often in this book. Every example here is a tested shell session; the chapter numbers show where each topic is explained.

## Values, Numbers and Strings

Chapters 2, 3 and 9.

```
@include code/appendix/values.txt
```

`round(2.675, 2)` gives 2.67, not 2.68, because 2.675 can't be stored exactly as a float; use `decimal.Decimal` for money (Chapter 11).

## Lists, Tuples, Dictionaries and Sets

Chapters 6, 7 and 14.

```
@include code/appendix/collections.txt
```

## Decisions, Loops, Errors and Matching

Chapters 4, 5, 10 and 20.

```
@include code/appendix/control.txt
```

## Functions, Classes and Generators

Chapters 8, 12, 13, 14 and 20.

```
@include code/appendix/functions_classes.txt
```

## Files

Chapter 10. Always give `encoding="utf-8"`.

| Task | Code |
| --- | --- |
| Read a whole text file | `text = Path("notes.txt").read_text(encoding="utf-8")` |
| Write a whole text file | `Path("notes.txt").write_text(text, encoding="utf-8")` |
| Read line by line | `with open("notes.txt", encoding="utf-8") as f:` then `for line in f:` |
| Add to the end | `with open("log.txt", "a", encoding="utf-8") as f:` then `f.write("...\n")` |
| Read a CSV file | `rows = list(csv.DictReader(f))`, with `open(..., newline="")` |
| Read and write JSON | `json.loads(text)` and `json.dumps(data, indent=2)` |
| List a folder | `for path in Path("folder").iterdir():` |
| Join paths | `Path("folder") / "file.txt"` |

## Command Line

| Task | Command |
| --- | --- |
| Run a program | `python program.py` (on macOS, `python3`) |
| Start the shell | `python`, and `exit()` to leave |
| Create a virtual environment | `python -m venv .venv` |
| Activate it | `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` |
| Install a package | `python -m pip install name` |
| Install from a list | `python -m pip install -r requirements.txt` |
| Run tests | `python -m pytest` |
| Check types | `python -m mypy program.py` |
| Run a package | `python -m package_name` |
| Stop a running program | Ctrl+C |
