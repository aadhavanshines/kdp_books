# Chapter 25: Two Pointers

Many problems on arrays and strings have a brute-force solution that looks at every pair of positions: O(n²). The **two-pointer** pattern replaces the pairs with two indexes that each move in one direction only, so the whole job is one pass: O(n). The trick is always the same: find a reason why, at each step, one of the pointers can safely move, because the positions it skips can't be part of the answer.

There are two main shapes. **Opposite ends**: one pointer starts at the left, one at the right, and they move toward each other. **Same direction**: a slow pointer and a fast pointer move left to right, with the fast one reading and the slow one writing. You've already met a third, fast and slow pointers on a linked list, in Chapter 7.

## Pair Sum in a Sorted List

```python
@include code/ch25/two_pointers.py#L6-L17
```

The list is sorted. Start with the smallest and largest numbers. If their sum is too small, the left number is too small to pair with *anything*, since the right number is already the biggest available, so move `lo` right. If it's too big, the right number is too big for anything, so move `hi` left. Each step rules out one number for good, so it takes at most n steps.

## Writing in Place: Same-Direction Pointers

```python
@include code/ch25/two_pointers.py#L20-L29
```

To remove duplicates from a sorted list without a second list, `read` scans every position while `write` marks where the next kept value goes. A value is kept when it differs from the one before it. `write` never passes `read`, so nothing unread is ever overwritten. The same shape moves all the zeros to the end:

```python
@include code/ch25/two_pointers.py#L83-L89
```

## Palindromes, Ignoring Punctuation

```python
@include code/ch25/two_pointers.py#L32-L44
```

Compare the outside characters and move inward, skipping anything that isn't a letter or digit. No need to build a cleaned-up copy of the string first.

## The Container With the Most Water

Vertical lines of given heights stand at positions 0, 1, 2, ...; any two lines and the ground form a container, holding water up to the shorter line. Which pair holds the most?

```python
@include code/ch25/two_pointers.py#L47-L58
```

Start with the widest container, the two ends. Every other container is narrower, so it can only hold more if it's taller. Moving the *taller* line inward can't help: the height is still limited by the shorter line, and the width shrinks. So move the shorter one. This is the subtle part of two-pointer problems: proving that the pointer you move can't have been part of a better answer.

## Three Sum

Find every distinct triple that adds up to zero. Brute force checks all n(n - 1)(n - 2)/6 triples: O(n³).

```python
@include code/ch25/two_pointers.py#L61-L80
```

Sort first. Then, for each number as the first of the triple, find pairs in the rest that sum to its negative with the opposite-ends technique. That's n passes of O(n): O(n²). Skipping equal values, both for the first number and after finding a triple, avoids reporting the same triple twice.

## Demos and Tests

```python
@include code/ch25/two_pointers_demo.py
```

```
@include code/ch25/two_pointers_demo.out
```

```python
@include code/ch25/test_two_pointers.py
```

```
@include code/ch25/test_two_pointers.out
```

Every function is stress tested against brute force on 2,000 random small lists: every pair for pair sum and the container, every triple (with `itertools.combinations`) for three sum. The small value range, -6 to 6, guarantees plenty of duplicates, which is where `three_sum`'s skipping logic could go wrong.

## Timing

```python
@include code/ch25/bench_three_sum.py
```

```
@include code/ch25/bench_three_sum.out
```

The brute force grows eightfold with each doubling: O(n³). Two pointers grow fourfold: O(n²). At 800 numbers, it's the difference between 7.5 seconds and about 20 milliseconds.

> **Interview Tip:** When a problem says "sorted", think two pointers or binary search. When it says "in place" or "O(1) extra memory", think a read pointer and a write pointer. When it's about pairs, consider sorting first: O(n log n) to sort is cheap next to O(n²).

## Key Takeaways

- Two pointers replace an O(n²) scan of pairs with one O(n) pass.
- Opposite-end pointers work on sorted data: each step rules out one item for good.
- Same-direction read and write pointers rewrite a list in place.
- The key to every two-pointer solution is the argument for why the skipped positions can't hold the answer.
- Three sum = sort + a two-pointer pair search for each first item: O(n²).

## Exercises

1. **Sorted squares.** Given a sorted list that may include negative numbers, return the squares in sorted order in O(n). (Hint: the largest square is at one of the ends; fill the answer from the back.)
2. **Trapping rain water.** Bars of given heights stand side by side; how much rain water is trapped between them? Solve it in O(n) time and O(1) extra memory with two pointers.
3. **Subsequence.** Is one string a subsequence of another (its letters appear in order, not necessarily together)?
