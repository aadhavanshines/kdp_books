# Chapter 8: Functions

You've been calling functions since Chapter 1: `print`, `input`, `len`, `sorted`. In this chapter you'll write your own. A function gives a name to a piece of code, so you can use it as often as you like without repeating it. Functions are how programmers break a large problem into small ones that are easy to understand, test and reuse. You'll build a unit converter and reorganize Pocket Library into functions.

## Defining a Function

You define a function with `def`, a name, parentheses with its **parameters**, and a colon. The indented block below is the function's **body**:

```
@include code/ch08/functions_basics.py
```

```
@include code/ch08/functions_basics.out
```

- `def` only defines the function; nothing happens until you **call** it, by writing its name with arguments in parentheses. `greet("Lena")` runs the body with `name` set to `"Lena"`.
- `return` sends a value back to the caller and ends the function. `area(3, 4.5)` becomes `13.5` wherever it's used. A function without `return` gives back `None`.
- A parameter can have a **default value**: `rate=0.18`. Callers can leave it out and get the default, or pass their own.
- **Keyword arguments** name the parameter they're for, like `rate=0.12`, so their order doesn't matter. They also make a call easier to read.
- The string on the first line of the body is a **docstring**. It says what the function does. Editors show it when you use the function, and `help(area)` in the shell prints it.

> **Tip:** Make each function do one job, and name it after that job with a verb: `greet`, `calculate_total`, `add_book`. If you can't describe a function in one sentence, it probably does too much.

## Printing versus Returning

Beginners often confuse `print` and `return`. `greet` prints, which is useful only for showing something to a person. `area` returns, so the caller decides what to do with the result: print it, store it, or use it in another calculation, such as `area(3, 4) * 2`. Prefer functions that return values; they're far easier to reuse and to test.

## Local and Global Variables

Variables created inside a function are **local**: they exist only while the function runs.

```
@include code/ch08/scope.py
```

```
@include code/ch08/scope.out
```

`result` belongs to `add_one`, and it's gone when the function returns, so the last line raises a `NameError`. Variables created outside any function, like `counter`, are **global**: functions can read them, but assigning to one inside a function creates a new local variable with the same name instead. The clean way to get information into a function is through its parameters, and out of it through `return`.

## Functions as Building Blocks: A Unit Converter

The converter has a small function for each conversion, a dictionary that links menu choices to those functions, and a `main` function that runs the menu:

```
@include code/ch08/unit_converter.py
```

A session, converting a marathon distance and a temperature, then making a mistake and quitting:

```
@include code/ch08/unit_converter.out
```

Look at `CONVERSIONS`. Its values are tuples that hold a label and a function: the name `km_to_miles` without parentheses refers to the function itself, without calling it. Later, `label, convert = CONVERSIONS[choice]` unpacks the tuple, and `convert(value)` calls whichever function was chosen. Functions are values in Python, just like numbers and strings. That idea will take you a long way, and Chapter 18 builds on it.

The name `CONVERSIONS` is in capitals because it's a **constant**: a value that's set once and never changed. Python doesn't enforce this; it's a convention that tells readers not to change it. In `show_menu`, the underscore in `for key, (label, _)` is a name for a value the loop doesn't need.

Adding a fourth conversion means writing one small function and one line in the dictionary. Nothing else changes. That's the payoff of organizing code into functions.

## Flexible Arguments

Sometimes a function should accept any number of arguments, as `print` does:

```
@include code/ch08/flexible_arguments.py
```

```
@include code/ch08/flexible_arguments.out
```

A parameter with one star, `*numbers`, collects all the positional arguments into a tuple. A parameter with two stars, `**details`, collects keyword arguments into a dictionary. By convention they're often called `*args` and `**kwargs`, and you'll see them in many libraries.

## Functions That Call Themselves

A function can call itself. This is called **recursion**:

```
@include code/ch08/recursion.py
```

```
@include code/ch08/recursion.out
```

The factorial of 5 is 5 × 4 × 3 × 2 × 1. `factorial(5)` works it out as 5 times `factorial(4)`, which is 4 times `factorial(3)`, and so on, until `factorial(1)` returns 1 without calling itself. That stopping case, the **base case**, is essential: without it, the function would call itself until Python gave up with a `RecursionError`. Recursion is natural for problems that contain smaller copies of themselves, like folders inside folders, but a loop is usually simpler for counting.

## Project: Pocket Library, Version 3

Version 3 keeps the dictionaries from Chapter 7 and organizes the code into functions:

```
@include code/ch08/library_v3.py
```

```
@include code/ch08/library_v3.out
```

Each function does one job. `make_book` builds a book dictionary, with `read` defaulting to `False`. `add_book` adds a book only if no book with the same title, ignoring case, is already there, and returns `True` or `False` to say whether it did. `books_by` finds books whose author contains some text, and `show` prints a list of books. Because `books_by` returns a list rather than printing, its result can go straight into `show`, or be counted, or sorted.

Notice that `add_book` changes the list it's given. Lists are passed to functions as themselves, not as copies, so `library` outside the function sees the new book.

## Try It

1. Call `help(price_with_tax)` in the shell after pasting the function in. What does it show?
2. Add a "miles to km" conversion to the unit converter. How many lines did you have to change?
3. Remove the `if n <= 1` test from `factorial` and call `factorial(5)`. Read the last line of the error.

## Exercises

Write these three functions in one file, with docstrings, and call each one to test it:

1. **Palindrome.** `is_palindrome(text)` returns `True` if the text reads the same backwards, ignoring case, spaces and punctuation. "Never odd or even" is a palindrome. (Hint: a string's `isalnum()` method is true for letters and digits.)
2. **Vowels.** `count_vowels(text)` returns the number of vowels in the text.
3. **Largest.** `largest(numbers)` returns the largest number in a non-empty list, without using `max`.

## Key Takeaways

- `def` defines a function; calling it runs the body with the parameters set to the arguments. `return` sends a value back.
- Parameters can have defaults, and arguments can be passed by keyword. A docstring says what a function does.
- Variables inside a function are local. Pass information in through parameters and out through `return`.
- Functions are values: you can store them in dictionaries and call them later. `*args` and `**kwargs` accept any number of arguments.
