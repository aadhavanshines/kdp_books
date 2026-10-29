# Introduction

Every program you have ever used stands on a handful of ideas. Your phone's contacts app finds a name among thousands before you finish typing it. A map app finds the fastest route across a country in a fraction of a second. A database answers a question about millions of rows without reading them all. Python itself finds a key in a dictionary in the same time whether the dictionary holds ten items or ten million. None of this is magic. It is **data structures**, ways of arranging data, and **algorithms**, step-by-step methods for working on it, chosen well.

This book teaches both, in Python, by building them. You'll write a dynamic array, linked lists, a hash table, binary search trees and a self-balancing AVL tree, a heap, a trie, union-find, graphs and their searches, shortest paths and spanning trees, and an LRU cache. Then you'll learn the patterns behind most coding-interview problems: two pointers, sliding windows, hash maps and prefix sums, breadth-first and depth-first search, dynamic programming, greedy choices and backtracking.

## What Makes This Book Different

**You build every structure yourself.** Not a diagram and a promise, but a working class, a few dozen lines long, that you can read, run and change. Building a hash table is the fastest way to understand why a Python dictionary is fast, and when it isn't.

**Everything is tested.** Each structure comes with a test file, and the tests do more than check a few examples: they run thousands of random operations against Python's own built-in structures and check that the answers agree. You'll learn to test your own code this way, and it will catch bugs you would never think to look for. While this book was being written, it caught several, and you'll see them.

**Everything is timed.** Big O notation tells you how an algorithm's running time *grows*; this book also measures it. Every chapter has real benchmarks, with tables and charts, comparing your structure with Python's built-in one, a good algorithm with a naive one, and the best case with the worst. You'll see a quadratic algorithm's time multiply by four each time the input doubles, and a dictionary lookup that takes about the same tenth of a microsecond at every size. Numbers you have measured yourself are far more convincing than any formula, and they show something formulas hide: in Python, a simple algorithm running in fast built-in code often beats a cleverer one written in Python.

**Every example is real, tested code.** Each listing in this book is a file that was run on Python 3.12, 3.13, 3.14 and 3.15, and the output printed beneath it is the output it produced. Timings are the exception, because they differ on every computer and every run; they were recorded on one computer, described in Appendix C, and you should expect your numbers to differ while the patterns stay the same.

**Interview patterns, with proof.** Part VI covers the patterns behind most coding-interview questions. Each solution is checked against a slow, obviously correct brute-force version on thousands of random inputs, and timed against it.

**Real-world uses.** Boxes in every chapter show where each structure works in software you use: in Python itself, in databases, operating systems, Git, web browsers and the internet's routers. Each was checked against the project's source code or official documentation, and the sources are listed in Appendix E.

## Who This Book Is For

You should know basic Python: variables, `if` and `for`, functions, lists and dictionaries, and simple classes. You don't need any math beyond school algebra; when logarithms appear, Chapter 3 explains what you need. The book suits:

- Self-taught programmers and bootcamp graduates who want the computer-science foundations
- Students taking a data structures course who want to see the ideas run
- Developers preparing for coding interviews
- Anyone who has used Python's lists and dictionaries for years and wants to know what happens inside them

## How This Book Is Organized

**Part I, Foundations**, sets up your tools and teaches you to measure: Big O notation, how to time code properly, what Python's built-in structures cost, and recursion.

**Part II, Linear Structures**, builds a dynamic array, linked lists, stacks, queues and hash tables.

**Part III, Searching and Sorting**, covers binary search, the classic sorting algorithms, heaps, and sorts that don't compare.

**Part IV, Trees**, builds binary trees, binary search trees, a self-balancing AVL tree, tries and union-find.

**Part V, Graphs**, covers representations, breadth-first and depth-first search, shortest paths and minimum spanning trees.

**Part VI, Interview Patterns**, opens with a method for solving problems under pressure, then teaches one pattern per chapter, with practice problems.

**Part VII, Putting It Together**, builds an LRU cache from a hash map and a linked list, and runs the book's benchmarks on four versions of Python to see how much faster Python has become.

Every chapter ends with key takeaways and exercises. Appendix A has a tested solution for every exercise. Appendix B is a cheat sheet of costs, with the measurements from this book.

## How to Use This Book

Type the code. Run it. Then change it and run it again: shrink a test until it fails, swap a data structure, double an input and predict the time before you measure it. Data structures are learned with the hands as much as the eyes.

All the code is free to download, arranged by chapter, from the book's repository at **github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on**, with a ready-to-run Jupyter notebook for every chapter. Chapter 2 shows how to set it up.

> **Note:** All the data in the examples, including people, towns and companies, is fictional. Any resemblance to real persons or businesses is coincidental.
