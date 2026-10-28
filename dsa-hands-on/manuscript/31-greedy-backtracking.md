# Chapter 31: Greedy Algorithms and Backtracking

This chapter covers two opposite strategies. A **greedy** algorithm makes the choice that looks best right now and never reconsiders. When it's right, it's the simplest and fastest solution there is, usually a sort and one pass. The catch is that it's often wrong, and it takes a proof or a careful search for counterexamples to know. **Backtracking** is the other extreme: it tries every possible choice, one step at a time, and undoes a choice as soon as it can't lead to a solution. It's always right, but its cost grows exponentially, so it's for small inputs and for problems that ask for *all* the solutions.

## Greedy: Scheduling Meetings

One room, many meeting requests, each with a start and an end time. What's the largest number of meetings that can be held without overlaps?

```python
@include code/ch31/greedy.py#L8-L17
```

Several greedy rules sound reasonable: the shortest meeting first, the earliest start first, the meeting with the fewest conflicts first. Only one is always right: **the meeting that ends first**. The argument is an **exchange argument**. Take any best schedule. Its first meeting ends no earlier than the meeting that ends first overall, so swapping that one in keeps the schedule valid and the same size, and leaves at least as much time for everything after. Repeat for the rest. So the greedy choice is never worse than the best.

## Greedy: Intervals and Rooms

```python
@include code/ch31/greedy.py#L20-L40
```

To merge overlapping intervals, sort them by start; then each interval either overlaps the last merged one (extend it) or starts a new one. Sorting is the usual first step of a greedy algorithm, and it's usually the most expensive one: O(n log n), then O(n) for the pass.

How many rooms are needed to hold *all* the meetings? Go through the meetings by start time, keeping the end times of meetings in progress in a heap (Chapter 13). If the room that frees up first is free by the time the next meeting starts, reuse it; otherwise open a new room. The heap's size at the end is the most meetings ever in progress at once, which is exactly the number of rooms needed.

## Greedy: How Far Can You Jump?

```python
@include code/ch31/greedy.py#L43-L51
```

Each number in the list is the longest jump you can make from that position. Can you reach the last position? A search over all jump sequences would work, but one variable is enough: the furthest position reachable so far. If the loop ever arrives at a position beyond it, that position, and everything after, is out of reach.

```python
@include code/ch31/greedy_demo.py
```

```
@include code/ch31/greedy_demo.out
```

## When Greedy Fails

```python
@include code/ch31/greedy.py#L54-L60
```

The last two lines of the demo show the classic failure. With US coins, taking the largest coin that fits always gives the fewest coins: 63 cents is 25 + 25 + 10 + 1 + 1 + 1, six coins. With coins 1, 3 and 4, greedy makes 6 as 4 + 1 + 1, but 3 + 3 is better. Taking the 4 felt like progress, but it left a remainder that's awkward to make. When an early choice can make later choices worse, greedy breaks, and you need dynamic programming (Chapter 29), which considers every choice for each subproblem.

> **Tip:** Before trusting a greedy idea, try to break it. Write the brute force, which tries every possibility on small inputs, and compare the two on a few thousand random cases, as this chapter's tests do. If they never disagree, look for the exchange argument; if they do, you've found your counterexample in seconds, not in the interview.

> **Interesting Fact:** One of the most widely used greedy algorithms came from a student avoiding an exam. In 1951, David Huffman, a graduate student at MIT, was given the choice of a final exam or a term paper in Robert Fano's information theory course; the paper's problem was to find the most efficient binary code. Huffman's answer, published in 1952, builds the code greedily, always merging the two least frequent symbols, and no code that gives each symbol its own bit pattern can do better. **Huffman coding** is still part of DEFLATE, the compression inside zip, gzip and PNG.

## Backtracking: Trying Everything, Carefully

Backtracking builds a solution one choice at a time. At each step it tries each available choice, **recurses** to make the rest of the choices, and then **undoes** the choice before trying the next. The undo step is what makes it backtracking: one shared list of choices is reused for the whole search, instead of a new copy at every step.

```python
@include code/ch31/backtracking.py#L5-L37
```

For subsets, each item has two choices: out or in. For permutations, each position can hold any item not yet used. Notice `out.append(list(chosen))`: it stores a *copy*, because `chosen` keeps changing as the search goes on. Appending `chosen` itself would fill `out` with references to one list, which is empty by the time the search ends. It's the most common backtracking bug.

There are 2ⁿ subsets and n! permutations, so these searches are exponential however they're written; the output alone is that large.

## Pruning

Backtracking gets its speed from **pruning**: abandoning a partial solution as soon as it's clear it can't be completed, skipping every solution that would have extended it.

```python
@include code/ch31/backtracking.py#L40-L58
```

Every combination of candidates, with repeats allowed, that adds up to a target. Because the candidates are sorted, once one is too big for the remaining amount, all later ones are too, so the loop stops (`break`) instead of trying them. And recursing with `i`, not `i + 1`, lets the same candidate be used again, while never going back to an earlier one, so each combination is produced once, in sorted order.

## The N-Queens Puzzle

Place n chess queens on an n × n board so that no two attack each other: no two in the same row, column or diagonal.

```python
@include code/ch31/backtracking.py#L61-L82
```

There's one queen per row, so the search places them row by row, trying each column. Three sets record the attacked columns and diagonals. On one diagonal, `row - col` is the same for every square; on the other, `row + col` is. So checking whether a square is safe takes three O(1) set lookups instead of scanning the board. A square under attack prunes the whole branch below it.

```python
@include code/ch31/backtracking_demo.py
```

```
@include code/ch31/backtracking_demo.out
```

On the standard 8 × 8 board there are 92 solutions; there are none for 2 × 2 and 3 × 3.

## Testing

```python
@include code/ch31/test_greedy_backtracking.py
```

```
@include code/ch31/test_greedy_backtracking.out
```

The greedy schedulers are checked against brute force: every subset of up to seven random meetings for the most meetings, and the busiest moment for the number of rooms. Subsets and permutations are checked against `itertools`, and the queens counts against the known values.

## Timing

```python
@include code/ch31/bench_queens.py
```

```
@include code/ch31/bench_queens.out
```

Each row adds *one* to n, and the time grows four to five times: exponential growth. Without pruning, trying every way to put one queen in each row would mean nⁿ placements, ten billion for n = 10; pruning cuts that to a search that takes under 40 milliseconds. Pruning doesn't change the exponential shape, but it changes how far you can go before hitting the wall.

> **Real-World Use:** The regular expression engine in Python's `re` module is a backtracking engine. When part of a pattern fails to match, it goes back and tries another way of matching the earlier parts. Some patterns, such as `(a+)+b` on a long string of `a`s with no `b`, give it exponentially many ways to try, which can make a single match take practically forever. Python 3.11 added **atomic groups** `(?>...)` and **possessive quantifiers** such as `a++` to `re`; both tell the engine not to backtrack into a part that has already matched, a form of pruning you write into the pattern.

> **Interview Tip:** "All", "every", "generate", "list each" in a problem statement, with small input sizes (n up to about 10 to 20), point to backtracking. Say the template out loud: choose, recurse, undo. Then say what you'll prune.

## Key Takeaways

- Greedy takes the locally best choice and never reconsiders: often a sort plus one pass.
- Greedy is only right with a proof, usually an exchange argument; test it against brute force before trusting it.
- When an early choice can spoil later ones (coin systems, knapsacks), use dynamic programming instead.
- Backtracking tries every choice step by step: choose, recurse, undo. Store copies of solutions, not the shared list.
- Pruning abandons hopeless partial solutions early; it makes exponential searches practical for small inputs.

## Exercises

1. **Balanced brackets.** Generate every string of n pairs of balanced brackets, such as `(())()` for n = 3.
2. **A small sudoku.** Solve a 4 × 4 sudoku, in which every row, column and 2 × 2 box must hold each of the digits 1 to 4 once.
