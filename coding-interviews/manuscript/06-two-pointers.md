# Chapter 6: Two Pointers

Many problems on arrays and strings can be solved by walking two positions through the data at the same time: one from each end, moving towards each other, or both from the start at different speeds. Because each pointer only ever moves forward, the whole walk takes O(n), and usually needs no extra memory.

## When to Use It

- The input is **sorted**, or sorting it first is acceptable.
- You are looking for a **pair or triple** with some property, such as a target sum.
- The problem compares the **two ends** of something: palindromes, containers, symmetric structures.
- You need to **merge** two sorted sequences, or **filter in place**.

The recipe for opposite-end pointers:

1. Start `left` at the beginning and `right` at the end.
2. Look at the two items; decide which pointer can be moved without losing any possible answer.
3. Move it, and repeat until the pointers meet.

The key step is the argument in step 2: *why* moving that pointer can't skip the answer. Say it out loud in the interview; it is the proof that your solution is correct.

## 6.1 Palindrome Plate (Easy)

A label reads the same forwards and backwards if you ignore everything except letters and digits, and ignore case. *Step on no pets!* qualifies. Write a function to check, using O(1) extra space.

```
@include code/ch06/p01_palindrome_plate.examples.txt
```

**Think first:** You could build a cleaned copy and compare it with its reverse. How can you avoid the copy?

**The simple version.** Filter and lower-case the characters into a list, and compare it with its reverse. It is O(n) time but O(n) space, and it is a perfectly good first answer.

```python
@include code/ch06/p01_palindrome_plate.py::is_palindrome_simple
```

**The better idea.** Compare from both ends inwards, skipping characters that don't count.

```python
@include code/ch06/p01_palindrome_plate.py::is_palindrome
```

**Complexity:** O(n) time, O(1) extra space.

> **Follow-Up:** "Can it become a palindrome by deleting at most one character?" At the first mismatch, try skipping either the left or the right character, and check whether the rest is a palindrome. That is still O(n).

## 6.2 Sorted Pair (Easy)

A list of package weights is sorted in increasing order. Find two different packages whose weights sum to a target, using O(1) extra space. Return their positions, or an empty list.

```
@include code/ch06/p02_sorted_pair.examples.txt
```

**Think first:** If the smallest plus the largest is too small, which of the two can never be part of the answer?

**The idea.** Start with the lightest and heaviest packages. If their sum is too small, the lightest package can't pair with anything (even the heaviest isn't enough), so move `left` up. If the sum is too big, the heaviest package can't pair with anything, so move `right` down.

```python
@include code/ch06/p02_sorted_pair.py::sorted_pair
```

**Complexity:** O(n) time, O(1) space. Compare this with Problem 5.1, which needs O(n) space because its input isn't sorted.

## 6.3 Balanced Triples (Medium)

A sensor reports readings, which can be negative. Find all *distinct* triples of readings that sum to zero. Each triple should be listed in increasing order, and the same triple of values should appear only once.

```
@include code/ch06/p03_balanced_triples.examples.txt
```

**Think first:** If you fix the smallest number of the triple, what problem is left?

**Brute force.** Check all O(n³) triples, putting sorted ones into a set to remove duplicates.

**The better idea.** Sort the readings. Fix each value as the first of the triple; the other two must sum to its negative, which is Problem 6.2 on the rest of the list. To avoid duplicate triples, skip a first value equal to the previous one, and after finding a triple, move `left` past any copies of the same value.

```python
@include code/ch06/p03_balanced_triples.py::balanced_triples
```

**Complexity:** O(n²) time: O(n log n) to sort, then O(n) for each of n first values. O(1) extra space apart from the output and the sorted copy.

> **Common Mistake:** Using a set of tuples to remove duplicates *after* finding them. It works, but interviewers usually ask you to avoid duplicates without it; the skipping logic shows that you understand where they come from.

## 6.4 Widest Reservoir (Medium)

Vertical walls of different heights stand at positions 0, 1, 2, and so on. Choose two walls; water fills the space between them up to the height of the shorter wall. What is the most water any pair can hold? The amount for walls i and j is `(j - i) × min(height[i], height[j])`.

```
@include code/ch06/p04_widest_reservoir.examples.txt
```

**Think first:** Starting with the two outermost walls, the widest possible pair, which wall should you give up on?

**Brute force.** Try every pair: O(n²).

**The better idea.** Start with the outermost pair. Any pair using the *shorter* of the two walls, with some wall further in, would be narrower and no taller than this one, because the shorter wall still limits it. So the shorter wall can never do better, and you can discard it by moving its pointer inwards.

```python
@include code/ch06/p04_widest_reservoir.py::reservoir
```

**Complexity:** O(n) time, O(1) space.

> **Interviewer's View:** Many candidates guess the right pointer move. What distinguishes a strong answer is the one-sentence argument for *why* discarding the shorter wall is safe.

## 6.5 Merge Two Logs (Easy)

Two servers each produce a sorted list of event timestamps. Merge them into a single sorted list in O(m + n).

```
@include code/ch06/p05_merge_logs.examples.txt
```

**The idea.** Keep a pointer into each list, and repeatedly take the smaller of the two current items. When one list runs out, append the rest of the other. This is the merge step of merge sort.

```python
@include code/ch06/p05_merge_logs.py::merge_logs
```

**Complexity:** O(m + n) time; O(m + n) space for the result. Calling `sorted(a + b)` also works, but is O(N log N) and ignores the fact that both inputs are already sorted, which is what the interviewer wants to see you use.

> **Follow-Up:** "Merge into the first list in place, if it has empty space at the end." Fill from the back: compare the largest remaining items and write them at the end, so nothing is overwritten before it is used.

## 6.6 Trapped Rain (Hard)

The heights of a row of blocks form a skyline. After heavy rain, water collects in the dips between taller blocks. How many units of water are trapped?

```
@include code/ch06/p06_trapped_rain.examples.txt
```

**Think first:** How much water sits on top of a single block?

**The key observation.** The water above block i is `min(tallest to its left, tallest to its right) - height[i]`, counting the block itself in both directions so the result is never negative.

**Brute force.** For each block, scan left and right for the tallest blocks: O(n²). An O(n) improvement precomputes two arrays of "tallest so far" from each side, using O(n) space.

```python
@include code/ch06/p06_trapped_rain.py::trapped_rain_brute
```

**The better idea.** Use two pointers and two running maxima. Whichever side currently has the lower block is the side we can settle: if `heights[left] < heights[right]`, there is a wall at least as tall as `heights[right]` on the right, so the water above `left` depends only on `left_max`.

```python
@include code/ch06/p06_trapped_rain.py::trapped_rain
```

**Complexity:** O(n) time, O(1) space.

> **Follow-Up:** The same skyline problem in two dimensions, with a grid of heights, needs a different idea: process cells from the lowest boundary inwards using a heap.

## Key Takeaways

- Two pointers from opposite ends work when you can always rule out one end; say *why* the move is safe.
- On sorted input, two pointers find pairs in O(n) without extra memory; fix one value to extend this to triples.
- Two pointers moving in the same direction merge sorted lists and filter in place.
- Hard problems such as trapped rain combine two pointers with running maxima.
