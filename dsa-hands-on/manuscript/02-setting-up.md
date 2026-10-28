# Chapter 2: Setting Up

This chapter gets your computer ready: Python, a virtual environment, the two packages the book uses, and the book's code. Then you'll write your first function and test it the way every structure in this book is tested.

## Python 3.12 or Newer

The code in this book was run on Python 3.12, 3.13, 3.14 and 3.15, and needs at least 3.12. Check what you have in a terminal (Command Prompt or PowerShell on Windows):

```
$ python3 --version
```

On Windows, the command is usually `python` or `py` instead of `python3`; use whichever works throughout the book. If you have no Python, or one older than 3.12, install the latest from python.org. On a Mac, the installer from python.org is the simplest choice; on Linux, your distribution's package manager or python.org both work.

## The Book's Code

All the code is in the book's repository, **github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on**. Download it as a ZIP file from the green "Code" button, or, if you use Git:

```
$ git clone https://github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on
$ cd data-structures-and-algorithms-in-python-hands-on
```

Inside there's one folder per chapter, `ch01` to `ch33`, each holding that chapter's listings. Every listing has a `.out` file next to it with the output printed in the book, so you can compare.

## A Virtual Environment

A **virtual environment** is a private folder of Python packages for one project, so this book's packages can't clash with anything else on your computer. Create one in the code folder and activate it:

```
$ python3 -m venv .venv
$ source .venv/bin/activate
```

On Windows, the second command is `.venv\Scripts\activate`. Your prompt now starts with `(.venv)`. Activate it again whenever you open a new terminal to work on the book.

Now install the two packages the book uses: **pytest**, for testing, and **matplotlib**, for drawing benchmark charts. The data structures themselves use only Python's standard library.

```
$ pip install -r requirements.txt
```

`requirements.txt` pins the exact versions the book was tested with. Check that everything works:

```python
@include code/ch02/check_setup.py
```

```
@include code/ch02/check_setup.out
```

`sys.version_info` is a tuple like `(3, 13, 5, ...)`, and tuples compare item by item, so `< (3, 12)` is true only for versions older than 3.12. `__import__` imports a module whose name is in a string, so one loop can check both packages.

## Your First Algorithm

Here is a small algorithm: find the largest number in a list, without using Python's `max`.

```python
@include code/ch02/largest.py
```

Keep the best value seen so far, and look at each remaining item once, replacing the best when an item beats it. For a list of n items, it makes n - 1 comparisons. An empty list has no largest item, so the function says so with an exception rather than returning something misleading, as `max([])` does too.

## Your First Tests

How do you know it works? You could run it on a few lists and look. Tests do the same thing, automatically, every time you change the code. pytest finds every function whose name starts with `test_` in files whose names start with `test_`, runs them, and reports any `assert` that fails:

```python
@include code/ch02/test_largest.py
```

The first four tests check chosen cases: one item, the largest at each position, negative numbers and ties, and the empty list, where `pytest.raises` checks that the right exception happens. Chosen cases are good at the edges that you know about.

The last test is different, and it's the most powerful kind in this book. It makes a thousand random lists, of random lengths between 1 and 50, and checks that `largest` agrees with Python's own `max` on every one. You don't have to think of the tricky cases; random inputs find them for you. The `random.Random(2026)` generator is **seeded**: it produces the same "random" lists every time, so if a test fails, it fails the same way again and you can investigate.

Run the tests from the chapter's folder:

```
$ cd ch02
$ python -m pytest -q test_largest.py
```

```
@include code/ch02/test_largest.out
```

Each dot is one passing test. A failure prints an `F` instead, followed by a report that shows the failing `assert` with the values involved. Try it: change `if x > best` to `if x >= best` and run the tests again. They still pass, because the result is the same. Now change it to `if x < best`: every test that has more than one item fails.

> **Tip:** When you write a new data structure, write the random comparison test first. It takes five minutes, and it checks thousands of cases you'd never think to write by hand. Every structure in this book has one.

> **Interesting Fact:** Comparing a fast implementation against a slow, obviously correct one on random inputs has many names: differential testing, stress testing, or, when the inputs are generated from rules, property-based testing. Part VI uses it to check every interview solution, and Chapter 24 shows it catching a bug that looks perfectly fine.

## Running the Book's Listings

Every listing runs from its chapter's folder, like this:

```
$ cd ch06
$ python grow_demo.py
```

Benchmarks also run this way, but take longer: up to a minute or two each, because they repeat every measurement several times. Their output won't match the book's exactly, because your computer isn't the one the book's numbers came from. What should match is the pattern: which option is faster, and how each one's time grows.

## Key Takeaways

- The book needs Python 3.12 or newer, a virtual environment, and two packages: pytest and matplotlib.
- Every listing is in the book's repository, by chapter, with its expected output.
- pytest runs every `test_` function and reports failed `assert`s.
- Test with chosen cases for the edges you know, and with random cases compared against a trusted implementation for the ones you don't.
- Seed random tests, so a failure can be repeated.

## Exercises

1. **Smallest and largest.** Write `min_and_max(numbers)`, which returns both the smallest and the largest item in one pass. Then write a random test that compares it with Python's `min` and `max`. Can you do it in about 1.5 comparisons per item instead of 2? (Hint: look at the items in pairs.)
2. **A bug the tests catch.** Change `largest` so it starts from `best = 0` instead of `numbers[0]`. Which tests fail? If you deleted the test with negative numbers, would the random test still catch the bug, and why?
