# Chapter 2: Variables, Numbers and Strings

Programs work with values: a price, a name, a count, a temperature. In this chapter you'll learn to give values names, so you can use them again and change them, and you'll meet the three kinds of value you'll use most: whole numbers, decimal numbers and text. You'll also meet the two errors beginners see most often, and learn what they mean.

## Variables

A **variable** is a name that refers to a value. You create one with `=`, the **assignment** operator: the name on the left, the value on the right.

```
@include code/ch02/variables.py
```

Output:

```
@include code/ch02/variables.out
```

Read `=` as "now refers to", not "equals". The line `age = age + 1` would make no sense in mathematics, but in Python it means: take the current value of `age`, add 1, and make `age` refer to the result. Python always works out the right-hand side first.

Variable names can contain letters, digits and underscores, but can't start with a digit. They are case-sensitive: `age`, `Age` and `AGE` are three different names. By convention, Python programmers write variable names in lower case with underscores between words, like `height_m` or `total_price`. Choose names that say what the value means. `height_m` tells the reader that the height is in meters; `h` tells them nothing.

A few words are reserved by Python and can't be used as names, such as `if`, `for`, `class` and `True`. You'll meet most of them in the next chapters.

## Numbers

Python has two main kinds of number. An **integer** (`int`) is a whole number: `42`, `-7`, `0`. A **floating-point number** (`float`) has a decimal point: `3.14`, `1.64`, `-0.5`. Every value has a **type**, and the `type` function tells you what it is:

```
@include code/ch02/session_numbers.txt
```

Three things in this session surprise many beginners:

- `0.1 + 0.2` is not exactly `0.3`. Computers store floats in binary, and most decimal fractions can't be stored exactly, just as 1/3 can't be written exactly in decimal. The error is tiny, and `round` hides it when you display a result. For money, where every cent matters, Python has a `decimal` module, which you'll meet in Chapter 11.
- Integers can be as large as you like: `2 ** 100` is calculated exactly.
- You can write underscores in long numbers to make them readable: `1_000_000` is one million.

Here are the arithmetic operators:

```
@include code/ch02/arithmetic.py
```

Output:

```
@include code/ch02/arithmetic.out
```

`/` always gives a float, even when the result is whole (`10 / 2` is `5.0`). `//` divides and keeps only the whole part, and `%`, the **remainder** or **modulo** operator, gives what's left over: 17 divided by 5 is 3 with 2 left over. These two are more useful than they look. `n % 2` is 0 for even numbers and 1 for odd ones, and `//` and `%` together split seconds into minutes and seconds, as you'll do in the exercises. The `divmod` function in the session gives both at once.

Python follows the usual order of operations: `**` first, then `*`, `/`, `//` and `%`, then `+` and `-`. Use parentheses when you want a different order, or simply to make your intention clear: `(price + tax) * quantity`.

## Strings

A **string** (`str`) is a piece of text. You can write it in single or double quotes, `'hello'` or `"hello"`; they mean the same. Use the other kind when the text contains a quote: `"It's raining"`.

```
@include code/ch02/strings.py
```

Output:

```
@include code/ch02/strings.out
```

- `+` joins strings together, which is called **concatenation**. Notice the `" "` in the middle; without it you'd get `AdaLovelace`.
- `len` gives the length of a string: the number of characters, including spaces.
- `upper` and `lower` are **methods**: functions that belong to a value. You call a method with a dot after the value: `full.upper()`. Methods never change the original string; they give you a new one. Chapter 9 covers many more.
- Square brackets pick out one character. Positions, called **indexes**, start at 0, so `full[0]` is the first character. Negative indexes count from the end: `full[-1]` is the last.

The last line is an **f-string**, a string with an `f` before the opening quote. Inside it, anything in curly braces is replaced by its value. f-strings are the easiest way to build text from values, and you'll use them constantly. Any expression can go inside the braces, such as `{age + 1}` or `{name.upper()}`.

> **Tip:** The shell is the best place to experiment with strings. Try `"python"[1:4]`, `"=" * 20` and `len("")` and see what you get. Chapter 9 explains slices like `[1:4]`.

## Two Errors You'll See Often

If you use a variable that doesn't exist, Python raises a `NameError`. Usually it's a typo:

```
@include code/ch02/name_error.py
```

```
@include code/ch02/name_error.out
```

The message tells you the line, points at the name, and even suggests the name you probably meant. Unlike a syntax error, this error happens only when Python reaches the line: if line 1 printed something, you'd see that output first.

The other common error comes from mixing types:

```
@include code/ch02/type_error.py
```

```
@include code/ch02/type_error.out
```

Python won't guess whether you meant to add numbers or join text, so it refuses to add a string and an integer. Fix it by converting the number to a string with `str(age)`, by passing two arguments to `print` (`print("Age:", age)`), or, best of all, with an f-string: `print(f"Age: {age}")`.

> **Note:** A `TypeError` means you used a value of the wrong type for an operation. A `NameError` means Python doesn't know a name. You'll meet a third common error, `ValueError`, in the next chapter.

## Try It

1. In the shell, assign your age to a variable and print how many days old you are, roughly (ignore leap years).
2. What does `7 // 2` give? And `-7 // 2`? Look up why in the shell by trying `-7 / 2` first.
3. Make a string variable `word` and print it backwards with `word[::-1]`. (You'll learn how this works in Chapter 9.)

## Exercises

1. **Rectangle.** Store the width (7.5) and height (4) of a rectangle in variables and print its area and perimeter.
2. **Seconds.** Convert 10,000 seconds into hours, minutes and seconds using `//` and `%`, and print `10000 seconds is 2 h 46 min 40 s`.
3. **Initials.** Given `first = "grace"` and `last = "hopper"`, print the initials in capitals with dots: `G.H.`.

## Key Takeaways

- A variable is a name for a value, created and changed with `=`. Python works out the right-hand side first.
- `int` is for whole numbers and `float` for decimals; `/` always gives a float, `//` and `%` give the whole part and the remainder.
- Strings are text in quotes. Join them with `+`, measure them with `len`, index them from 0, and build them with f-strings.
- A `NameError` means an unknown name (usually a typo); a `TypeError` means a value of the wrong type for the operation.
