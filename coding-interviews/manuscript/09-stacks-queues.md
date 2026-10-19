# Chapter 9: Stacks and Queues

A **stack** is last-in, first-out: like a pile of plates, you add and remove at the top. A **queue** is first-in, first-out: like a line at a counter. In Python, a list is a perfect stack (`append` and `pop` are O(1)), and `collections.deque` is a perfect queue. Stacks appear whenever something must be *matched* or *undone* in reverse order; a special kind, the **monotonic stack**, answers "what is the next bigger item?" for every item in one pass.

## When to Use It

- **Matching** pairs that nest: brackets, tags, function calls.
- **Undo** or **backtrack** in reverse order; evaluating expressions.
- "For each item, find the **next (or previous) greater or smaller** item": a monotonic stack.
- "The maximum (or minimum) of every **window**": a monotonic deque.
- Processing items **in arrival order**: a queue (and breadth-first search, Chapter 16).

A monotonic stack keeps items in increasing or decreasing order. When a new item would break the order, items are popped, and *popping is the moment an item finds its answer*: the new item is the first one bigger (or smaller) than it.

## 9.1 Balanced Brackets (Easy)

Is every bracket in the text closed in the right order? `()`, `[]` and `{}` count; other characters are ignored.

```
@include code/ch09/p01_balanced_brackets.examples.txt
```

**The idea.** Push each opening bracket on a stack. A closing bracket must match the most recent unmatched opener, which is the top of the stack. At the end, the stack must be empty.

```python
@include code/ch09/p01_balanced_brackets.py::balanced
```

**Complexity:** O(n) time, O(n) space.

> **Common Mistake:** Forgetting the final check `not stack`. "((" has no mismatches, but it isn't balanced.

## 9.2 Minimum Stack (Medium)

Design a stack with `push`, `pop`, `top` and `minimum`, all in O(1).

**Think first:** When you pop an item, how can you know the new minimum without searching?

**The idea.** Store, with each item, the smallest value at or below it in the stack. The minimum of the whole stack is then simply stored with the top item, and popping automatically restores the previous minimum.

```python
@include code/ch09/p02_min_stack.py::MinStack
```

The examples run a sequence of operations and collect what `pop`, `top` and `minimum` return:

```
@include code/ch09/p02_min_stack.examples.txt
```

**Complexity:** O(1) for every operation; O(n) space.

> **Follow-Up:** "Use less memory." Keep a second stack that receives a value only when it is less than or equal to the current minimum, and pop from it only when the popped value equals its top.

## 9.3 Postfix Calculator (Medium)

Evaluate an arithmetic expression written in postfix (reverse Polish) notation, where operators come after their operands: `3 4 + 2 *` means (3 + 4) × 2. Division truncates toward zero.

```
@include code/ch09/p03_postfix.examples.txt
```

**The idea.** Numbers are pushed onto a stack. An operator pops its two operands, the right operand first, and pushes the result.

```python
@include code/ch09/p03_postfix.py::postfix
```

**Complexity:** O(n) time, O(n) space.

> **Common Mistake:** In Python, `//` rounds toward negative infinity, so `-7 // 2` is -4. "Truncate toward zero" requires `int(a / b)`, which gives -3. The example `7 / -2` checks this.

## 9.4 Next Warmer Day (Medium)

Given daily temperatures, for each day, how many days do you wait for a warmer one? Use 0 if no warmer day follows.

```
@include code/ch09/p04_next_warmer.examples.txt
```

**Brute force.** For each day, scan forward: O(n²) in the worst case, for falling temperatures.

**The better idea.** Keep a stack of days still waiting for a warmer day; their temperatures decrease from bottom to top. When a new day is warmer than the top, the top day's wait is over: pop it and record the answer. Repeat, then push the new day.

```python
@include code/ch09/p04_next_warmer.py::next_warmer
```

**Complexity:** O(n) time: each day is pushed once and popped at most once. O(n) space.

## 9.5 Largest Banner (Hard)

A skyline is made of bars of width 1. What is the area of the largest rectangle that fits entirely under the skyline?

```
@include code/ch09/p05_largest_banner.examples.txt
```

**Think first:** If a bar is the *shortest* bar in the rectangle, how far can the rectangle extend left and right?

**Brute force.** For each starting bar, extend right while tracking the minimum height: O(n²).

**The better idea.** For each bar, the widest rectangle with that bar as the shortest extends until the first shorter bar on each side. A stack of bars with increasing heights finds both boundaries: when a shorter bar arrives, it is the right boundary for every taller bar it pops, and the bar below each popped bar on the stack is its left boundary. A height-0 bar at the end flushes the stack.

```python
@include code/ch09/p05_largest_banner.py::largest_banner
```

**Complexity:** O(n) time, O(n) space.

> **Follow-Up:** "The largest rectangle of 1s in a binary grid." Treat each row as the base of a skyline whose heights count the consecutive 1s above, and apply this solution to each row: O(rows × cols).

## 9.6 Window Peaks (Hard)

Return the maximum of every window of k consecutive values.

```
@include code/ch09/p06_window_peaks.examples.txt
```

**Brute force.** Take the maximum of each window: O(n × k). A heap gives O(n log n).

**The better idea.** Keep a deque of positions whose values *decrease* from front to back. A new value removes all smaller values from the back, because they can never be a window maximum again while it is in the window. The front is the current maximum; remove it when it falls out of the window.

```python
@include code/ch09/p06_window_peaks.py::window_peaks
```

**Complexity:** O(n) time: each position enters and leaves the deque at most once. O(k) space.

## Key Takeaways

- Stacks match and undo things in reverse order: brackets, expressions, nested structures.
- A monotonic stack finds the next greater or smaller item for every position in O(n); popping is when an item gets its answer.
- A monotonic deque gives the maximum or minimum of every sliding window in O(n).
- Use a list as a stack and a `deque` as a queue.
