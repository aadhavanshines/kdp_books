# Chapter 13: Heaps and Top-K

A heap gives you the smallest (or largest) item of a changing collection in O(1), and lets you add or remove items in O(log n). That makes it the natural tool for "top k", "k-th largest", "merge many sorted things" and "always process the most urgent item next". Python's `heapq` module provides a min-heap stored in an ordinary list (Chapter 4).

## When to Use It

- "Find the **k largest**, **k smallest**, **k most frequent** or **k closest**."
- "Find the **k-th** largest or smallest."
- **Repeatedly take the best** remaining option: scheduling, merging sorted streams, shortest paths (Chapter 17).
- Maintain a **running median** or other order statistic as data arrives.

A useful trick for top-k: to keep the k *largest* items, use a *min*-heap of size k. Its smallest item is the weakest of the current top k, and any new item that beats it replaces it. That costs O(n log k) instead of O(n log n) for sorting everything, and O(k) memory.

## 13.1 Kth Largest Score (Easy)

Find the k-th largest value in a list of scores (duplicates count separately).

```
@include code/ch13/p01_kth_largest.examples.txt
```

**The simple idea.** Sort in descending order and take position k - 1: O(n log n).

**The better idea.** Keep a min-heap of the k largest scores seen so far; at the end, its smallest item is the k-th largest.

```python
@include code/ch13/p01_kth_largest.py::kth_largest
```

**Complexity:** O(n log k) time, O(k) space.

> **Follow-Up:** "Can you do it in O(n) on average?" Yes, with *quickselect*: partition around a pivot as in quicksort, and recurse only into the side that contains position k.

## 13.2 Most Common Tags (Medium)

Return the k most frequent tags, most frequent first; break ties alphabetically.

```
@include code/ch13/p02_top_k_words.examples.txt
```

**The idea.** Count with a `Counter`, then select the k best by the key `(-count, tag)`: a higher count first, then alphabetical. `heapq.nsmallest` does this in O(n log k).

```python
@include code/ch13/p02_top_k_words.py::top_k
```

**Complexity:** O(n + u log k) for n tags with u distinct values.

An alternative uses "bucket sort" by count, which avoids the heap: tags go into a list indexed by their count, so only tags with equal counts need sorting:

```python
@include code/ch13/p02_top_k_words.py::top_k_buckets
```

## 13.3 Closest Stations (Medium)

Given stations at points (x, y), return the k closest to the origin, sorted by distance and then by coordinates.

```
@include code/ch13/p03_closest_stations.examples.txt
```

**The idea.** Keep a max-heap of the k closest so far, by storing negated keys. If a new station is closer than the farthest one kept, replace it. Compare squared distances: no square roots needed, and no rounding errors.

```python
@include code/ch13/p03_closest_stations.py::closest
```

**Complexity:** O(n log k) time, O(k) space.

## 13.4 Running Median (Hard)

Readings arrive one at a time. After each one, report the median of all readings so far.

```
@include code/ch13/p04_running_median.examples.txt
```

**Think first:** The median sits between the smaller half and the larger half. Which items of each half do you need quick access to?

**The idea.** Keep two heaps: a max-heap `low` for the smaller half and a min-heap `high` for the larger half, with `low` allowed one extra item. Each new reading passes through `low` into `high`, which keeps the halves in order, and then the sizes are rebalanced. The median is the top of `low`, or the average of both tops.

```python
@include code/ch13/p04_running_median.py::running_median
```

**Complexity:** O(log n) per reading, O(n) space.

## 13.5 Cooldown Scheduler (Medium)

A machine runs tasks of several types, one task per time unit. Two tasks of the same type must be at least n units apart; the machine may sit idle. What is the minimum total time?

```
@include code/ch13/p05_cooldown_scheduler.examples.txt
```

**The simulation.** Each step, run the task type with the most remaining tasks that isn't cooling down; a heap finds it, and a queue holds types waiting out their cooldown. This works and generalizes to variations.

```python
@include code/ch13/p05_cooldown_scheduler.py::cooldown_simulate
```

**The formula.** The most frequent type dictates the shape: with `most` tasks of that type, there are `most - 1` full blocks of length n + 1, plus a final row containing every type that ties for the maximum count. If there are so many other tasks that no idle time is needed, the answer is simply the number of tasks.

```python
@include code/ch13/p05_cooldown_scheduler.py::cooldown
```

**Complexity:** O(number of tasks) for the formula. The tests compare the formula with the simulation on thousands of random cases.

## 13.6 No Two Alike (Medium)

Rearrange the letters of a string so that no two neighboring letters are equal. Return any valid arrangement, or "" if it's impossible.

```
@include code/ch13/p06_no_neighbors.examples.txt
```

**Think first:** Which letter is most at risk of ending up next to itself?

**The idea.** Greedily place the most frequent remaining letter, but never the letter just placed: hold it back for one step, then return it to the heap. If the held letter can never be placed, the arrangement is impossible, which happens exactly when one letter fills more than half the positions (rounded up).

```python
@include code/ch13/p06_no_neighbors.py::no_neighbors
```

**Complexity:** O(n log k) for k distinct letters.

> **Tip:** When several answers are valid, the tests in this book check the *properties* of the answer, the same letters and no equal neighbors, rather than one exact string. In an interview, say how you would test it the same way.

## Key Takeaways

- A heap gives the minimum in O(1) and updates in O(log n); negate values for a max-heap.
- For the top k of n items, keep a heap of size k: O(n log k).
- Two heaps maintain a running median.
- Greedy scheduling problems often mean "always take the best option a heap can give you", with a queue for items that are temporarily unavailable.
