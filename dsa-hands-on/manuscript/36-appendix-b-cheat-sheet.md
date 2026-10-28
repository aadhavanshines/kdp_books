# Appendix B: Complexity Cheat Sheet

The costs of the structures and algorithms in this book, with a measured time from the book's benchmarks where there is one. The measurements come from one computer (Appendix C) on Python 3.15; yours will differ, but the ratios between rows, and how each row grows, should be similar. "Amortized" means averaged over a long sequence of operations; individual operations can occasionally cost more.

## Python's Built-In Structures

| Operation | Cost | Measured (Chapter) |
| --- | --- | --- |
| `list.append(x)`, `list.pop()` | O(1) amortized | about 0.11 µs for the pair, at any size (4) |
| `items[i]`, `items[i] = x` | O(1) | about 0.12 µs (4) |
| `list.insert(0, x)`, `list.pop(0)` | O(n) | 446 µs for the pair at 160,000 items (4) |
| `x in items` (list) | O(n) | 11.6 ms at 1,000,000 items (10) |
| `x in s`, `s.add(x)` (set) | O(1) average | about 0.13 µs for add and remove, at any size (4) |
| `d[key]`, `d[key] = value`, `del d[key]` | O(1) average | about 0.11 µs per get, at any size up to 1,000,000 (4) |
| `deque.append`, `appendleft`, `pop`, `popleft` | O(1) | about 0.11 µs at the front, at any size (7) |
| `heapq.heappush`, `heappop` | O(log n) | 7.5 ms for 80,000 pushes (13) |
| `heapq.heapify` | O(n) | 5.8 ms for 80,000 items (13) |
| `bisect.bisect_left` | O(log n) | 0.30 µs at 1,000,000 items (10) |
| `sorted()`, `list.sort()` | O(n log n); O(n) on sorted or nearly sorted data | 17.5 ms for 80,000 numbers (12) |
| Building a string with `+=` in a loop | O(n) total in CPython's best case, O(n²) when the string has another reference; `"".join` is always O(n) | 1.55 ms against 77.7 ms for 40,000 words; `join`, 0.20 ms (4) |

## The Structures You Built

| Structure | Main operations | Cost | Measured (Chapter) |
| --- | --- | --- | --- |
| Dynamic array | append | O(1) amortized | 13.1 ms for 80,000 appends, doubling (6) |
| Dynamic array, growing by a constant | append | O(n) per append | 1.08 s for 80,000 appends (6) |
| Singly linked list | add or remove at the front | O(1) | 0.31 µs (7) |
| Linked list | find, index | O(n) | (7) |
| Stack (list) | push, pop | O(1) amortized | (8) |
| Queue: `RingQueue`, `TwoStackQueue` | enqueue, dequeue | O(1) (amortized for two stacks) | 35 ms and 20 ms for 80,000 of each (8) |
| Hash table, chaining | get, set, delete | O(1) average | 0.27 µs per get at 1,000,000 keys (9) |
| Hash table, open addressing | get, set, delete | O(1) average | 0.36 µs per get at 1,000,000 keys (9) |
| Binary heap | push, pop | O(log n) | 38 ms for 80,000 pushes (13) |
| Binary heap | heapify | O(n) | 34 ms for 80,000 items (13) |
| Binary search tree | search, insert, delete | O(height): O(log n) random, O(n) sorted keys | 0.53 µs random, 148 µs sorted, at 4,000 keys (16) |
| AVL tree | search, insert, delete | O(log n) always | 21 ms to insert 4,000 sorted keys, against 589 ms for a plain BST (17) |
| Trie | insert, lookup, prefix check | O(length of the word) | 0.28 µs per prefix check at any size (18) |
| Union-find, with path compression and union by size | find, union | nearly O(1) amortized | 3.3 ms for a chain of 8,000 unions, then 8,000 finds (19) |
| LRU cache (dict + doubly linked list) | get, put | O(1) | 46 ms for 100,000 requests (32) |

## Sorting

| Algorithm | Best | Average | Worst | Extra memory | Stable | Measured at 80,000 (Chapter) |
| --- | --- | --- | --- | --- | --- | --- |
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No | (11) |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | Yes | (11) |
| Bubble sort | O(n) | O(n²) | O(n²) | O(1) | Yes | (11) |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | 179 ms (12) |
| Quicksort, random pivot | O(n log n) | O(n log n) | O(n²), very unlikely | O(log n) | No | 130 ms (12) |
| Heapsort | O(n log n) | O(n log n) | O(n log n) | O(1) in place (O(n) in Exercise 13.1) | No | (13) |
| Counting sort | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | 25 ms (14) |
| Radix sort | O(d(n + b)) | O(d(n + b)) | O(d(n + b)) | O(n + b) | Yes | 357 ms (14) |
| `sorted()` (Timsort/powersort) | O(n) | O(n log n) | O(n log n) | O(n) | Yes | 17.5 ms (12) |

Here k is the range of the keys, d the number of digits and b the base.

## Searching and Graphs

| Algorithm | Cost | Notes (Chapter) |
| --- | --- | --- |
| Binary search | O(log n) | sorted data; also "search the answer" (10) |
| BFS, DFS | O(V + E) | BFS: fewest edges; use `deque` as the queue (21) |
| Topological sort (Kahn) | O(V + E) | detects cycles; `graphlib` in the standard library (21) |
| Dijkstra with a heap | O(E log V) | non-negative weights only (22) |
| Bellman-Ford | O(V × E) | negative weights; detects negative cycles (22) |
| Floyd-Warshall | O(V³) | all pairs; used as the test reference (22) |
| Kruskal | O(E log E) | sort the edges, union-find (23) |
| Prim with a heap | O(E log V) | grows one tree (23) |
| Edge check: adjacency lists, sets, matrix | O(degree), O(1), O(1) | 0.18, 0.09 and 0.10 µs (20) |

## Interview Patterns

| Pattern | Typical cost | Signals (Chapter) |
| --- | --- | --- |
| Hash map lookups (two sum) | O(n) | pairs, "seen before", counting (24, 27) |
| Two pointers | O(n), or O(n log n) with a sort | sorted input, pairs, in place (25) |
| Sliding window | O(n) | contiguous, substring, longest or shortest run (26) |
| Prefix sums | O(n) to build, O(1) per range | range sums; with a hash map, counting runs (27) |
| Monotonic stack or deque | O(n) | next greater, window maximum (8, 26) |
| BFS on grids and implicit graphs | O(cells) or O(states) | fewest steps, spreading, flood fill (28) |
| Dynamic programming | O(states × choices) | how many ways, best total, overlapping subproblems (29, 30) |
| Greedy | usually O(n log n) for the sort | intervals, scheduling; needs a proof (31) |
| Backtracking | exponential, cut by pruning | all solutions, small n (31) |

## Input Size and the Complexity You Need

With a few seconds to spare, in Python:

| Largest n | Fast enough |
| --- | --- |
| about 10 to 20 | O(2ⁿ), O(n!) |
| about 500 | O(n³) |
| about 5,000 | O(n²) |
| 100,000 to 1,000,000 | O(n log n), O(n) |
| beyond | O(log n), O(1) |
