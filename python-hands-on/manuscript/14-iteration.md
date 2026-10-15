# Chapter 14: Comprehensions, Iterators and Generators

Loops that build lists are so common that Python has a compact way to write them: **comprehensions**. Behind every `for` loop is a simple protocol, **iteration**, which you can use in your own classes. And **generators** let you produce values one at a time, as they're needed, instead of building a whole list in memory. These three ideas make Python code shorter, clearer and, for large data, much more efficient.

## List Comprehensions

In earlier chapters you built lists like this:

```
to_read = []
for book in books:
    if not book["read"]:
        to_read.append(book["title"])
```

A **list comprehension** says the same in one line: `[book["title"] for book in books if not book["read"]]`. Read it as "the title, for each book in books, if it isn't read". Here are more:

```
@include code/ch14/comprehensions.py
```

```
@include code/ch14/comprehensions.out
```

The pattern is always `[expression for item in iterable if condition]`, with the `if` part optional. The expression can be anything, including a conditional expression, as in `labels`. Notice the difference between the two uses of `if`: one after the `for` filters which items are included; a conditional expression before the `for` chooses what each item becomes.

With curly braces you get a **dictionary comprehension**, with a colon between key and value, or a **set comprehension**. Comprehensions can also be nested: `grid` builds a list of rows, and `flat` reads two `for` clauses in the same order as nested loops, giving every value in every row.

> **Tip:** Use a comprehension when it fits comfortably on one line and reads clearly. If you need several conditions, nested loops or side effects like printing, write a normal loop.

## A Few More in the Shell

```
@include code/ch14/session_comprehensions.txt
```

`any` is true if at least one value is true, and `all` if every value is. They take a **generator expression**: a comprehension in parentheses, which you'll meet properly below. When a generator expression is the only argument to a function, you can leave out its own parentheses.

The last three lines show something important. A generator expression doesn't build a list; it produces values when asked. `list(squares)` asks for all of them. Asking again gives nothing, because the generator is used up.

## How for Loops Work

A `for` loop works with any **iterable**: anything that can produce an **iterator**. An iterator is an object that hands out values one at a time when you call `next` on it, and raises `StopIteration` when it has no more. The `for` loop does exactly that behind the scenes:

```
@include code/ch14/iterators.py
```

```
@include code/ch14/iterators.out
```

`iter(colors)` gets an iterator for the list, and each `next(it)` returns the next value. `next(it, default)` returns the default instead of raising `StopIteration` at the end.

The `Countdown` class is an iterator of its own. It needs two special methods: `__iter__`, which returns the iterator (itself), and `__next__`, which returns the next value or raises `StopIteration`. With those, it works in a `for` loop and with `list`, like any built-in sequence. That's what `Library.__iter__` did in Chapter 13, more simply, by returning the iterator of the list inside.

## Generators

Writing an iterator class is tedious. A **generator function** does the same job with much less code: it's an ordinary function that uses `yield` instead of `return`:

```
@include code/ch14/generators.py
```

```
@include code/ch14/generators.out
```

Calling `countdown(4)` doesn't run the body. It returns a generator. Each time the generator is asked for a value, the body runs until it reaches `yield`, hands out that value, and **pauses**, keeping all its variables. The next request resumes from the same place. When the function ends, the generator stops.

Generators have three great strengths:

- **Memory.** `sum(n * n for n in range(1, 1_000_001))` adds a million squares without ever building a list of a million numbers. Each value exists only while it's being added.
- **Endless sequences.** A generator can produce values forever, and the caller takes as many as it needs. `fibonacci` stops at a limit, but it doesn't have to.
- **Pipelines.** `read_records` cleans data as it's read: it splits each line, skips bad ones, and yields tidy pairs. The code that uses it sees only good records, one at a time, however large the input. (`partition(",")` splits a string at the first comma into three parts: before, the comma, and after.)

## itertools

The `itertools` module is a toolbox of iterator building blocks:

```
@include code/ch14/itertools_demo.py
```

```
@include code/ch14/itertools_demo.out
```

| Function | What it produces |
| --- | --- |
| `count(start, step)` | numbers forever; `islice` takes the first few |
| `chain(a, b, ...)` | the items of several iterables, one after another |
| `accumulate(items)` | running totals |
| `product(a, b)` | every combination of one item from each |
| `combinations(items, n)` | every way to choose `n` items, ignoring order |
| `groupby(items, key)` | runs of consecutive items with the same key |

`groupby` groups only **consecutive** items, so sort the data by the key first if it isn't already. `key=region_of` passes a function that tells `groupby` which part of each row to group by, just as `key=` did for `sorted` in Chapter 7. Chapter 20 shows a shorter way to write such small functions.

## Try It

1. Rewrite the "still to read" loop from `library_v2.py` as a list comprehension.
2. Use a dictionary comprehension to build `{1: 1, 2: 8, 3: 27, ...}` for the numbers 1 to 10 and their cubes.
3. Write a generator `evens()` that yields 0, 2, 4, ... forever, and use `itertools.islice` to print the first five.

## Exercises

1. **Even squares.** Write `even_squares(numbers)`, which returns the squares of the even numbers, using a list comprehension.
2. **Word lengths.** Write `word_lengths(text)`, which returns a dictionary from each word, in lower case, to its length, using a dictionary comprehension.
3. **Chunks.** Write a generator `chunked(items, size)` that yields lists of `size` items at a time, with a shorter list at the end if needed. `list(chunked("abcdefg", 3))` should give `[['a', 'b', 'c'], ['d', 'e', 'f'], ['g']]`.

## Key Takeaways

- List, dictionary and set comprehensions build collections in one readable line: `[expr for item in items if condition]`.
- A `for` loop calls `iter` once and `next` repeatedly until `StopIteration`. Classes with `__iter__` and `__next__` work in loops.
- Generator functions use `yield` to produce values one at a time, pausing in between. Generator expressions are comprehensions in parentheses.
- Generators save memory, handle endless sequences and make data pipelines. `itertools` adds counting, chaining, running totals, combinations and grouping.
