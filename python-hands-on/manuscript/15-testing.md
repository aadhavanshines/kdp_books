# Chapter 15: Testing with pytest

How do you know your program works? So far, you've run it and looked at the output. That's fine for a short script, but it doesn't scale: every time you change something, you'd have to try every case again by hand, and sooner or later you'd forget one. **Automated tests** are small programs that check your code for you, in seconds, every time. In this chapter you'll write tests with **pytest**, the most popular testing tool for Python, see what a failing test tells you, and learn the habits that make testing worthwhile.

## Installing pytest

pytest isn't part of the standard library, so you need to install it. The safe way is inside a **virtual environment**: a private folder of packages for one project, which keeps it separate from other projects and from your system's Python. Chapter 17 explains virtual environments properly; for now, follow these steps in your project folder.

Create the environment (once per project):

```
$ python -m venv .venv
```

Activate it (each time you open a new terminal). On Windows:

```
$ .venv\Scripts\activate
```

On macOS and Linux:

```
$ source .venv/bin/activate
```

Your prompt now starts with `(.venv)`. Install pytest:

```
$ python -m pip install pytest
```

The book's code folder has a `requirements.txt` file listing the exact versions the examples were tested with. `python -m pip install -r requirements.txt` installs them all, including the packages for later chapters.

## Your First Tests

Here's a small module of text statistics, the kind of functions you wrote in Chapter 9:

```
@include code/ch15/textstats.py
```

`reading_time_minutes` uses a trick worth knowing: `-(-words // words_per_minute)` divides and rounds **up**, because `//` always rounds down and the two minus signs turn that into rounding up. 201 words at 200 words per minute is 2 minutes, not 1. (`math.ceil(words / words_per_minute)` does the same.)

Tests for it go in a file whose name starts with `test_`:

```
@include code/ch15/test_textstats.py
```

A test is a function whose name starts with `test_`, containing `assert` statements. `assert` checks that a condition is true; if it isn't, the test fails. Run pytest in the folder:

```
$ python -m pytest -q test_textstats.py
```

```
@include code/ch15/test_textstats.out
```

Each dot is a passing test. There are five test functions but nine tests, because `test_reading_time` is **parametrized**: `@pytest.mark.parametrize` runs it once for each pair of values in the list, five times in all. That's the easiest way to test many cases without writing many functions.

> **Note:** pytest prints how long the tests took. Your times will differ; the book always shows `0.01s`.

## Choosing What to Test

Look at the cases in `test_textstats.py`. They aren't random:

- **A normal case**, such as three words, to show the function does its main job.
- **Edge cases**: empty text, extra spaces, punctuation. Bugs live at the edges.
- **Boundaries**: 200 words is exactly one minute and 201 words just over, so the test checks both sides of the line where the answer changes, and 0 words, where the rule is different.

Each test checks one thing and has a name that says what. When a test fails, its name tells you what's broken before you read any code.

## When a Test Fails

Here's a function that applies a discount, and four tests for it:

```
@include code/ch15/discount.py
```

```
@include code/ch15/test_discount.py
```

```
@include code/ch15/test_discount.out
```

The `F` is a failure, and pytest explains it in detail: which test, the line, the values on both sides of the comparison (`0.0 == 1.0`) and where the left-hand value came from (`apply_discount(10.0, 100)`). Here, the code is right and the test is wrong: 100% off 10.00 is 0.00, not 1.00. That happens. A failing test means the code and the test disagree, and you have to decide which one is mistaken.

`pytest.raises` checks that code raises an exception. `test_rejects_bad_percent` passes only if `apply_discount(10.0, 120)` raises `ValueError`. Testing that bad input is rejected is as important as testing that good input works.

> **Warning:** Compare floats with care. `0.1 + 0.2 == 0.3` is `False`, as you saw in Chapter 2. `apply_discount` rounds to cents, which makes exact comparison safe here. For results that aren't rounded, use `pytest.approx`: `assert result == pytest.approx(0.3)`.

## Fixtures

Many tests need something set up first: a file, a database, an object with some data. A **fixture** is a function that prepares it. A test asks for a fixture by naming it as a parameter:

```
@include code/ch15/test_library_fixture.py
```

```
@include code/ch15/test_library_fixture.out
```

`@pytest.fixture` marks `library_file` as a fixture. When pytest sees a test with a parameter called `library_file`, it calls the fixture and passes in the result. `tmp_path` is a fixture that pytest provides itself: a new, empty temporary folder for each test. Tests that use it never touch your real files, and never affect each other.

## Testing Habits

- **Run the tests often**: after every change. They're only useful if they run.
- **Write a test for every bug you fix.** First write a test that fails because of the bug, then fix the code and watch the test pass. The bug can never come back unnoticed.
- **Keep tests fast and independent.** Each test should set up what it needs and not depend on other tests running first.
- **Test behavior, not details.** Test what a function returns for given inputs, not how it works inside, so you can improve the code without rewriting the tests.
- **Design for testing.** Functions that take inputs and return results are easy to test. Functions that ask questions with `input` or print their results are not. That's why this book keeps calculations separate from input and output.

Some programmers write the test before the code. This is called **test-driven development**. Even if you don't work that way, writing a test makes you decide exactly what a function should do, which often improves the design.

## Try It

1. Fix the mistaken test in `test_discount.py` and run pytest again.
2. Add a parametrized test for `word_count` with four cases of your own.
3. Break `reading_time_minutes` on purpose by using `/` instead of the `-(-a // b)` trick. Which tests fail?

## Exercises

1. **Leap years.** Turn your leap-year program from Chapter 4 into a function `is_leap_year(year)` and write a parametrized test with 2024, 2023, 1900 and 2000.
2. **FizzBuzz.** Turn FizzBuzz from Chapter 5 into a function `fizzbuzz(n)` that returns the text for one number, and test it with 1, 3, 5, 15 and 30.

## Key Takeaways

- Tests are functions named `test_...` in files named `test_*.py`, using `assert`. Run them with `python -m pytest`.
- Install packages like pytest inside a virtual environment: `python -m venv .venv`, activate it, then `python -m pip install`.
- Test normal cases, edge cases and boundaries. `parametrize` runs one test with many inputs; `pytest.raises` checks exceptions.
- Fixtures prepare what tests need; `tmp_path` gives each test its own temporary folder. Write a test for every bug you fix.
