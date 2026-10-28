# Data Structures and Algorithms in Python, Hands-On

*Every Structure Built, Tested and Timed, with Interview Patterns, Exercises and Solutions*

The method in every chapter: **build** the structure from scratch in plain Python, **test** it (pytest, plus randomized tests that compare it with Python's built-ins), and **time** it with real benchmarks (doubling experiments, charts, and comparisons with the built-in alternative). Every listing is run on Python 3.12, 3.13, 3.14 and 3.15. Exercises end every chapter; Appendix A has tested solutions.

Reader: knows basic Python (functions, classes, lists, dicts). No math beyond school algebra; logarithms explained when needed.

## Part I: Foundations

1. Why Build It Yourself: the method; a first benchmark (`in` on a list vs a set)
2. Setting Up: Python versions, a virtual environment, pytest, running the book's code
3. Measuring Speed: Big O You Can See: `bench.py`, doubling experiments, log-log charts, best/worst/average, amortized cost
4. Python's Built-ins Under the Hood: list over-allocation, the cost of each list operation (measured), dict and set hashing, strings
5. Recursion and the Call Stack: base cases, the recursion limit, memoization, turning recursion into a loop

## Part II: Linear Structures

6. A Dynamic Array: capacity and growth, amortized append, growth factor experiment, insert and delete
7. Linked Lists: singly and doubly linked, sentinels, reversing, Floyd's cycle detection; when a linked list beats a list
8. Stacks and Queues: list stack, ring-buffer queue, deque; `list.pop(0)` timed; balanced brackets; monotonic stack
9. Hash Tables: separate chaining, open addressing with tombstones, resizing, load factor experiment, a hash flood

## Part III: Searching and Sorting

10. Binary Search: invariants, lower and upper bound, `bisect`, binary search on the answer
11. Simple Sorts: selection and insertion sort, stability, nearly sorted input
12. Merge Sort and Quicksort: divide and conquer, worst cases made visible, randomized and three-way partitions, against `sorted()`
13. Heaps and Priority Queues: a binary heap, heapify in linear time, heapsort, top-k, merging sorted lists, running median
14. Sorting Without Comparing: counting sort, radix sort, and why comparison sorts can't beat n log n

## Part IV: Trees

15. Binary Trees: nodes, traversals (recursive and iterative), level order, height
16. Binary Search Trees: search, insert, delete, in-order iteration; the sorted-input disaster
17. Balanced Trees (AVL): rotations, height guarantee tested, timed against the plain BST
18. Tries: prefix search and autocomplete
19. Union-Find: path compression and union by size, timed

## Part V: Graphs

20. Graphs: adjacency lists, matrices and edge lists
21. Breadth-First and Depth-First Search: shortest paths in unweighted graphs, components, cycles, topological sort, bipartite check
22. Shortest Paths: Dijkstra and Bellman-Ford
23. Minimum Spanning Trees: Kruskal and Prim

## Part VI: Interview Patterns

24. Solving a Problem in an Interview: a five-step method, recognizing patterns, brute force first
25. Two Pointers
26. Sliding Window
27. Hash Maps and Prefix Sums
28. BFS and DFS on Grids and Implicit Graphs
29. Dynamic Programming I: memoization and tables (Fibonacci, stairs, robber, coins)
30. Dynamic Programming II: sequences, strings and knapsack (LCS, edit distance, knapsack, LIS)
31. Greedy Algorithms and Backtracking

## Part VII: Putting It Together

32. Project: An LRU Cache (hash map plus doubly linked list), timed against `functools.lru_cache`
33. Is Python Getting Faster? The book's benchmarks on 3.12, 3.13, 3.14 and 3.15
34. Next Steps

## Appendices

- A. Exercise Solutions
- B. Complexity Cheat Sheet (with the book's measured results)
- C. How the Benchmarks Were Run
- D. Glossary
- About the Author; More Books by the Author
