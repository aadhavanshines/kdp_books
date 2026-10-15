# Appendix A: Solutions to the Exercises

Here are worked solutions to every exercise in the book. Each one was run on Python 3.12, 3.13, 3.14 and 3.15, and the output shown is the output it produced. There's usually more than one good answer: if yours works and you can explain it, it's right. Compare it with the one here for ideas.

## Chapter 1: Welcome to Python

Your text will differ: any program that prints your details and lets Python calculate `365 * 24` is correct.

```
@include code/ch01/solution_about_me.py
```

```
@include code/ch01/solution_about_me.out
```

The calculations in the shell:

```
@include code/ch01/solution_session.txt
```

## Chapter 2: Variables, Numbers and Strings

```
@include code/ch02/solution_1_rectangle.py
```

```
@include code/ch02/solution_1_rectangle.out
```

```
@include code/ch02/solution_2_seconds.py
```

```
@include code/ch02/solution_2_seconds.out
```

```
@include code/ch02/solution_3_initials.py
```

```
@include code/ch02/solution_3_initials.out
```

## Chapter 3: Input, Output and Conversions

Each program is shown with a sample run.

```
@include code/ch03/solution_1_temperature.py
```

```
@include code/ch03/solution_1_temperature.out
```

```
@include code/ch03/solution_2_days.py
```

```
@include code/ch03/solution_2_days.out
```

```
@include code/ch03/solution_3_receipt.py
```

```
@include code/ch03/solution_3_receipt.out
```

## Chapter 4: Making Decisions

```
@include code/ch04/solution_1_leap_year.py
```

```
@include code/ch04/solution_1_leap_year.out
```

```
@include code/ch04/solution_2_largest.py
```

```
@include code/ch04/solution_2_largest.out
```

```
@include code/ch04/solution_3_bmi.py
```

```
@include code/ch04/solution_3_bmi.out
```

## Chapter 5: Loops

For FizzBuzz, test divisibility by 15 first; otherwise 15 would print `Fizz`. The password program uses the `for` loop's `else` block, which runs only when the loop ends without `break`.

```
@include code/ch05/solution_1_fizzbuzz.py
```

```
@include code/ch05/solution_1_fizzbuzz.out
```

```
@include code/ch05/solution_2_digit_sum.py
```

```
@include code/ch05/solution_2_digit_sum.out
```

```
@include code/ch05/solution_3_password.py
```

```
@include code/ch05/solution_3_password.out
```

## Chapter 6: Lists and Tuples

```
@include code/ch06/solution_1_scores.py
```

```
@include code/ch06/solution_1_scores.out
```

```
@include code/ch06/solution_2_unique.py
```

```
@include code/ch06/solution_2_unique.out
```

```
@include code/ch06/solution_3_rotate.py
```

```
@include code/ch06/solution_3_rotate.out
```

## Chapter 7: Dictionaries and Sets

```
@include code/ch07/solution_1_invert.py
```

```
@include code/ch07/solution_1_invert.out
```

```
@include code/ch07/solution_2_letters.py
```

```
@include code/ch07/solution_2_letters.out
```

```
@include code/ch07/solution_3_friends.py
```

```
@include code/ch07/solution_3_friends.out
```

## Chapter 8: Functions

All three functions are in one file. The `if __name__ == "__main__":` block, explained in Chapter 11, runs the examples only when the file is run directly.

```
@include code/ch08/solution_functions.py
```

```
@include code/ch08/solution_functions.out
```

## Chapter 9: Working with Text

`ord` and `chr` convert between characters and numbers; `% 26` wraps from Z back to A.

```
@include code/ch09/solution_text.py
```

```
@include code/ch09/solution_text.out
```

## Chapter 10: Files and Exceptions

The examples use `books.csv` from the chapter.

```
@include code/ch10/solution_files.py
```

```
@include code/ch10/solution_files.out
```

## Chapter 11: Modules and the Standard Library

The bars show the familiar shape of two dice: 7 is the most common total, and 2 and 12 the rarest.

```
@include code/ch11/solution_stdlib.py
```

```
@include code/ch11/solution_stdlib.out
```

## Chapter 12: Classes and Objects

```
@include code/ch12/solution_classes.py
```

```
@include code/ch12/solution_classes.out
```

## Chapter 13: Inheritance, Dataclasses and Special Methods

`Fraction` stores fractions in lowest terms, with any minus sign on top, so that equal fractions compare equal.

```
@include code/ch13/solution_oop.py
```

```
@include code/ch13/solution_oop.out
```

## Chapter 14: Comprehensions, Iterators and Generators

```
@include code/ch14/solution_iteration.py
```

```
@include code/ch14/solution_iteration.out
```

## Chapter 15: Testing with pytest

The functions under test are in `solution_tests.py`; the tests are in `test_solution_tests.py`.

```
@include code/ch15/solution_tests.py
```

```
@include code/ch15/test_solution_tests.py
```

```
@include code/ch15/test_solution_tests.out
```

## Chapter 16: Debugging, Logging and Reading Tracebacks

The two bugs were that the list wasn't sorted, and that for an even number of values, the median is the average of the two middle ones.

```
@include code/ch16/solution_debugging.py
```

```
@include code/ch16/solution_debugging.out
```

## Chapter 17: Virtual Environments, Packages and Project Layout

Here the new function is added in a separate file, so that it runs from the chapter folder; in your project, the function goes in `books.py` and the command in `cli.py`, as the comment shows.

```
@include code/ch17/solution_stats.py
```

```
@include code/ch17/solution_stats.out
```

## Chapter 18: Decorators and Context Managers

```
@include code/ch18/solution_advanced_functions.py
```

```
@include code/ch18/solution_advanced_functions.out
```

## Chapter 19: Type Hints and Static Checking

This file passes `mypy --strict` (Chapter 19).

```
@include code/ch19/solution_types.py
```

```
@include code/ch19/solution_types.out
```

## Chapter 20: Functional Tools and Pattern Matching

In `top_n`, the key `(-score, name)` sorts by score, highest first, and then by name. `compose` uses `reduce` to combine the functions in pairs.

```
@include code/ch20/solution_functional.py
```

```
@include code/ch20/solution_functional.out
```

## Chapter 21: Concurrency

```
@include code/ch21/solution_concurrency.py
```

```
@include code/ch21/solution_concurrency.out
```

## Chapter 22: Performance

`bisect.bisect` finds how many cut-offs a score has reached, which is exactly the position of its grade in `"FDCBA"`.

```
@include code/ch22/solution_performance.py
```

```
@include code/ch22/solution_performance.out
```

## Chapter 23: Pocket Library with SQLite

The new methods are added in a subclass, so that this file runs on its own. `":memory:"` makes a temporary database in memory.

```
@include code/ch23/solution_store.py
```

```
@include code/ch23/solution_store.out
```

## Chapter 24: Data Analysis

```
@include code/ch24/solution_analysis.py
```

```
@include code/ch24/solution_analysis.out
```

## Chapter 25: Web APIs

The new endpoints are added to the app from the chapter, and checked with `TestClient`.

```
@include code/ch25/solution_api.py
```

```
@include code/ch25/solution_api.out
```

## Chapter 26: Automating Everyday Tasks

The log file used in the first exercise:

```
@include code/ch26/app.log
```

```
@include code/ch26/solution_automation.py
```

```
@include code/ch26/solution_automation.out
```
