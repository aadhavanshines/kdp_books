# Chapter 4: Making Decisions

A program that always does the same thing is a calculator. Programs become useful when they decide: charge less for children, warn when a value is too high, accept a password only if it's long enough. In this chapter you'll learn how Python compares values, how it chooses what to do with `if`, `elif` and `else`, and why indentation matters so much in Python. At the end you'll write the pricing rules for a cinema.

## True or False

A comparison gives one of two values: `True` or `False`. These are **Booleans**, named after the mathematician George Boole, and their type is `bool`:

```
@include code/ch04/session_booleans.txt
```

The comparison operators are:

| Operator | Meaning |
| --- | --- |
| `==` | equal to |
| `!=` | not equal to |
| `<` and `>` | less than, greater than |
| `<=` and `>=` | less than or equal to, greater than or equal to |

Don't confuse `==` with `=`. A single `=` assigns a value to a name; `==` asks whether two values are equal. Strings compare alphabetically, which is why `"apple" < "banana"` is `True`; capital letters come before lower-case ones, so `"Zebra" < "apple"` is also `True`.

You can combine conditions with `and` (both must be true), `or` (at least one must be true) and `not` (the opposite). Python also lets you chain comparisons the way mathematicians write them: `13 <= age <= 19` means "age is between 13 and 19, inclusive".

The last line of the session shows that every value can be treated as true or false. Zero, the empty string `""` and empty collections like `[]` count as false; almost everything else counts as true. You'll see this used in conditions such as `if name:`, which means "if the name isn't empty".

## if and else

The `if` statement runs a block of code only when a condition is true:

```
@include code/ch04/even_odd.py
```

```
@include code/ch04/even_odd.out
```

The structure is always the same: the keyword `if`, a condition, a colon, and then the lines to run, **indented** by four spaces. The `else:` part is optional; its block runs when the condition is false. Exactly one of the two blocks runs.

## Indentation Is Part of the Language

Many languages use brackets to group lines. Python uses indentation: the lines indented under the `if` belong to it, and the first line that's indented less ends the block. This forces Python code to look like what it does, but it means indentation is not optional:

```
@include code/ch04/indent_error.py
```

```
@include code/ch04/indent_error.out
```

Use four spaces for each level. Code editors insert them for you when you press Tab after a colon. Never mix tabs and spaces in one file.

## More Than Two Choices: elif

To choose among several options, add `elif` ("else if") branches:

```
@include code/ch04/grade.py
```

```
@include code/ch04/grade.out
```

Python tests the conditions in order and runs the block of the **first** one that's true, then skips the rest. A score of 82 fails `score >= 90`, passes `score >= 80`, and gets a B; the later tests are never checked. That's why the conditions don't need upper limits like `score >= 80 and score < 90`: the order takes care of it. If you put `score >= 60` first, everyone with 60 or more would get a D.

## Project: Cinema Ticket Prices

A cinema charges 11.00 for adults, 6.00 for children under 12 and 7.50 for people aged 65 and over, and everything is half price on Tuesdays:

```
@include code/ch04/ticket_price.py
```

A run for a 70-year-old on a Tuesday:

```
@include code/ch04/ticket_price.out
```

This program shows three useful ideas:

- **Check the input first.** An age of -5 or 300 is a typing mistake, so the program says so instead of quoting a price.
- **Nested decisions.** The `if` and `elif` that set the price are inside the `else` block, indented one level further. The Tuesday check comes after the age rules, so it halves whatever price they chose.
- **Tidy the input.** `.strip()` removes spaces the user might have typed before or after the day, and `.lower()` converts it to lower case, so `Tuesday`, `TUESDAY` and ` tuesday ` all match. Chapter 9 covers these string methods.

## Conditional Expressions

When you only need to choose between two values, a **conditional expression** fits on one line:

```
@include code/ch04/conditional_expression.py
```

```
@include code/ch04/conditional_expression.out
```

Read it as English: "take water if the temperature is above 30, else enjoy your walk". Use it for simple choices. When either side needs more than a value, use a full `if` statement; it's easier to read.

## Try It

1. Run `ticket_price.py` for a child on a Saturday and for an adult on a Tuesday. Then enter `-1` as the age.
2. In `grade.py`, move the `score >= 60` test to the top and run it with a score of 95. Explain the result.
3. In the shell, check whether `"Zebra" < "apple"` and `10 == 10.0` are `True`.

## Exercises

1. **Leap year.** A year is a leap year if it's divisible by 4, except that years divisible by 100 aren't, unless they're also divisible by 400. Ask for a year and say whether it's a leap year. Test 2024, 1900 and 2000.
2. **Largest of three.** Ask for three numbers and print the largest, using `if` statements (not Python's `max` function).
3. **BMI.** Ask for weight in kilograms and height in meters, calculate the body mass index (weight divided by height squared), and print it with one decimal place and its category: under 18.5 is underweight, under 25 healthy, under 30 overweight, otherwise obese.

## Key Takeaways

- Comparisons give `True` or `False`. Combine them with `and`, `or` and `not`. `==` compares; `=` assigns.
- `if`, `elif` and `else` choose which block runs. Python runs the first block whose condition is true.
- Indentation (four spaces) defines blocks in Python. A missing indent is an `IndentationError`.
- Order your `elif` tests carefully, check input before using it, and use a conditional expression for simple two-way choices.
