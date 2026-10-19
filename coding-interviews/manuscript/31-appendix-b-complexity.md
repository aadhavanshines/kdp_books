# Appendix B: Complexity Reference

## Python Built-In Operations

Average-case costs for CPython. n is the number of items in the container, k the size of the argument or slice.

| Operation | list | dict | set | deque |
| --- | --- | --- | --- | --- |
| Index `x[i]` | O(1) | | | O(n) |
| Look up `x in c` | O(n) | O(1) | O(1) | O(n) |
| Get by key `d[k]` | | O(1) | | |
| Append at the end | O(1) amortized | O(1) | O(1) | O(1) |
| Pop from the end | O(1) | | | O(1) |
| Insert or pop at the front | O(n) | | | O(1) |
| Insert or delete in the middle | O(n) | O(1) by key | O(1) | O(n) |
| Slice `x[a:b]` | O(k) | | | |
| Copy | O(n) | O(n) | O(n) | O(n) |
| Sort `sorted(x)` | O(n log n) | | | |
| Min or max | O(n) | O(n) | O(n) | O(n) |
| Length `len(x)` | O(1) | O(1) | O(1) | O(1) |

| Other operations | Cost |
| --- | --- |
| `heapq.heappush`, `heapq.heappop` | O(log n) |
| `heapq.heapify` | O(n) |
| `heapq.nsmallest(k, x)` | O(n log k) |
| `bisect.bisect_left` on a sorted list | O(log n) |
| `bisect.insort` | O(n), because of the insertion |
| `Counter(x)` | O(n) |
| String concatenation `s + t` | O(len(s) + len(t)) |
| `"".join(parts)` | O(total length) |
| `s in t` for strings | O(len(s) × len(t)) worst case, usually much faster |
| Set union `a \| b` | O(len(a) + len(b)) |
| Set intersection `a & b` | O(min(len(a), len(b))) on average |

> **Warning:** Building a string with `s += ch` in a loop can be O(n²) in the worst case. Collect pieces in a list and `"".join` them.

## Algorithms

| Algorithm | Time | Space |
| --- | --- | --- |
| Binary search | O(log n) | O(1) |
| Sorting (Timsort, merge sort, heap sort) | O(n log n) | O(n) for Timsort and merge sort |
| Quickselect (k-th element) | O(n) average, O(n²) worst | O(1) |
| Counting or bucket sort, keys up to K | O(n + K) | O(n + K) |
| BFS, DFS | O(V + E) | O(V) |
| Topological sort | O(V + E) | O(V) |
| Dijkstra with a binary heap | O(E log V) | O(V + E) |
| Bellman-Ford | O(V × E) | O(V) |
| Prim / Kruskal | O(E log V) | O(V + E) |
| Union-find with path compression and union by size | nearly O(1) per operation | O(V) |
| KMP string search | O(n + m) | O(m) |
| Sieve of Eratosthenes | O(n log log n) | O(n) |
| Fast power | O(log exponent) | O(1) |

## Input Size to Target Complexity

A rough guide for Python, assuming about a second of run time (Chapter 3):

| n up to about | Acceptable complexity |
| --- | --- |
| 10 to 12 | O(n!) |
| 20 to 25 | O(2ⁿ) |
| 500 | O(n³) |
| 5,000 | O(n²) |
| 10⁶ | O(n log n) or O(n) |
| 10⁹ and above | O(log n) or O(1) |

## Growth at a Glance

| n | log₂ n | n log₂ n | n² | 2ⁿ |
| --- | --- | --- | --- | --- |
| 10 | about 3 | about 33 | 100 | 1,024 |
| 100 | about 7 | about 664 | 10,000 | about 1.3 × 10³⁰ |
| 1,000 | about 10 | about 10,000 | 1,000,000 | far too many |
| 1,000,000 | about 20 | about 20,000,000 | 10¹² | far too many |
