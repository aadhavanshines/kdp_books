# Chapter 21: Breadth-First and Depth-First Search

Almost every graph algorithm starts by exploring: starting from one vertex, visit everything reachable from it. There are two fundamental ways to explore, and the difference between them is the difference between a queue and a stack. **Breadth-first search** (BFS) visits vertices in rings: first the start, then everything one edge away, then everything two edges away. **Depth-first search** (DFS) plunges as far as it can down one path, then backs up and tries the next. This chapter builds both, and uses them to find shortest paths, connected components, an order for tasks with prerequisites, and whether a graph can be split in two.

The graphs here are plain dictionaries mapping each vertex to a list of its neighbors, as described in Chapter 20.

## Breadth-First Search

```python
@include code/ch21/search.py#L1-L33
```

BFS keeps a queue of discovered vertices waiting to be explored. Taking from the front of the queue means vertices are explored in the order they were discovered, so all vertices at distance 1 are explored before any at distance 2, and so on. The first time BFS reaches a vertex, it has found a path with the fewest possible edges, so it records the distance and the **parent**: the vertex it came from. Each vertex is queued once and each edge examined once (twice in an undirected graph): **O(V + E)**.

The parents form a tree, the **BFS tree**, and following parents back from any vertex traces a shortest path to the start. `shortest_path` does exactly that, then reverses the list.

```python
@include code/ch21/route_demo.py
```

```
@include code/ch21/route_demo.out
```

The route from Harbor to Stadium changes from the Red line to the Green line at Market, then to the Blue line at Museum. BFS counts stops, not distances; Chapter 22 handles weighted edges.

## Depth-First Search

```python
@include code/ch21/search.py#L36-L59
```

DFS replaces the queue with a stack. Taking the most recently discovered vertex first means following one path as deep as possible before backing up. Neighbors are pushed in reverse so that the first neighbor is explored first, the same order a recursive DFS would use. A vertex can be pushed more than once (by different neighbors) before it's visited, so `dfs` checks `seen` when it pops. Also O(V + E).

DFS is the natural tool for exploring everything: `components` runs a DFS from each vertex not yet seen, and each run collects one connected component. BFS would work just as well here; what matters is visiting everything reachable.

> **Tip:** DFS is often written recursively, and it's elegant. But a DFS can go as deep as the graph has vertices, which in Python means a `RecursionError` on any large graph. Chapter 28 shows it happen on a 100 × 100 grid. Use the explicit stack.

## Ordering Tasks: Topological Sort

Some things must happen before others: you must take Data Structures before Algorithms, install a library before the program that needs it, compile a file before linking. In a directed graph where an edge A → B means "A comes before B", a **topological order** lists every vertex so that every edge points forward. One exists exactly when the graph has no cycles.

```python
@include code/ch21/search.py#L62-L78
```

This is **Kahn's algorithm**. A vertex's **in-degree** counts the edges pointing into it: the things that must come before it. Vertices with in-degree 0 can go first. Each time one is placed, its outgoing edges are crossed off, lowering its neighbors' in-degrees; any that reach 0 are ready. If the vertices run out before all are placed, the remaining ones wait on each other in a cycle, and there's no valid order.

```python
@include code/ch21/course_order.py
```

```
@include code/ch21/course_order.out
```

Once Machine Learning becomes a prerequisite of Python, the courses form a cycle (Python → Data Structures → Algorithms → Machine Learning → Python), and no order exists.

> **Real-World Use:** Python's standard library includes this algorithm as `graphlib.TopologicalSorter` (Python 3.9 and later). Note the direction: you give it, for each node, the nodes it *depends on*, and it returns an order where every node comes after its dependencies.

```
>>> from graphlib import TopologicalSorter
>>> deps = {"app": {"lib", "utils"}, "lib": {"utils"}, "utils": set()}
>>> list(TopologicalSorter(deps).static_order())
['utils', 'lib', 'app']
```

Build tools, package managers and task schedulers all order their work this way.

## Two Colors

Can a graph's vertices be split into two groups so that every edge goes between the groups, never within one? Such a graph is **bipartite**. Two-color it with BFS: color the start 0, its neighbors 1, their neighbors 0, and so on; if an edge ever joins two vertices of the same color, it's impossible.

```python
@include code/ch21/search.py#L81-L98
```

A square can be two-colored; a triangle can't: an odd cycle always forces a clash. Exercise 2 uses this to split people who dislike each other into two teams.

## Testing

```python
@include code/ch21/test_search.py
```

```
@include code/ch21/test_search.out
```

The tests compare with slow but obviously correct methods. BFS distances are checked against repeatedly relaxing every edge until nothing improves. Topological sort is checked against brute force: for small random directed graphs, try *every* ordering of the vertices; a valid one exists exactly when Kahn's algorithm finds one.

## Timing BFS: When Does the Queue Matter?

BFS needs a queue. Chapter 8 showed that `list.pop(0)` makes a list a slow queue. Does it matter here?

```python
@include code/ch21/bench_bfs.py
```

```
@include code/ch21/bench_bfs.out
```

On the grid, the sizes grow by four times per row and the times grow roughly in step: O(V + E). And surprisingly, `list.pop(0)` is no slower than `deque`. The queue only ever holds the current frontier of the search, a diagonal band of a few hundred cells, and shifting a few hundred references is nearly free.

On the star, where one center vertex is joined to every other, all n leaves enter the queue at once. Now each `pop(0)` shifts up to n items, and the list version is quadratic: at 80,000 leaves it takes about 300 times longer than `deque`. The lesson is the one from Chapter 8, with a refinement: a slow operation only hurts when the structure it works on gets big. Since you rarely know in advance how big a BFS queue will get, use `deque`.

## Key Takeaways

- BFS explores in rings using a queue; the first visit to each vertex is along a path with the fewest edges.
- DFS explores deep first using a stack; it's the natural way to explore everything reachable.
- Both are O(V + E). Write DFS with an explicit stack in Python to avoid the recursion limit.
- Kahn's algorithm finds a topological order of a DAG by repeatedly taking vertices with in-degree 0, and detects cycles.
- A graph is bipartite exactly when BFS can two-color it without a clash.

## Exercises

1. **A cycle in an undirected graph.** Detect it with DFS: a visited neighbor that isn't the vertex you came from closes a loop.
2. **Two teams.** Given pairs of people who dislike each other, split everyone into two teams with no disliking pair on the same team, or report that it's impossible.
