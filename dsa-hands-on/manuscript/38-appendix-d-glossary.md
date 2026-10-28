# Appendix D: Glossary

**Adjacency list.** A graph representation that stores, for each vertex, the list (or set) of its neighbors (Chapter 20).

**Adjacency matrix.** A graph representation as a V × V table, with a mark where an edge exists (Chapter 20).

**Algorithm.** A precise, step-by-step method for solving a problem (Chapter 1).

**Amortized cost.** The cost of an operation averaged over a long sequence of operations, such as `append` on a dynamic array: O(1) amortized, although an occasional append copies everything (Chapter 6).

**AVL tree.** A binary search tree that keeps the heights of every node's two subtrees within one of each other, using rotations, so its height stays O(log n) (Chapter 17).

**Backtracking.** Building a solution one choice at a time, undoing each choice to try the next; pruning skips choices that can't succeed (Chapter 31).

**Balanced tree.** A tree whose height stays O(log n) as items are added and removed (Chapter 17).

**Base case.** The input a recursive function answers directly, without recursing (Chapter 5).

**BFS (breadth-first search).** Exploring a graph in rings around the start, using a queue; finds paths with the fewest edges (Chapters 21 and 28).

**Big O notation.** A description of how an algorithm's cost grows with the input size, ignoring constant factors: O(1), O(log n), O(n), O(n log n), O(n²) (Chapter 3).

**Binary heap.** A complete binary tree, stored in a list, in which every parent is no larger than its children (a min-heap); the smallest item is always at the root (Chapter 13).

**Binary search.** Finding an item in sorted data by halving the range at each step: O(log n) (Chapter 10).

**Binary search tree (BST).** A binary tree in which every node's left subtree holds smaller keys and its right subtree larger ones (Chapter 16).

**Bipartite graph.** A graph whose vertices split into two groups with every edge going between the groups (Chapter 21).

**Brute force.** A solution that tries every possibility; slow, but a reliable reference for testing (Chapter 24).

**Cache.** A store of recent results kept for fast reuse; an LRU cache evicts the least recently used entry when full (Chapter 32).

**Collision.** Two keys whose hashes lead to the same slot of a hash table (Chapter 9).

**Component (connected component).** A group of vertices that are all reachable from each other, and from no vertex outside the group (Chapters 19 and 21).

**Cycle.** A path in a graph that returns to its starting vertex (Chapters 20 and 21).

**DAG (directed acyclic graph).** A directed graph with no cycles; exactly the graphs that have a topological order (Chapters 20 and 21).

**DFS (depth-first search).** Exploring a graph by following one path as far as possible before backing up, using a stack (Chapters 21 and 28).

**Doubly linked list.** A linked list whose nodes link both to the next node and to the previous one (Chapter 7).

**Dynamic array.** An array that grows by allocating a bigger block and copying, with spare capacity; Python's `list` is one (Chapter 6).

**Dynamic programming (DP).** Solving a problem by building on stored answers to smaller, overlapping subproblems (Chapters 29 and 30).

**Edge.** A connection between two vertices of a graph; may be directed and may have a weight (Chapter 20).

**Exchange argument.** A proof that a greedy choice is safe: any best solution can be changed to include it without getting worse (Chapter 31).

**Geometric mean.** The n-th root of the product of n numbers; the right way to average ratios (Chapter 33).

**Graph.** A set of vertices joined by edges (Chapter 20).

**Greedy algorithm.** An algorithm that always takes the choice that looks best right now and never reconsiders (Chapter 31).

**Hash function.** A function that turns a key into a number, used to choose a slot in a hash table (Chapter 9).

**Hash table.** A structure that stores items in slots chosen by the hash of their key, for O(1) average lookups; Python's `dict` and `set` are hash tables (Chapter 9).

**Height (of a tree).** The number of edges on the longest path from the root down to a leaf (Chapter 15).

**In-degree.** The number of edges pointing into a vertex (Chapter 21).

**Implicit graph.** A graph whose edges are computed by a rule when needed rather than stored (Chapter 28).

**Invariant.** A condition that a structure or loop keeps true at every step, such as a binary search's range always containing the answer if it exists (Chapters 10 and 17).

**Linked list.** A sequence of nodes, each holding an item and a link to the next node (Chapter 7).

**Load factor.** The number of items in a hash table divided by the number of slots (Chapter 9).

**Memoization.** Caching a function's results by its arguments, so each subproblem is solved once (Chapters 5 and 29).

**Minimum spanning tree (MST).** The cheapest set of edges that connects all the vertices of a weighted graph (Chapter 23).

**Monotonic stack or deque.** A stack or deque kept in increasing or decreasing order, by discarding items that can never matter again (Chapters 8 and 26).

**Open addressing.** Handling collisions by probing other slots of the same table, rather than chaining lists (Chapter 9).

**Prefix sum.** The running total of a list; the sum of any range is the difference of two prefix sums (Chapter 27).

**Priority queue.** A collection that always hands out its smallest (or largest) item next; usually built on a heap (Chapter 13).

**Pruning.** Abandoning a branch of a search as soon as it can't lead to a solution (Chapter 31).

**Queue.** A first-in, first-out (FIFO) collection (Chapter 8).

**Recursion.** A function that solves a problem by calling itself on smaller inputs (Chapter 5).

**Relaxation.** Improving a vertex's best known distance by going through a neighbor (Chapter 22).

**Rotation.** A local rearrangement of three nodes and their subtrees that rebalances a binary search tree while keeping its order (Chapter 17).

**Sentinel.** A dummy node that removes special cases at the ends of a linked list (Chapters 7 and 32).

**Sliding window.** A range of a sequence that moves along it, adding items on one side and dropping them on the other (Chapter 26).

**Stable sort.** A sort that keeps items with equal keys in their original order (Chapter 11).

**Stack.** A last-in, first-out (LIFO) collection (Chapter 8).

**Stress test.** Comparing a solution with a brute force on many random inputs (Chapter 24).

**Tombstone.** A marker left in an open-addressing hash table where an item was deleted, so that searches continue past it (Chapter 9).

**Topological order.** An ordering of a directed graph's vertices in which every edge points forward (Chapter 21).

**Trie.** A tree of characters in which each path from the root spells a prefix; finds words and prefixes in time proportional to their length (Chapter 18).

**Two pointers.** Two indexes that move through a sequence in one pass, replacing a search over all pairs (Chapter 25).

**Union-find (disjoint set union).** A structure that tracks which items are in the same group, with nearly O(1) union and find (Chapter 19).

**Vertex (node).** A point in a graph (Chapter 20).
