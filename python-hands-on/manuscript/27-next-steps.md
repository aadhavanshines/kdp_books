# Chapter 27: Where to Go Next

You started this book with `print("Hello, Python!")`. Since then you've written programs that make decisions and loop, organized data in lists, dictionaries and classes, read and written files, handled errors, tested and debugged your code, packaged it, typed it, made it concurrent and fast, and built a database app, a data analysis, a web API and a set of automation tools. That's a solid foundation for nearly anything you want to do with Python. This last chapter suggests where to go from here, and how to keep improving.

## Build Things

The single best way to get better is to build programs you care about. Start small, finish them, then make them bigger. Some ideas, grouped by the chapters they build on:

- **Pocket Library, continued**: combine the SQLite store from Chapter 23 with the web API from Chapter 25, so that the API keeps its books between restarts. Add a search endpoint, and tests for everything.
- **A personal finance tracker**: import your bank's CSV exports, categorize spending with rules, and chart it by month with pandas and matplotlib (Chapter 24).
- **A habit or reading tracker** for the command line, with streaks and statistics.
- **A file organizer** that watches a folder and sorts new files by type and date (Chapters 11 and 26).
- **A quiz game** that reads its questions from a JSON file, keeps scores, and gets harder as you improve.
- **A small website** with Flask or Django, two popular web frameworks, showing your data in HTML pages.

When you get stuck, break the problem into smaller pieces, write a test for the piece that doesn't work, and read the error messages from the bottom up.

## Directions to Explore

Python is used in almost every field. Here are the main directions, with the tools to look up first:

| Direction | Start with |
| --- | --- |
| Web development | FastAPI (Chapter 25), Flask, Django |
| Data analysis and science | pandas, NumPy, Jupyter, matplotlib, seaborn |
| Machine learning and AI | scikit-learn, then PyTorch; the Python libraries that AI companies provide for their APIs |
| Automation and scripting | the standard library (Chapter 26), Playwright for web browsers, openpyxl for Excel files |
| Desktop applications | tkinter (included with Python), Qt for Python |
| Games | pygame, Arcade |
| Hardware and electronics | MicroPython and CircuitPython on microcontrollers, Raspberry Pi |
| Testing and quality | pytest (Chapter 15), ruff for linting and formatting, mypy (Chapter 19) |

Pick one that matches what you want to build, and go deep before you go wide.

## Habits of Good Programmers

- **Use version control.** Learn **Git**, which records every change to your code so that you can undo mistakes, see what changed when, and work with others. Put your projects on a hosting service such as GitHub or GitLab. This is the next skill to learn after this book.
- **Format and lint automatically.** This book's code was formatted with `ruff format` and checked with `ruff check`, which catch mistakes and keep style consistent with no effort from you.
- **Write tests as you go**, and run them, together with mypy, before every change you keep.
- **Read other people's code.** The standard library's own source is readable Python; so are many popular packages. You'll pick up idioms you won't find in tutorials.
- **Read the documentation.** docs.python.org has the official tutorial, the library reference and the "What's New" pages for each version. Python releases a new version every October, each supported with fixes for five years, so it's worth reading what changed once a year.
- **Keep learning the fundamentals.** Data structures, algorithms and how computers work make you better in every language.

## Learning with AI Assistants

AI coding assistants can explain code, suggest fixes and write programs from descriptions. Used well, they're excellent tutors: ask one to explain an error message, review your solution to an exercise, or suggest a better data structure, and then make sure you understand the answer. Used badly, they stop you from learning: if you paste in every exercise and copy every answer, you'll be no better at the end.

A good rule while you're learning is to write the code yourself first, then ask for a review. And always treat generated code like code from a stranger: read it, run it, and test it, exactly as this book has tested every example.

## Join the Community

Python has a famously welcoming community. You can ask questions and read discussions on the official forum at discuss.python.org, find a local Python user group or meetup, and attend a PyCon conference, which are held around the world, often with financial aid for those who need it. When you're ready, contribute to an open-source project: fixing a typo in documentation is a perfectly good first contribution.

And you'll find that explaining what you've learned to someone else, the rubber duck from Chapter 16 included, is the best way to understand it yourself.

Happy coding.

## Key Takeaways

- Build projects you care about, starting small and finishing them; extend Pocket Library or try one of the ideas above.
- Choose a direction (web, data, AI, automation, desktop, games or hardware) and go deep with its main tools.
- Learn Git next, and keep the habits from this book: formatting, linting, tests, type checks and reading documentation.
- Use AI assistants as tutors and reviewers, not as a substitute for writing code yourself, and test everything they produce.
