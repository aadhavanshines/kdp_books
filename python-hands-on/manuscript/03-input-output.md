# Chapter 3: Input, Output and Conversions

So far your programs have done the same thing every time. Real programs respond to the people who use them. In this chapter you'll ask the user for input, convert what they type into numbers, and format the results neatly. At the end you'll build a tip calculator that splits a restaurant bill.

## Asking for Input

The `input` function shows a message, called a **prompt**, waits for the user to type something and press Enter, and gives you what they typed as a string:

```
@include code/ch03/greet.py
```

When you run it, the program waits after each question. Here's a run where the user typed `Ravi` and `Pune`:

```
@include code/ch03/greet.out
```

Notice the space at the end of each prompt, inside the quotes. Without it, the user's answer would be squashed against the question mark.

## Input Is Always Text

Here's a program that tries to add two numbers:

```
@include code/ch03/add_wrong.py
```

```
@include code/ch03/add_wrong.out
```

12 plus 30 is not 1230. The problem is that `input` always returns a string, even when the user types digits. `a` is the string `"12"` and `b` is `"30"`, and `+` on two strings joins them. To do arithmetic, convert the strings to numbers first:

```
@include code/ch03/add_right.py
```

```
@include code/ch03/add_right.out
```

`int(...)` converts a string to an integer. The line `a = int(input("First number: "))` works from the inside out: `input` asks the question and returns the text, `int` converts the text, and `=` stores the number in `a`.

There are conversion functions for each type:

| Function | Converts to | Example | Result |
| --- | --- | --- | --- |
| `int` | integer | `int("42")` | `42` |
| `float` | decimal number | `float("3.5")` | `3.5` |
| `str` | string | `str(42)` | `"42"` |
| `int` | integer, dropping the decimals | `int(3.9)` | `3` |
| `round` | nearest integer | `round(3.9)` | `4` |

## When Conversion Fails

What happens if the user types something that isn't a number?

```
@include code/ch03/bad_number.py
```

```
@include code/ch03/bad_number.out
```

A `ValueError` means the type was right (`int` accepts strings) but the value wasn't: `'twelve'` is not a number in digits. For now, your programs will trust the user to type numbers. In Chapter 10 you'll learn to catch this error and ask again.

## Formatting Output

You met f-strings in the last chapter. After the value in the braces you can add a colon and a **format specification**, which controls how the value looks:

```
@include code/ch03/formatting.py
```

Output:

```
@include code/ch03/formatting.out
```

The most useful specifications:

- `.2f` shows a float with exactly two decimal places, rounding as needed. Use it for money.
- `,` adds thousands separators.
- `%` multiplies by 100 and adds a percent sign: `0.256` becomes `25.6%`.
- A number on its own is a width: the value is padded with spaces to fill it. `<`, `>` and `^` align the value left, right or center within that width. Text aligns left by default and numbers align right, which is usually what you want for tables.
- `05d` pads an integer with zeros to five digits.
- `{price=}` prints the expression, an equals sign and the value. It's a quick way to check a value while you're developing.

> **Tip:** You can combine these. `{total:>10,.2f}` right-aligns a number in 10 characters, with thousands separators and two decimal places.

## Project: Tip Calculator

Now put it together. The tip calculator asks for the bill, the tip percentage and the number of people, and prints what each person pays:

```
@include code/ch03/tip_calculator.py
```

A run, with the user's answers:

```
@include code/ch03/tip_calculator.out
```

The program has the shape of most simple programs: **input** (three questions), **processing** (three calculations) and **output** (three formatted lines). The width of 8 in `{tip:8.2f}` lines the numbers up on the decimal point. Notice that `bill` and `tip_percent` are floats, because people type amounts like `86.40` and tips like `12.5`, but `people` is an integer, because you can't split a bill among two and a half people.

## Try It

1. Run the tip calculator with a bill of `100`, a tip of `20` and `4` people. Check the answer in your head.
2. Change the program so that it also prints the tip per person.
3. What happens if you enter `0` people? Read the error message. You'll learn how to prevent it in the next chapter.

## Exercises

1. **Temperature.** Ask for a temperature in degrees Celsius and print it in Fahrenheit (multiply by 9, divide by 5, add 32), both with one decimal place.
2. **Days alive.** Ask for the user's age in years and print roughly how many days old they are, with a thousands separator.
3. **Receipt line.** Ask for an item name, a quantity and a unit price, and print a two-line receipt with aligned columns: `Item`, `Qty`, `Price` and `Total`.

## Key Takeaways

- `input` shows a prompt and returns what the user typed, always as a string.
- Convert text to numbers with `int` or `float` before doing arithmetic. A `ValueError` means the text wasn't a valid number.
- Format specifications in f-strings control decimals (`.2f`), separators (`,`), percentages (`%`), widths and alignment (`<`, `>`, `^`).
- Most simple programs follow the pattern input, processing, output.
