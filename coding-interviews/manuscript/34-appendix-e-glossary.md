# Appendix E: Glossary

**Adjacency list.** A graph representation that maps each node to the list of its neighbours (Chapter 16).

**Amortized cost.** The average cost per operation over a long sequence, even if a single operation is occasionally expensive; appending to a Python list is amortized O(1) (Chapter 3).

**Backtracking.** Building candidates one choice at a time, exploring each choice fully, then undoing it to try the next (Chapter 15).

**Bar Raiser.** At Amazon, an interviewer from outside the hiring team who helps maintain the hiring standard (Chapter 1).

**Base case.** The smallest input of a recursive function or DP, whose answer is known directly.

**Bellman-Ford.** A shortest-path algorithm that relaxes every edge in rounds; it handles negative weights and "at most k steps" limits (Chapter 17).

**BFS (breadth-first search).** Exploring a graph in order of distance from the start, using a queue; finds shortest paths when every step costs the same (Chapter 16).

**Big-O notation.** A description of how the time or memory an algorithm needs grows with the input size, ignoring constant factors (Chapter 3).

**Binary search.** Finding a value or boundary in a sorted range by repeatedly halving it (Chapter 10).

**Binary search tree (BST).** A binary tree in which every node's left subtree holds smaller values and its right subtree larger values (Chapter 12).

**Bipartite graph.** A graph whose nodes can be split into two groups with every edge between the groups; equivalently, two-colourable (Chapter 16).

**Brute force.** The straightforward solution that tries every possibility; the usual starting point in an interview (Chapter 2).

**Cache.** A fast store of recently or frequently used data, such as an LRU cache (Chapters 22 and 25).

**CAP theorem.** In a distributed store, during a network partition you must choose between consistency and availability (Chapter 25).

**Dijkstra's algorithm.** A shortest-path algorithm for non-negative edge weights that always expands the closest unsettled node, using a heap (Chapter 17).

**DFS (depth-first search).** Exploring a graph by going as deep as possible before backtracking, using recursion or a stack (Chapter 16).

**Dynamic programming (DP).** Solving a problem by combining answers to overlapping smaller subproblems, each computed once (Chapters 18 and 19).

**Edge case.** An unusual input at the boundary of what's allowed: empty, one element, all equal, the maximum size.

**Eventual consistency.** A guarantee that replicas of data will agree after a delay, if no new writes arrive (Chapter 25).

**Greedy algorithm.** An algorithm that makes the locally best choice at each step; correct only when that choice is provably safe (Chapter 14).

**Hash map.** A structure that maps keys to values with O(1) average lookup; Python's `dict` (Chapter 5).

**Heap.** A tree-shaped structure, stored in a list, that gives the smallest (or largest) item in O(1) and updates in O(log n) (Chapter 13).

**Idempotent.** An operation that has the same effect whether it's applied once or several times (Chapter 25).

**In-order traversal.** Visiting a binary tree's left subtree, then the node, then the right subtree; yields a BST's values in sorted order (Chapter 12).

**Invariant.** A condition that stays true throughout a loop or data structure, such as "the window never contains a repeated character".

**KMP (Knuth-Morris-Pratt).** A linear-time string-search algorithm that never re-reads the text (Chapter 20).

**Load balancer.** A component that spreads incoming requests across several servers (Chapter 25).

**Loop (interview loop).** The set of interviews, often four to six, that a candidate takes after passing the screening stages (Chapter 1).

**LRU (least recently used).** An eviction policy that removes the item unused for the longest time (Chapter 22).

**Memoization.** Caching the results of a function so repeated calls with the same arguments are free; `functools.cache` in Python (Chapter 18).

**Minimum spanning tree.** The cheapest set of edges that connects all nodes of a graph (Chapter 17).

**Monotonic stack or deque.** A stack or deque whose items are kept in increasing or decreasing order, used for "next greater" and sliding-window maximum problems (Chapter 9).

**Online assessment (OA).** A timed, automatically graded coding test taken before live interviews (Chapter 27).

**Prefix sum.** A running total such that the sum of any block equals the difference of two prefix sums (Chapter 8).

**Pruning.** Skipping branches of a search that can't lead to a valid or better solution (Chapter 15).

**Rate limiter.** A component that limits how many requests a client can make in a period, such as a token bucket (Chapter 23).

**Recurrence.** An equation that defines a problem's answer in terms of answers to smaller instances (Chapter 18).

**Replication.** Keeping copies of data on several machines for availability and read scaling (Chapter 25).

**Sentinel node.** A dummy node at the start or end of a linked list that removes special cases (Chapters 11 and 22).

**Sharding.** Splitting data across machines by key (Chapter 25).

**Sliding window.** A block of consecutive items that moves through a sequence, updated incrementally (Chapter 7).

**Space complexity.** How the extra memory an algorithm uses grows with the input size (Chapter 3).

**STAR.** Situation, Task, Action, Result: a structure for answering behavioral questions (Chapter 26).

**State machine.** A model with a fixed set of states and allowed transitions between them (Chapter 23).

**Topological sort.** An ordering of a directed graph's nodes in which every edge points forward; exists only if there are no cycles (Chapter 17).

**Trie.** A tree that stores strings letter by letter, so words with a common prefix share a path (Chapter 20).

**Two pointers.** Two indexes moving through a sequence, from both ends or in the same direction, to avoid nested loops (Chapter 6).

**Union-find (disjoint set union).** A structure that tracks which items are connected and merges groups in nearly O(1) (Chapter 17).

**XOR.** The bitwise "exclusive or": 1 where exactly one of two bits is 1; `x ^ x == 0` (Chapter 21).
