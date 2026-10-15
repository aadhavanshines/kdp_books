# Introduction

Python is one of the most widely used programming languages in the world. Scientists use it to analyze data, engineers to automate tests, web developers to build services, teachers to introduce programming, and many people simply to save themselves an afternoon of clicking. It reads almost like English, it runs on every common computer, and it is free.

This book teaches you Python by having you write it. You'll start with one line that prints a greeting and finish with tested, packaged programs: a command-line app with a database, a data analysis with charts, a web API, and scripts that tidy your folders and back up your files. Along the way you'll learn the parts of the language that working programmers use every day, and how to read the error messages that every programmer sees every day.

## What Makes This Book Different

**Every example is tested.** Every program in this book is a real file in the book's code folder. Before publication, each one was run on Python 3.12, 3.13, 3.14 and 3.15, and its output was compared with the output printed in the book. If you type a program exactly as printed, you'll see exactly the output printed below it. Where output can't be identical (timings, for example), the book says so.

**You learn by doing.** Each chapter introduces a few ideas, shows them in short programs, and asks you to try them. Every chapter ends with exercises, and every exercise has a worked solution in Appendix A. The solutions are tested too.

**One project grows with you.** Pocket Library is a small program for keeping track of the books you own and read. It starts in Chapter 6 as a list in memory. It learns to save to a file in Chapter 10, becomes a set of classes in Chapter 12, a tested and installable package in Chapter 17, and a command-line app with a SQLite database in Chapter 23. In Chapter 25 it gets a web API. You'll see how a real program evolves, and why each new tool is worth learning.

![Pocket Library grows through the book: a list of titles in Chapter 6, a dictionary per book in Chapter 7, functions in Chapter 8, a JSON file in Chapter 10, classes in Chapter 12, a dataclass collection in Chapter 13, an installable package in Chapter 17, a SQLite command-line app in Chapter 23 and a web API in Chapter 25.](images/diagram-pocket-evolution.png)

**Errors are part of the lesson.** You'll make mistakes on purpose: a missing quote, a misspelled name, text added to a number. You'll see the exact message Python prints and learn to read it. Appendix C collects the most common errors and their fixes.

## Who This Book Is For

- **Complete beginners.** You don't need any programming experience. You need a computer (Windows, macOS or Linux), the ability to install a program, and some patience.
- **People who have tried before.** If you've started a course or tutorial and stalled, the short steps and the tested examples here are designed to keep you moving.
- **Programmers who know another language.** Skim Part I, then use Parts II to IV to learn how things are done in Python.
- **Python users who want to go further.** Parts III to V cover classes, testing, packaging, type hints, decorators, concurrency, performance, databases, data analysis and web APIs.

## How the Book Is Organized

| Part | Chapters | What you'll learn |
| --- | --- | --- |
| I. Getting Started | 1 to 5 | Running Python, values and variables, input and output, decisions and loops |
| II. Organizing Data and Code | 6 to 11 | Lists, dictionaries, functions, text, files, errors and modules |
| III. Intermediate Python | 12 to 17 | Classes, iteration, testing, debugging, packaging |
| IV. Advanced Python | 18 to 22 | Decorators, type hints, functional tools, concurrency, performance |
| V. Real-World Projects | 23 to 27 | A database app, data analysis, web APIs, automation, and what to learn next |

Each chapter opening shows its level: **Beginner**, **Intermediate** or **Advanced**; the projects in Part V are marked **Project**. Read Parts I and II in order. After that, chapters mostly stand on their own, although the projects in Part V use ideas from Parts III and IV.

## How to Read the Code

Programs look like this:

```
@include code/ch01/hello.py
```

Text the program prints, its **output**, follows it:

```
@include code/ch01/hello.out
```

When a program asks you to type something, what you type appears in the output too, just as it does on your screen. Short sessions at Python's interactive prompt start with `>>>`. You type the text after the `>>>` and Python answers on the next line:

```
>>> 2 + 3
5
```

Commands you type in a terminal (not in Python) start with `$`, which you don't type:

```
$ python hello.py
```

## Getting the Code

All the programs, data files, exercise solutions and tests are available in the book's code folder, arranged by chapter: `code/ch01`, `code/ch02` and so on. A file named in the text, such as `variables.py`, is in the folder for that chapter. You'll learn more if you type the short programs yourself, at least in the early chapters. Typing mistakes are how you learn to read error messages.

> **Tip:** When an exercise feels hard, try it for fifteen minutes before you look at the solution. Then compare your answer with the book's. There is usually more than one correct answer.

## Versions

The book uses Python 3.12 or newer and was tested on Python 3.12, 3.13, 3.14 and 3.15, the newest version at the time of writing. Everything in Parts I to IV uses only the standard library, the tools that come with Python. Parts III to V also use a few widely used packages: pytest, mypy, pandas, matplotlib, FastAPI, httpx and uvicorn. Chapter 17 shows how to install them, and the code folder's `requirements.txt` lists the exact versions the book was tested with.

Let's start.
