# Appendix A: Exercise Solutions

Here are worked solutions to every exercise. Each one was run on Python 3.12, 3.13, 3.14 and 3.15, and the output shown is the output it produced. Most solutions also check themselves on a few examples; the bigger ones are tested in the book's repository against a brute force, as in the chapters. There's usually more than one good answer: if yours gives the same results and you can explain its cost, it's right. The same files are in the repository as `solution_1.py`, `solution_2.py` and so on, in each chapter's folder.

## Chapter 2: Setting Up

**Exercise 1: Smallest and largest.**

```python
@include code/ch02/solution_1.py
```

```
@include code/ch02/solution_1.out
```

**Exercise 2: A bug the tests catch.**

```python
@include code/ch02/solution_2.py
```

```
@include code/ch02/solution_2.out
```

## Chapter 3: Measuring Speed: Big O You Can See

**Exercise 1: Count the steps.**

```python
@include code/ch03/solution_1.py
```

```
@include code/ch03/solution_1.out
```

**Exercise 2: Read a benchmark.**

```python
@include code/ch03/solution_2.py
```

```
@include code/ch03/solution_2.out
```

Ratios near 4 per doubling mean O(n²); ratios a little above 2 mean O(n) or O(n log n), and timings alone can't tell those two apart. Each doubling multiplies the time by the ratio again, so three more doublings multiply it by the ratio cubed.

## Chapter 4: Python's Built-ins Under the Hood

**Exercise 1: Membership in a loop.**

```python
@include code/ch04/solution_1.py
```

```
@include code/ch04/solution_1.out
```

**Exercise 2: When does the list grow?**

```python
@include code/ch04/solution_2.py
```

```
@include code/ch04/solution_2.out
```

## Chapter 5: Recursion and the Call Stack

**Exercise 1: Power.**

```python
@include code/ch05/solution_1.py
```

```
@include code/ch05/solution_1.out
```

**Exercise 2: Count the ways.**

```python
@include code/ch05/solution_2.py
```

```
@include code/ch05/solution_2.out
```

## Chapter 6: A Dynamic Array

**Exercise 1: extend.**

```python
@include code/ch06/solution_1.py
```

```
@include code/ch06/solution_1.out
```

**Exercise 2: Why a quarter?**

```python
@include code/ch06/solution_2.py
```

```
@include code/ch06/solution_2.out
```

Shrinking at half full makes the array thrash: one append at the boundary doubles it, the next pop halves it again, and every step copies all the items. Shrinking at a quarter full leaves room on both sides of every resize, so the cost stays amortized O(1).

**Exercise 3: remove.**

```python
@include code/ch06/solution_3.py
```

```
@include code/ch06/solution_3.out
```

## Chapter 7: Linked Lists

**Exercise 1: k-th from the end.**

```python
@include code/ch07/solution_1.py
```

```
@include code/ch07/solution_1.out
```

**Exercise 2: Palindrome.**

```python
@include code/ch07/solution_2.py
```

```
@include code/ch07/solution_2.out
```

**Exercise 3: Where does the cycle start?**

```python
@include code/ch07/solution_3.py
```

```
@include code/ch07/solution_3.out
```

## Chapter 8: Stacks and Queues

**Exercise 1: Min stack.**

```python
@include code/ch08/solution_1.py
```

```
@include code/ch08/solution_1.out
```

**Exercise 2: Reverse Polish notation.**

```python
@include code/ch08/solution_2.py
```

```
@include code/ch08/solution_2.out
```

**Exercise 3: Next greater element.**

```python
@include code/ch08/solution_3.py
```

```
@include code/ch08/solution_3.out
```

## Chapter 9: Hash Tables

**Exercise 1: A hashable Point.**

```python
@include code/ch09/solution_1.py
```

```
@include code/ch09/solution_1.out
```

**Exercise 2: Word counts.**

```python
@include code/ch09/solution_2.py
```

```
@include code/ch09/solution_2.out
```

**Exercise 3: Why tombstones?**

```python
@include code/ch09/solution_3.py
```

```
@include code/ch09/solution_3.out
```

Key 16 was placed past the deleted key because its probe sequence ran through that slot. Emptying the slot ends the probe sequence early, so the search stops before reaching 16. A tombstone tells searches to keep going while still letting inserts reuse the slot.

## Chapter 10: Binary Search

**Exercise 1: First and last.**

```python
@include code/ch10/solution_1.py
```

```
@include code/ch10/solution_1.out
```

**Exercise 2: Rotated list.**

```python
@include code/ch10/solution_2.py
```

```
@include code/ch10/solution_2.out
```

**Exercise 3: Integer square root.**

```python
@include code/ch10/solution_3.py
```

```
@include code/ch10/solution_3.out
```

## Chapter 11: Simple Sorts

**Exercise 1: Count inversions.**

```python
@include code/ch11/solution_1.py
```

```
@include code/ch11/solution_1.out
```

**Exercise 2: Two keys.**

```python
@include code/ch11/solution_2.py
```

```
@include code/ch11/solution_2.out
```

## Chapter 12: Merge Sort and Quicksort

**Exercise 1: Count inversions fast.**

```python
@include code/ch12/solution_1.py
```

```
@include code/ch12/solution_1.out
```

**Exercise 2: Quickselect.**

```python
@include code/ch12/solution_2.py
```

```
@include code/ch12/solution_2.out
```

**Exercise 3: Sort colors.**

```python
@include code/ch12/solution_3.py
```

```
@include code/ch12/solution_3.out
```

## Chapter 13: Heaps and Priority Queues

**Exercise 1: Heapsort.**

```python
@include code/ch13/solution_1.py
```

```
@include code/ch13/solution_1.out
```

**Exercise 2: k closest points.**

```python
@include code/ch13/solution_2.py
```

```
@include code/ch13/solution_2.out
```

**Exercise 3: Merge k sorted lists.**

```python
@include code/ch13/solution_3.py
```

```
@include code/ch13/solution_3.out
```

## Chapter 14: Sorting Without Comparing

**Exercise 1: Sort by age.**

```python
@include code/ch14/solution_1.py
```

```
@include code/ch14/solution_1.out
```

**Exercise 2: Bucket sort.**

```python
@include code/ch14/solution_2.py
```

```
@include code/ch14/solution_2.out
```

## Chapter 15: Binary Trees

**Exercise 1: Mirror.**

```python
@include code/ch15/solution_1.py
```

```
@include code/ch15/solution_1.out
```

**Exercise 2: Diameter.**

```python
@include code/ch15/solution_2.py
```

```
@include code/ch15/solution_2.out
```

**Exercise 3: Lowest common ancestor.**

```python
@include code/ch15/solution_3.py
```

```
@include code/ch15/solution_3.out
```

## Chapter 16: Binary Search Trees

**Exercise 1: Is it a BST?**

```python
@include code/ch16/solution_1.py
```

```
@include code/ch16/solution_1.out
```

**Exercise 2: Range query.**

```python
@include code/ch16/solution_2.py
```

```
@include code/ch16/solution_2.out
```

**Exercise 3: k-th smallest.**

```python
@include code/ch16/solution_3.py
```

```
@include code/ch16/solution_3.out
```

## Chapter 17: Balanced Trees: AVL

**Exercise 1: Counting rotations.**

```python
@include code/ch17/solution_1.py
```

```
@include code/ch17/solution_1.out
```

**Exercise 2: The skinniest AVL tree.**

```python
@include code/ch17/solution_2.py
```

```
@include code/ch17/solution_2.out
```

## Chapter 18: Tries

**Exercise 1: Longest common prefix.**

```python
@include code/ch18/solution_1.py
```

```
@include code/ch18/solution_1.out
```

**Exercise 2: Wildcards.**

```python
@include code/ch18/solution_2.py
```

```
@include code/ch18/solution_2.out
```

## Chapter 19: Union-Find

**Exercise 1: The redundant cable.**

```python
@include code/ch19/solution_1.py
```

```
@include code/ch19/solution_1.out
```

**Exercise 2: When did everyone connect?**

```python
@include code/ch19/solution_2.py
```

```
@include code/ch19/solution_2.out
```

## Chapter 20: Graphs

**Exercise 1: Degrees.**

```python
@include code/ch20/solution_1.py
```

```
@include code/ch20/solution_1.out
```

**Exercise 2: The town judge.**

```python
@include code/ch20/solution_2.py
```

```
@include code/ch20/solution_2.out
```

**Exercise 3: Reverse the edges.**

```python
@include code/ch20/solution_3.py
```

```
@include code/ch20/solution_3.out
```

## Chapter 21: Breadth-First and Depth-First Search

**Exercise 1: A cycle in an undirected graph.**

```python
@include code/ch21/solution_1.py
```

```
@include code/ch21/solution_1.out
```

**Exercise 2: Two teams.**

```python
@include code/ch21/solution_2.py
```

```
@include code/ch21/solution_2.out
```

## Chapter 22: Shortest Paths

**Exercise 1: Network delay.**

```python
@include code/ch22/solution_1.py
```

```
@include code/ch22/solution_1.out
```

**Exercise 2: Cheapest flight with at most k stops.**

```python
@include code/ch22/solution_2.py
```

```
@include code/ch22/solution_2.out
```

## Chapter 23: Minimum Spanning Trees

**Exercise 1: Connect the points.**

```python
@include code/ch23/solution_1.py
```

```
@include code/ch23/solution_1.out
```

**Exercise 2: Maximum spanning tree.**

```python
@include code/ch23/solution_2.py
```

```
@include code/ch23/solution_2.out
```

## Chapter 24: Solving a Problem in an Interview

**Exercise 1: Two sum on a stream.**

```python
@include code/ch24/solution_1.py
```

```
@include code/ch24/solution_1.out
```

## Chapter 25: Two Pointers

**Exercise 1: Sorted squares.**

```python
@include code/ch25/solution_1.py
```

```
@include code/ch25/solution_1.out
```

**Exercise 2: Trapping rain water.**

```python
@include code/ch25/solution_2.py
```

```
@include code/ch25/solution_2.out
```

**Exercise 3: Subsequence.**

```python
@include code/ch25/solution_3.py
```

```
@include code/ch25/solution_3.out
```

## Chapter 26: Sliding Window

**Exercise 1: An anagram in the text.**

```python
@include code/ch26/solution_1.py
```

```
@include code/ch26/solution_1.out
```

**Exercise 2: Two kinds of fruit.**

```python
@include code/ch26/solution_2.py
```

```
@include code/ch26/solution_2.out
```

**Exercise 3: Longest run of ones.**

```python
@include code/ch26/solution_3.py
```

```
@include code/ch26/solution_3.out
```

## Chapter 27: Hash Maps and Prefix Sums

**Exercise 1: A nearby duplicate.**

```python
@include code/ch27/solution_1.py
```

```
@include code/ch27/solution_1.out
```

**Exercise 2: Product of all the others.**

```python
@include code/ch27/solution_2.py
```

```
@include code/ch27/solution_2.out
```

**Exercise 3: Top k words.**

```python
@include code/ch27/solution_3.py
```

```
@include code/ch27/solution_3.out
```

## Chapter 28: BFS and DFS on Grids and Implicit Graphs

**Exercise 1: The largest island.**

```python
@include code/ch28/solution_1.py
```

```
@include code/ch28/solution_1.out
```

**Exercise 2: Distance to the nearest exit.**

```python
@include code/ch28/solution_2.py
```

```
@include code/ch28/solution_2.out
```

**Exercise 3: Knight moves.**

```python
@include code/ch28/solution_3.py
```

```
@include code/ch28/solution_3.out
```

## Chapter 29: Dynamic Programming I: Memoization and Tables

**Exercise 1: Decode ways.**

```python
@include code/ch29/solution_1.py
```

```
@include code/ch29/solution_1.out
```

**Exercise 2: Paths with obstacles.**

```python
@include code/ch29/solution_2.py
```

```
@include code/ch29/solution_2.out
```

**Exercise 3: The cheapest climb.**

```python
@include code/ch29/solution_3.py
```

```
@include code/ch29/solution_3.out
```

## Chapter 30: Dynamic Programming II: Sequences, Strings and Knapsack

**Exercise 1: Maximum run sum.**

```python
@include code/ch30/solution_1.py
```

```
@include code/ch30/solution_1.out
```

**Exercise 2: Word break.**

```python
@include code/ch30/solution_2.py
```

```
@include code/ch30/solution_2.out
```

**Exercise 3: Equal halves.**

```python
@include code/ch30/solution_3.py
```

```
@include code/ch30/solution_3.out
```

## Chapter 31: Greedy Algorithms and Backtracking

**Exercise 1: Balanced brackets.**

```python
@include code/ch31/solution_1.py
```

```
@include code/ch31/solution_1.out
```

**Exercise 2: A small sudoku.**

```python
@include code/ch31/solution_2.py
```

```
@include code/ch31/solution_2.out
```

## Chapter 32: Project: An LRU Cache

**Exercise 1: The short version.**

```python
@include code/ch32/solution_1.py
```

```
@include code/ch32/solution_1.out
```

**Exercise 2: Entries that expire.**

```python
@include code/ch32/solution_2.py
```

```
@include code/ch32/solution_2.out
```
