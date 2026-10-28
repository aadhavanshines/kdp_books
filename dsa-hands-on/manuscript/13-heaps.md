# Chapter 13: Heaps and Priority Queues

A queue serves items in the order they arrived. Often that's not what you want: an emergency room treats the most urgent patient first, an operating system runs the most important task first, and a route planner explores the closest unexplored place first. What you need is a **priority queue**: add items in any order, and always take out the one with the highest priority (or the smallest key) next.

A sorted list makes "take the smallest" O(1), but adding is O(n). An unsorted list makes adding O(1), but finding the smallest is O(n). A **binary heap** does both in O(log n), using nothing but a plain list. This chapter builds one, shows how to build a heap in linear time, and then uses the standard library's `heapq` for four patterns that come up constantly.

## A Tree Hidden in a List

A binary heap is a binary tree, a structure where every item has up to two children, with one rule, the **heap property**: every parent is less than or equal to its children. So the smallest item is always at the top, the **root**.

The clever part is the storage. The tree is kept complete, filled level by level from left to right, so it can be stored in a list with no pointers at all: the root at index 0, and for the item at index i, its children at 2i + 1 and 2i + 2 and its parent at (i - 1) // 2.

```python
@include code/ch13/binary_heap.py#L1-L33
```

`push` appends the new item at the bottom of the tree, the end of the list, then **sifts it up**: while it's smaller than its parent, swap them. The tree has about log₂ n levels, so that's O(log n) swaps at most.

```python
@include code/ch13/binary_heap.py#L35-L66
```

`pop` must remove the root. It moves the *last* item into the root's place, which keeps the tree complete, and then **sifts it down**: while it's bigger than its smaller child, swap them. Again at most log₂ n levels.

Watch the list as items go in and out:

```python
@include code/ch13/heap_demo.py
```

```
@include code/ch13/heap_demo.out
```

After pushing 7, 4, 9, 1 and 5, the list is `[1, 4, 9, 7, 5]`. It isn't sorted, but it satisfies the heap property: 1 is above 4 and 9, and 4 is above 7 and 5. That's much less order than sorting, which is exactly why maintaining it is cheaper. Popping repeatedly gives the items in sorted order, which is **heapsort** (Exercise 1).

## Building a Heap in Linear Time

To turn a list of n items into a heap, you could push them one by one: n pushes of O(log n) each. `heapify` is smarter: it sifts *down* every parent, starting from the last parent and moving up to the root. Most nodes are near the bottom, where sifting down is short (half the nodes are leaves and don't move at all), and the few near the top are the only ones that can travel far. Adding it all up gives fewer than n swaps: O(n).

Here's the count on the worst input for pushing, a list in decreasing order, where every new item sifts all the way to the top:

```python
@include code/ch13/count_swaps.py
```

```
@include code/ch13/count_swaps.out
```

`heapify` makes just under n swaps at every size; n pushes make about n log₂ n. At 100,000 items, it's 99,990 swaps against nearly 1.5 million.

## Testing

```python
@include code/ch13/test_heap.py
```

```
@include code/ch13/test_heap.out
```

`is_heap` checks the heap property directly: every item is at least its parent. The random test runs 10,000 pushes and pops against Python's `heapq` and checks the heap property after every single operation.

## Timing

```python
@include code/ch13/bench_heap.py
```

```
@include code/ch13/bench_heap.out
```

On random data, n pushes take about as long as `heapify`. That's not a contradiction of the swap counts: a random new item usually belongs near the bottom of the tree, so it sifts up only a level or two, and n pushes of random data average O(1) each. The O(n log n) worst case needs adversarial input, like the decreasing list above. `heapq`, in C, is several times faster than our class, as usual.

## The heapq Module: Four Patterns

`heapq` works on a plain list that you pass to its functions. It's a min-heap, the same as ours.

```python
@include code/ch13/heap_patterns.py
```

```
@include code/ch13/heap_patterns.out
```

1. **The k largest or smallest.** `nlargest(k, items)` keeps a heap of k items while it scans: O(n log k), much better than sorting when k is small.
2. **A priority queue.** Push `(priority, counter, task)` tuples. Tuples compare item by item, so the lowest priority number comes out first. The counter breaks ties in arrival order, and also stops Python from ever comparing two tasks directly, which would fail for objects that can't be compared.
3. **Merging sorted inputs.** `heapq.merge` keeps one item from each input in a heap and yields them in order, lazily: it works on files too large to fit in memory.
4. **A max-heap.** `heapq` only has a min-heap, so store negated values: the smallest negative is the largest original.

> **Real-World Use:** Python's `asyncio` keeps every scheduled callback, everything waiting for a timer (`asyncio.sleep`, `loop.call_later`), in a heap ordered by when it's due, pushing with `heapq.heappush`. The event loop only ever needs to know which timer fires *next*, exactly the question a heap answers in O(1).

## A Running Median

A favorite interview problem: numbers arrive one at a time; after each one, report the median of all so far. Two heaps solve it: a max-heap holding the smaller half and a min-heap holding the larger half, kept the same size (or the small half one bigger):

```python
@include code/ch13/running_median.py
```

```
@include code/ch13/running_median.out
```

Each new number goes into the low half; the largest of the low half then moves to the high half; and if the high half has become bigger, its smallest moves back. Now the median is the top of the low half, or the average of both tops. Each number costs O(log n), where sorting all numbers so far after each arrival would cost O(n log n) every time.

> **Interview Tip:** "k largest", "k closest", "k most frequent", "merge k sorted", "schedule by deadline or priority", "median of a stream": any of these phrases means a heap.

## Key Takeaways

- A binary heap keeps the smallest item at the root, with each parent ≤ its children.
- Stored in a list: children of i at 2i + 1 and 2i + 2, parent at (i - 1) // 2.
- `push` sifts up and `pop` sifts down: O(log n) each. Peeking at the smallest is O(1).
- `heapify` builds a heap in O(n) by sifting down from the last parent.
- Use `heapq`: for top-k, priority queues with a tie-breaking counter, lazy merging, and (with negation) max-heaps.
- Two heaps maintain a running median in O(log n) per number.

## Exercises

1. **Heapsort.** Sort a list with `MinHeap`: heapify, then pop n times. What's its Big O?
2. **k closest points.** Find the k points closest to the origin in O(n log k), keeping a max-heap of the best k seen so far.
3. **Merge k sorted lists.** Write your own version of `heapq.merge` for k lists, with a heap of (value, list number, position) tuples.
