# Chapter 5: Loops

Computers are good at doing the same thing many times without getting bored or making mistakes. A **loop** repeats a block of code: until a condition changes, or once for each item in a sequence. In this chapter you'll learn Python's two loops, `while` and `for`, and the statements that control them. At the end you'll write a number-guessing game.

## while Loops

A `while` loop repeats its block as long as its condition is true:

```
@include code/ch05/countdown.py
```

```
@include code/ch05/countdown.out
```

Each time round, Python checks the condition `count > 0`. If it's true, the block runs: it prints the count and makes it one smaller. When `count` reaches 0, the condition is false, the loop ends, and Python carries on with the first line after the loop.

> **Warning:** If the condition never becomes false, the loop runs forever. Delete the line `count = count - 1` and the program prints 5 until you stop it. To stop a running program, press **Ctrl+C** in the terminal (in IDLE, choose Shell, Interrupt Execution). Every programmer writes an endless loop now and then.

## Shortcuts for Updating Variables

Adding to a variable is so common that Python has a shortcut: `count += 1` means `count = count + 1`. The same works for the other operators: `-=`, `*=`, `/=` and `//=`. You'll see these in most loops from now on.

## Loops That Wait for the User

Often you don't know in advance how many times to repeat. This program adds numbers until the user types `done`:

```
@include code/ch05/running_total.py
```

```
@include code/ch05/running_total.out
```

`while True` would loop forever, so something inside must end it. That's `break`: it leaves the loop at once and continues after it. This pattern, an endless loop with a `break` when a condition is met, is the usual way to write "keep asking until...".

The program also counts the numbers, so it can calculate the average, and checks that there was at least one before dividing. Without that check, typing `done` straight away would divide by zero.

## for Loops and range

A `for` loop runs its block once for each item in a sequence. The simplest sequence is `range`, which produces numbers:

```
@include code/ch05/for_range.py
```

```
@include code/ch05/for_range.out
```

- `range(5)` gives 0, 1, 2, 3 and 4: five numbers, starting at 0 and stopping **before** 5.
- `range(1, 10, 2)` starts at 1, stops before 10, and steps by 2.
- A string is a sequence of characters, so `for letter in "Python"` visits each letter.

Normally `print` ends with a new line. The `end` argument replaces it: `end=" "` prints a space instead, so the numbers appear on one line. The `print()` after the loop finishes that line.

Use `for` when you're going through something item by item or counting a known number of times; use `while` when you're repeating until something happens.

## Skipping with continue

`continue` skips the rest of the block and moves on to the next item:

```
@include code/ch05/skip_negatives.py
```

```
@include code/ch05/skip_negatives.out
```

`readings` is a **list**, a collection of values in square brackets. You'll learn all about lists in the next chapter; for now, all you need to know is that a `for` loop visits each value in turn. The two negative readings are skipped.

## Loops Inside Loops

A loop's block can contain another loop. The inner loop runs completely for each pass of the outer one:

```
@include code/ch05/times_table.py
```

```
@include code/ch05/times_table.out
```

For each row, the inner loop prints five products on one line, each in a width of 4, and `print()` then ends the line. Five rows of five give the 25 products.

## Project: Number-Guessing Game

The computer picks a number from 1 to 100 and the player guesses until they find it, with a hint after each guess:

```
@include code/ch05/guessing_game.py
```

A game:

```
@include code/ch05/guessing_game.out
```

`import random` gives the program access to Python's **random** module, and `random.randint(1, 100)` picks a whole number from 1 to 100, including both ends. You'll learn about modules in Chapter 11.

The line `random.seed(7)` makes the "random" choice the same every time the program runs. That's how the book can print a real game with a known answer, and it's useful when you're testing a program. Delete the line to get a different number each game.

The player above used the best strategy: always guess the middle of the range that's left. Each guess halves the range, so no game takes more than seven guesses. This idea, **binary search**, is one of the most important in computing, and you'll meet it again in Chapter 22.

## Try It

1. Change `countdown.py` to count down from 10 in steps of 2.
2. Use `range` to print the numbers from 10 down to 1 with a `for` loop. (Hint: the step can be negative.)
3. Play the guessing game without the `random.seed(7)` line. Can you always win in seven guesses?

## Exercises

1. **FizzBuzz.** Print the numbers from 1 to 20, but print `Fizz` instead of numbers divisible by 3, `Buzz` instead of numbers divisible by 5, and `FizzBuzz` for numbers divisible by both. This classic exercise is still used in job interviews.
2. **Digit sum.** Ask for a whole number and add up its digits, using a `while` loop, `% 10` to get the last digit and `// 10` to remove it.
3. **Three tries.** Ask for a password up to three times. Print `Welcome in!` and stop when it's right. After three wrong attempts, print `Too many attempts. Locked out.` (Hint: a `for` loop can have an `else` block, which runs only if the loop finished without a `break`.)

## Key Takeaways

- `while` repeats as long as a condition is true; make sure something changes so that the loop ends. Ctrl+C stops a runaway program.
- `for` goes through a sequence item by item. `range(start, stop, step)` produces numbers up to, but not including, `stop`.
- `break` leaves a loop; `continue` skips to the next pass. `while True` with a `break` is the usual pattern for "repeat until".
- `+=` and its relatives update a variable in place. `print(..., end="")` keeps output on one line.
