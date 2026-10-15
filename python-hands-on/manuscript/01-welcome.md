# Part I: Getting Started

# Chapter 1: Welcome to Python

A program is a list of instructions for a computer, written in a language the computer can follow. Python is one such language. You write instructions in a text file, and a program called the **Python interpreter** reads the file and carries out the instructions, one after another, from top to bottom. In this chapter you'll install Python, talk to it directly, write your first program, and see your first error message.

## Installing Python

You need Python 3.12 or newer. Many computers already have some version of Python, but it's often old or used by the system, so install your own from the official site, **python.org**.

**Windows.** Go to python.org, open Downloads, and install the **Python install manager**. It's also available in the Microsoft Store. The install manager installs the latest Python and keeps it up to date, and it gives you two commands: `python` runs Python, and `py` manages the versions you have installed. It needs Windows 10 or newer.

**macOS.** Go to python.org, open Downloads, and download the macOS installer for the latest Python 3 release. Run it and follow the steps. On a Mac, the command is `python3`, not `python`. Wherever this book says `python`, type `python3`.

**Linux.** Most distributions already include a recent Python 3, usually as `python3`. If yours is older than 3.12, install a newer one with your package manager, or with the `uv` tool described in Chapter 17.

To check that Python is installed, open a **terminal**: on Windows, open the Start menu and type *Terminal*; on macOS, open *Terminal* from Applications, Utilities; on Linux, it's usually called *Terminal* too. Then type:

```
$ python --version
```

Python answers with its version, such as `Python 3.15.0`. Any version from 3.12 onwards works for this book. If you see an error such as *command not found*, close the terminal, open a new one, and try again; on macOS, try `python3 --version`.

> **Note:** The terminal is a window where you type commands instead of clicking. You'll use only a handful of commands in this book: `python` to run a program, `cd` to move to a folder, and occasionally `pip` to install a package. Each is explained when you first need it.

## Talking to Python

Type `python` in the terminal and press Enter. You'll see a few lines about the version and then a prompt: `>>>`. This is Python's **interactive shell**, sometimes called the REPL (read, evaluate, print, loop). Type something after the prompt, press Enter, and Python answers at once:

```
@include code/ch01/session_basics.txt
```

Python works as a calculator, following the usual rules: multiplication before subtraction, so `10 - 4 * 2` is 2. `print` displays text. The quotes mark where the text starts and ends; Python calls a piece of text a **string**. And `"ha" * 3` repeats a string three times. You'll learn what each piece means in the next chapter. For now, notice that you typed something and Python did it.

To leave the shell, type `exit()` and press Enter.

The shell is perfect for trying out an idea in a few seconds. Everything you type there is lost when you close it, though, so real programs go in files.

## Your First Program

A Python program is a plain text file whose name ends in `.py`. You can write one in any text editor, but an editor made for code helps: it colors the different parts of your program, indents lines for you, and runs the program with a key press. Two good choices:

- **IDLE** comes with Python. On Windows and macOS you'll find it with your other programs. Choose File, New File to write a program, and Run, Run Module (or press F5) to run it.
- **Visual Studio Code** is a free editor used by many professionals. Install it from code.visualstudio.com and add the Python extension when it suggests it.

Make a folder for your work, for example `python-practice` in your Documents folder. Create a file there called `hello.py` with one line:

```
@include code/ch01/hello.py
```

Save it, then run it. In IDLE, press F5. In a terminal, go to the folder with `cd` and run the file with `python`:

```
$ cd Documents/python-practice
$ python hello.py
```

Python prints:

```
@include code/ch01/hello.out
```

Congratulations: you've written and run a program. `print` is a **function**, a named piece of code that does a job. You **call** it by writing its name followed by parentheses, with what it needs, its **arguments**, inside them. Here the argument is the string `"Hello, Python!"`.

## A Program with More Lines

Python runs the lines of a file in order, from top to bottom. Save this as `first_program.py`:

```
@include code/ch01/first_program.py
```

Output:

```
@include code/ch01/first_program.out
```

A few things to notice:

- `print` can take several arguments separated by commas. It prints them with a space between them, so `print("2 + 3 =", 2 + 3)` prints the text, a space, and the result of the sum.
- Python works out `2 + 3` before printing it. The text `"2 + 3 ="` is printed exactly as written, because it's inside quotes.
- `print()` with no arguments prints an empty line.
- Everything after a `#` is a **comment**. Python ignores it. Comments are notes for the people who read your code, including you in six months.

## Your First Error

Everyone who writes programs makes mistakes, and Python tells you about them in **error messages**. Learning to read them calmly is one of the most valuable skills in this book. Here is `hello.py` with the closing quote missing:

```
@include code/ch01/typo.py
```

Run it, and Python refuses:

```
@include code/ch01/typo.out
```

Read error messages from the bottom up. The last line says what kind of error it is, a `SyntaxError`, which means Python couldn't understand the code, and why: the string was never closed. The lines above say where: the file, the line number, the line itself, and a caret (`^`) pointing at the place where the problem starts. Add the missing quote, save, and run it again.

> **Tip:** When you get an error, check the line it points to, and the line before it. A missing bracket or quote on one line often shows up as an error on the next.

The exact wording and the markers under the line vary a little between Python versions. Newer versions give more helpful messages, often with a suggestion such as *Did you mean ...?*. That's one reason to use a recent Python.

## How Python Runs Your Program

When you type `python hello.py`, the interpreter reads the whole file, checks that it's valid Python, and then runs it one line at a time. That's why a syntax error stops the program before anything is printed, even if the error is on the last line. Other errors, which you'll meet in the next chapter, happen only when Python reaches the line that causes them. Lines before the error run normally.

## Try It

1. Change `hello.py` so that it greets you by name. Then add a second `print` line that says what you'd like to build with Python.
2. In the shell, work out how many minutes there are in a week, and how many hours in a year (use 365 days).
3. Make your own syntax errors: remove a parenthesis from `first_program.py`, then misspell `print` as `pritn`. Read each message from the bottom up. What is the error type in each case?

## Exercises

1. **About me.** Write a program `about_me.py` that prints your name, a sentence about why you're learning Python, and the number of hours in a year, calculated by Python, not by you.
2. **Calculator.** Use the shell to calculate the number of minutes in a week and the number of hours in a year.
3. **Cheering.** In the shell, use `print` and the `*` operator on strings to print `Hip, hip, Hip, hip, hooray!` with one line of code.

## Key Takeaways

- Install Python 3.12 or newer from python.org. Check it with `python --version` (`python3` on a Mac).
- The interactive shell (`>>>`) is for trying things quickly; programs go in `.py` files, which you run with `python name.py`.
- Python runs a program from top to bottom. `print` displays values; `#` starts a comment.
- Read error messages from the bottom up: the type of error, the reason, then the line and position.
