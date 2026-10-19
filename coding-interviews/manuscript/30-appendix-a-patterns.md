# Appendix A: Pattern Cheat Sheet

Use this table to go from the wording of a problem to a likely pattern. The signals are hints, not rules: always check that the pattern's requirements hold (sorted input, non-negative values, small limits).

| If the problem says or implies... | Try | Typical cost | Chapter |
| --- | --- | --- | --- |
| "Have I seen this before?", counts, pairs with a sum, grouping | Hash set or dictionary | O(n) | 5 |
| Sorted array, pair or triple with a target, palindrome, in-place | Two pointers from the ends or same direction | O(n) | 6 |
| Longest/shortest contiguous block with a property | Sliding window | O(n) | 7 |
| Many range-sum queries; subarrays summing to k | Prefix sums plus a dictionary | O(n) | 8 |
| Matching brackets, undo, "previous/next greater" | Stack; monotonic stack | O(n) | 9 |
| Sliding window maximum | Monotonic deque | O(n) | 9 |
| Sorted input; "smallest value such that..." | Binary search; binary search on the answer | O(log n) | 10 |
| Linked list cycle, middle, k-th from end | Fast and slow pointers | O(n) | 11 |
| Reverse or merge lists | Pointer rewiring with a dummy head | O(n) | 11 |
| Tree height, paths, validity | DFS recursion returning a value | O(n) | 12 |
| Tree levels | BFS with a queue, level by level | O(n) | 12 |
| Top k, k-th largest, merge k sorted | Heap of size k | O(n log k) | 13 |
| Running median | Two heaps | O(log n) per item | 13 |
| Overlapping intervals, meeting rooms | Sort by start (merge) or end (select); heap of ends | O(n log n) | 14 |
| "Can you reach...", "where to start" | Greedy with one running value | O(n) | 14 |
| All subsets, orders, combinations; small n | Backtracking | exponential | 15 |
| Grid regions, connected components | DFS or BFS flood fill | O(V + E) | 16 |
| Fewest steps, unweighted | BFS | O(V + E) | 16 |
| Spreading from several sources | Multi-source BFS | O(V + E) | 16 |
| Dependencies, ordering, cycle in directed graph | Topological sort | O(V + E) | 17 |
| "Already connected?", redundant edge | Union-find | nearly O(1) per operation | 17 |
| Cheapest path, non-negative weights | Dijkstra | O(E log V) | 17 |
| Cheapest path with at most k steps | Bellman-Ford, k rounds | O(k × E) | 17 |
| Connect everything at minimum cost | Minimum spanning tree | O(E log V) | 17 |
| Count ways, min/max over choices, overlapping subproblems | Dynamic programming | states × choices | 18, 19 |
| Two strings compared | 2D DP over prefixes | O(m × n) | 19 |
| Choose items under a capacity | Knapsack DP | O(n × capacity) | 19 |
| Many words, prefixes | Trie | O(length) per word | 20 |
| Pattern search in text | KMP (or built-in find) | O(n + m) | 20 |
| Pairs cancel, single missing value, powers of two | Bit manipulation, XOR | O(n) | 21 |
| O(1) get/put with eviction | Hash map plus linked list | O(1) | 22 |
| Parse, validate, aggregate messy input | Regex or explicit checks, dictionaries | O(input) | 23 |

## Questions to Ask Yourself When Stuck

1. What would the brute force be, and which part of it repeats work?
2. Would sorting the input help?
3. Would a dictionary remove an inner loop?
4. Is there a monotonic property I can binary search on?
5. Is this a graph in disguise? What are the nodes and edges?
6. Can I define the answer for a smaller input and build up (DP)?
7. What do the input limits allow? (Chapter 3)

## Templates to Know by Heart

- **Sliding window (variable):** expand right every step; while the window is invalid, shrink from the left; record the answer.
- **Binary search for the first "yes":** `lo, hi = low, high`; while `lo < hi`: `mid = (lo + hi) // 2`; if `ok(mid)`: `hi = mid`, else `lo = mid + 1`.
- **BFS:** queue with the start; mark visited when queued; pop, process, push unvisited neighbours.
- **Backtracking:** if complete, record a copy; for each choice, apply, recurse, undo.
- **DP:** state in words; recurrence; base cases; order (memoized recursion or a table).
