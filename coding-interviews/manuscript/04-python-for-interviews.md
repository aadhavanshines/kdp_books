# Chapter 4: Python for Interviews

Python is the most popular language for coding interviews, and for good reason: its standard library already contains most of the data structures that interview problems need, and its code is short enough to write quickly and read aloud. This chapter is a tour of the tools you will use again and again in Part II, with the operations that matter and their costs. Each snippet is a real program; the output printed below each one is what it produces.

## Lists, Strings and Grids

Lists and strings support slicing, sorting and the familiar loops. Two built-ins make loops clearer: `enumerate` gives you each item's position, and `zip` walks several sequences together.

```python
@include code/ch04/t05_strings_lists.py::demo
```

```
@include code/ch04/t05_strings_lists.demo.txt
```

> **Common Mistake:** `[[0] * cols] * rows` creates one row and repeats a reference to it, so changing one cell changes every row, as the last line of output shows. Always build grids with a comprehension: `[[0] * cols for _ in range(rows)]`.

The costs to remember: indexing and appending are O(1); inserting or deleting at the front, `in` on a list, slicing and copying are O(n); sorting is O(n log n). Strings are immutable, so building a string by repeated `+=` in a loop can cost O(n²); collect pieces in a list and `"".join` them at the end.

## Sets and Dictionaries

Hash-based sets and dictionaries are the single most useful tools in interviews: membership tests, insertions and lookups are all O(1) on average.

```python
@include code/ch04/t07_sets_dicts.py::demo
```

```
@include code/ch04/t07_sets_dicts.demo.txt
```

Keys must be immutable: numbers, strings and tuples work; lists do not. To use a list as a key, convert it with `tuple(...)`, as Problem 5.3 does.

## Counter and defaultdict

`Counter` counts things, and `defaultdict` creates a starting value for missing keys, which removes most "if key not in dict" checks.

```python
@include code/ch04/t01_counting.py::demo
```

```
@include code/ch04/t01_counting.demo.txt
```

## deque: Fast Queues

A Python list is slow to remove from the front (O(n)), so never use `list.pop(0)` for a queue. `collections.deque` adds and removes at both ends in O(1). It is the queue for breadth-first search in Chapters 16 and 17, and with `maxlen` it keeps a fixed-size window of recent items.

```python
@include code/ch04/t02_deque.py::demo
```

```
@include code/ch04/t02_deque.demo.txt
```

## heapq: Priority Queues

`heapq` keeps a list arranged as a binary min-heap: the smallest item is always at index 0. Pushing and popping cost O(log n), and building a heap from a list with `heapify` costs O(n). Python has no max-heap, so store negated values. Tuples are compared item by item, which makes `(priority, tie_breaker, payload)` entries a convenient way to order anything.

```python
@include code/ch04/t03_heapq.py::demo
```

```
@include code/ch04/t03_heapq.demo.txt
```

> **Common Mistake:** If two heap entries have equal priorities, Python compares the next items in the tuples. If those are objects that can't be compared, such as linked-list nodes, you get a `TypeError`. Add a unique counter as a tie-breaker: `(priority, count, node)`. Problem 11.6 uses this trick.

## Sorting With Keys, and bisect

`sorted` and `list.sort` accept a `key` function; returning a tuple sorts by several criteria at once, and negating a number reverses its order. The `bisect` module performs binary search on a sorted list: `bisect_left` finds the first position where a value could be inserted, `bisect_right` the last.

```python
@include code/ch04/t04_bisect_sort.py::demo
```

```
@include code/ch04/t04_bisect_sort.demo.txt
```

## itertools and functools

`itertools` provides combinations, permutations, Cartesian products and running totals, which are handy for brute-force solutions and for checking your answers. `functools.cache` remembers the results of a function, turning many recursive solutions into dynamic programming with one line (Chapter 18).

```python
@include code/ch04/t06_itertools.py::demo
```

```
@include code/ch04/t06_itertools.demo.txt
```

## Python Habits That Help in Interviews

- **Use `float("inf")`** as a starting value for minimums, and `-float("inf")` for maximums.
- **Integers never overflow** in Python, which removes a whole class of bugs. Mention it if your interviewer works in Java or C++.
- **Recursion depth is limited** to about 1,000 calls by default. For inputs that could be deeper, such as a long linked list or a degenerate tree, use an explicit stack, or say that you would raise the limit with `sys.setrecursionlimit`.
- **Don't mutate a list while looping over it.** Loop over a copy, or build a new list.
- **Don't modify the caller's input** unless the problem allows it. Several solutions in this book copy a grid before marking cells.
- **Know the edge cases of slicing:** slices never raise an error for out-of-range positions, which is convenient, but can hide bugs.

## Key Takeaways

- Lists: O(1) append and index; O(n) for insertions at the front, `in`, and copying.
- Sets and dicts: O(1) average membership and lookup. Use tuples as composite keys.
- `Counter`, `defaultdict`, `deque`, `heapq`, `bisect`, `itertools` and `functools.cache` cover most of what interview problems need.
- Watch for the shared-row grid bug, uncomparable heap entries, recursion limits and accidental O(n²) string building.
