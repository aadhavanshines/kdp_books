# Chapter 22: Performance: Measuring, Profiling and Choosing Data Structures

Most programs are fast enough. When one isn't, the cause is almost never where you'd guess, and the fix is almost never clever code. It's usually a better choice of data structure or algorithm, in one small part of the program. This chapter teaches the working method: **measure** before changing anything, **profile** to find where the time goes, and **choose** the right data structure. You'll see one change make a program thousands of times faster.

## How Work Grows

The most important question about any piece of code is how its work grows as the data grows. Here are two ways to find a number in a sorted list. **Linear search** checks each item in turn. **Binary search**, the strategy from the guessing game in Chapter 5, checks the middle and throws away the half that can't contain the target:

```
@include code/ch22/count_steps.py
```

```
@include code/ch22/count_steps.out
```

The program counts steps instead of timing them, so its output is the same on every computer. With a thousand items, binary search needs 10 steps instead of 1,000. With a million, it needs 20 instead of a million. Linear search grows in proportion to the data; binary search grows by one step each time the data doubles.

Programmers describe this growth with **big-O notation**:

| Notation | Name | Example |
| --- | --- | --- |
| O(1) | constant | looking up a key in a dictionary or set |
| O(log n) | logarithmic | binary search in a sorted list |
| O(n) | linear | searching a list; `x in some_list` |
| O(n log n) | "n log n" | sorting |
| O(n²) | quadratic | comparing every item with every other item |

For small data, it hardly matters. For large data, nothing matters more: no amount of fine-tuning makes an O(n²) program keep up with an O(n) one. The standard library's `bisect` module does binary search for you.

## Measuring with timeit

To compare two pieces of code, time them with `timeit`, which runs each one many times to get a reliable figure:

```
@include code/ch22/timeit_demo.py
```

Here's one run. Your numbers will be different, but the proportions will be similar:

```
@include code/ch22/timeit_demo.out
```

Checking whether a value is `in` a list means looking at the items one by one: O(n). A set uses **hashing** to jump straight to where the value would be: O(1). With 100,000 items, that's the difference between about a millisecond and well under a microsecond, for every search. When you check membership often, use a set or a dictionary.

The second comparison is a classic: joining many strings with `''.join(...)` or adding them one by one with `+=`. The two are close here, because CPython optimizes `+=` on strings in simple cases like this one, and in some runs `+=` even wins. `join` is still the recommended way, because its speed doesn't depend on that optimization.

> **Tip:** To time a single line quickly, type `python -m timeit "sum(range(1000))"` in the terminal. It chooses the number of runs for you.

Because timings vary, the book's checks compare speeds instead of printing them. This program's output is the same on every computer:

```
@include code/ch22/check_speed.py
```

```
@include code/ch22/check_speed.out
```

## Profiling: Finding the Slow Part

In a real program, you first have to find out where the time goes. A **profiler** runs your program and records how long each function takes:

```
@include code/ch22/profile_demo.py
```

One run:

```
@include code/ch22/profile_demo.out
```

The report lists functions by **cumulative time**, which includes the time spent in everything they call. `slow_unique` took about 0.35 seconds; `fast_unique`, which gives the same result, took under a millisecond. `slow_unique` checks `item not in result` against a list that grows to 3,000 items, for each of 20,000 items: O(n²). `fast_unique` uses `dict.fromkeys`, which keeps the first occurrence of each item, in order, using hashing: O(n).

To profile a whole program without changing it, run it with `python -m cProfile -s cumulative yourprogram.py`. Then look at the top few lines. That's where any improvement will come from.

## Rules for Faster Programs

1. **Make it work, make it right, then make it fast**, and only if it needs to be. Clear code that's fast enough beats clever code.
2. **Measure first.** Profile to find the bottleneck; don't guess. Usually one function, or one line, takes most of the time.
3. **Choose the right data structure.** Sets and dictionaries for lookups, `collections.deque` for adding and removing at both ends, `bisect` for sorted data, `heapq` for repeatedly taking the smallest item.
4. **Do less work.** Move calculations out of loops, cache results (Chapter 18), stop early when you have the answer, and process data as a stream with generators (Chapter 14).
5. **Use built-ins and libraries.** `sum`, `sorted`, `min`, `max`, `Counter` and `str.join` run in fast compiled code. For numerical work on large arrays, NumPy and pandas (Chapter 24) are many times faster than Python loops.
6. **Measure again** after each change, and keep your tests passing.

## Try It

1. Run `timeit_demo.py` a few times. How much do the numbers vary between runs?
2. Profile one of your own programs with `python -m cProfile -s cumulative`.
3. Use `bisect.bisect_left` to find where 42 would go in `[10, 20, 30, 40, 50]`.

## Exercises

1. **Duplicates.** Write `has_duplicates(items)`, which returns `True` if any item appears more than once, in one pass through the items, using a set.
2. **Grades with bisect.** Write `grade_for(score)`, which finds the letter grade (below 60 is F, 60 to 69 D, and so on up to 90 and above for A) using `bisect.bisect` on the list of cut-off scores instead of a chain of `if` statements.
3. **Pair with a sum.** Write `pair_with_sum(numbers, target)`, which returns two numbers from the list that add up to `target`, or `None`, in O(n) time. (Hint: for each number, check whether `target - n` is in a set of the numbers seen so far.)

## Key Takeaways

- How work grows with the data matters more than anything else: O(1) and O(log n) beat O(n), which beats O(n²).
- Measure with `timeit` and find bottlenecks with `cProfile` before changing code.
- `in` on a list is O(n); on a set or dictionary it's O(1). Choosing the right data structure is the most effective speed-up.
- Make code work and right first, then fast where measurement shows it matters, and measure again.
