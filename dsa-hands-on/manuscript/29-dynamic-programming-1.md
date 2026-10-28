# Chapter 29: Dynamic Programming I: Memoization and Tables

Chapter 5's recursive Fibonacci was exponential because it solved the same smaller problems again and again, and adding a cache made it linear. That fix has a name: **dynamic programming** (DP). It applies whenever a problem has two properties:

- **Optimal substructure:** the answer can be built from the answers to smaller versions of the same problem.
- **Overlapping subproblems:** those smaller problems repeat, so solving each one once and storing the answer saves work.

There are two ways to write a DP solution. **Top-down** (memoization) writes the natural recursion and adds a cache. **Bottom-up** (tabulation) fills a table from the smallest problems up, with a loop and no recursion. Both do the same work; this chapter writes both and times them.

> **Interesting Fact:** The name was chosen to hide what it meant. In his autobiography, Richard Bellman wrote that in the early 1950s his employer, the RAND Corporation, worked for the US Air Force, and the Secretary of Defense above it, Charles Wilson, disliked the very word "research". So Bellman picked a name nobody could object to: "programming" in the sense of planning a schedule, and "dynamic" because it sounded impressive and described the time-varying problems he studied. Historians have pointed out that Wilson only became Secretary of Defense in 1953, after Bellman's work had begun, so the story may be tidier than the facts.

## The Five Questions

Every DP solution comes from answering five questions, in this order:

1. **State:** what does one subproblem look like? ("The number of ways to climb the first i stairs.")
2. **Recurrence:** how is a state's answer built from smaller states? (This is the hard part, and the part to say out loud in an interview.)
3. **Base cases:** which states are answered directly?
4. **Order:** in which order must states be computed, so that every state's ingredients are ready first?
5. **Answer:** which state, or combination of states, is the final answer?

## Climbing Stairs

```python
@include code/ch29/dp_basics.py#L8-L14
```

How many ways are there to climb n stairs taking one or two at a time? The state is the number of stairs. The recurrence comes from thinking about the *last* move: it was either a single step, from stair n - 1, or a double step, from stair n - 2. So ways(n) = ways(n - 1) + ways(n - 2): Fibonacci again. Since each state only needs the two before it, two variables replace the whole table: O(n) time, O(1) memory.

## House Robber

```python
@include code/ch29/dp_basics.py#L17-L23
```

Houses stand in a row, each with some money; a robber can't take from two neighbors (the alarms are linked). What's the most they can take? At each house there are two choices. Skip it: the best total is the best up to the previous house. Take it: its money plus the best up to *two* houses back. The answer is the larger. Again only two earlier states are needed.

Greedy shortcuts fail here. Taking every other house from the first gives 5 + 1 = 6 for `[5, 1, 1, 5]`, but the best is 5 + 5 = 10.

## Fewest Coins

What's the fewest coins that make a given amount? With US coins, the greedy method of taking the largest coin that fits works. But with coins 1, 3 and 4, greedy makes 6 as 4 + 1 + 1, three coins, when 3 + 3 takes two (Chapter 31 runs this example). DP considers every choice for the last coin:

```python
@include code/ch29/dp_basics.py#L26-L48
```

The top-down version is the recurrence written directly: the fewest coins for amount a is 1 plus the best for a - c, over every coin c that fits. `functools.cache` remembers each answer. The bottom-up version fills `table[a]` for every amount from 1 up, so that `table[a - c]` is always ready when it's needed. Both are O(amount × coins). The bottom-up version makes no recursive calls, so it doesn't run into the recursion limit for large amounts; the top-down version would need `sys.setrecursionlimit` for an amount in the thousands.

Watch the table fill:

```python
@include code/ch29/coin_table.py
```

```
@include code/ch29/coin_table.out
```

Each entry is one more than the best of the entries 1, 2 and 5 places to its left. Eleven takes three coins: 5 + 5 + 1.

## Counting Combinations

```python
@include code/ch29/dp_basics.py#L51-L59
```

How many different combinations of coins make the amount? The loop order matters. With the coins on the *outside*, each coin is added to the combinations before moving to the next, so 1 + 2 + 2 and 2 + 1 + 2 are counted once, as the same combination. Swap the loops, and the code counts *sequences*, with each order counted separately. Both are useful; know which one the problem asks for.

## Paths Through a Grid

```python
@include code/ch29/dp_basics.py#L62-L74
```

The cheapest path from the top-left to the bottom-right of a grid of costs, moving only right or down. A cell can only be entered from above or from the left, so its best cost is its own cost plus the better of those two. Filling the grid row by row, left to right, guarantees both are ready. Two-dimensional states work exactly like one-dimensional ones.

```python
@include code/ch29/dp_demo.py
```

```
@include code/ch29/dp_demo.out
```

## Testing Against Exhaustive Search

```python
@include code/ch29/test_dp_basics.py
```

```
@include code/ch29/test_dp_basics.out
```

DP code is easy to get subtly wrong: an off-by-one in a base case, a loop in the wrong order. Every function here is checked against trying *everything* on small inputs: every sequence of 1- and 2-steps, every allowed set of houses (as bit masks with no two neighboring bits set), every combination of coins, every right-and-down path.

## Timing

```python
@include code/ch29/bench_coins.py
```

```
@include code/ch29/bench_coins.out
```

The amounts here grow by 5 per row, not double. Plain recursion multiplies its time by about 4.6 for every 5 cents: exponential. Already at 35 cents it's over a thousand times slower than the memoized version. The memoized and table versions grow linearly, and the table is about two to three times faster than memoization because it skips the function calls and the cache lookups.

> **Tip:** Write the top-down version first: it's the recurrence, word for word, and the cache makes it fast. Switch to bottom-up when recursion depth is a problem, or when you can see that each state only needs the last row or two, so the whole table can shrink to a few variables.

> **Interview Tip:** Signal words for DP: "how many ways", "the minimum or maximum ... such that", "is it possible to", together with choices that affect later choices. If you find yourself drawing a recursion tree with repeated nodes, say so, and add the cache.

## Key Takeaways

- DP applies when the answer is built from answers to smaller, repeating subproblems.
- Define the state, the recurrence, the base cases, the order and the final answer, in that order.
- Top-down is recursion plus `functools.cache`; bottom-up fills a table with a loop.
- Both are usually O(states × choices per state); bottom-up avoids the recursion limit and call overhead.
- If each state only needs the last few, keep a few variables instead of the table.

## Exercises

1. **Decode ways.** A message of letters was encoded as digits, A = 1, B = 2, ..., Z = 26, and the spaces were lost. In how many ways can a string of digits be decoded? ("226" can be BZ, VF or BBF.)
2. **Paths with obstacles.** How many right-and-down paths cross a grid from the top-left to the bottom-right, when some cells (`#`) are blocked?
3. **The cheapest climb.** Each stair has a cost you pay when you step on it. You may climb one or two stairs at a time and may start on stair 0 or stair 1. What's the cheapest way to get past the top?
