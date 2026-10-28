# Chapter 23: Minimum Spanning Trees

A company wants to connect six offices with fiber. Laying cable between some pairs of offices is possible, each at a known cost. What's the cheapest set of cables that connects every office to every other, directly or through others?

The answer is a **minimum spanning tree** (MST): a subset of the edges that connects all the vertices (spanning), has no cycles (a tree, since any cycle has a redundant edge), and has the smallest possible total weight. With V vertices, a spanning tree has exactly V - 1 edges. This chapter builds the two classic algorithms, Kruskal's and Prim's, and checks them against brute force.

## Kruskal's Algorithm

Kruskal's algorithm is greedy in the simplest possible way: go through the edges from lightest to heaviest, and take each one unless it would close a loop. Detecting loops is exactly what union-find (Chapter 19) does: an edge closes a loop when its two ends are already connected.

```python
@include code/ch23/mst.py#L1-L18
```

Sorting the edges dominates: **O(E log E)**. The union-find work is nearly linear. The chapter folder holds a copy of Chapter 19's `union_find.py`, so the code runs on its own.

## Prim's Algorithm

Prim's algorithm grows a single tree from a starting vertex. At each step it adds the lightest edge that leads from the tree to a vertex not yet in it. A heap holds the candidate edges:

```python
@include code/ch23/mst.py#L21-L36
```

It looks a lot like Dijkstra's algorithm, and it should: both grow a set of finished vertices using a heap. The difference is the priority. Dijkstra orders vertices by their total distance from the start; Prim orders them by the weight of the single edge that would attach them. As with Dijkstra, stale heap entries (edges to vertices already in the tree) are skipped when popped. **O(E log V)**.

## Why Greedy Works Here

Most greedy algorithms are wrong (Chapter 31 shows one that is). Why are these right? Because of the **cut property**: split the vertices into any two groups; the lightest edge crossing between the groups belongs to some minimum spanning tree. If an MST didn't use it, swapping it in for a heavier crossing edge on the same cycle would make a cheaper spanning tree. Kruskal's next edge and Prim's next edge are each the lightest edge across some split, so every choice is safe.

## The Fiber Network

```python
@include code/ch23/network_demo.py
```

```
@include code/ch23/network_demo.out
```

Five cables, the minimum for six offices, costing 30 of the 81 it would take to lay every possible cable. Prim's algorithm finds a tree with the same total. (When some edges have equal weights, there can be several different minimum spanning trees; the total weight is always the same.)

## Testing Against Brute Force

```python
@include code/ch23/test_mst.py
```

```
@include code/ch23/test_mst.out
```

For tiny graphs, try every set of V - 1 edges, keep those that form a spanning tree (union-find again: V - 1 edges with no loop), and find the minimum total. Both algorithms must produce valid spanning trees with exactly that total, on 150 random graphs, including graphs with several edges between the same pair of vertices.

## Timing

```python
@include code/ch23/bench_mst.py
```

```
@include code/ch23/bench_mst.out
```

Both grow a little faster than linearly, as O(E log E) and O(E log V) predict. Kruskal wins here, because its main cost is one call to `sorted()`, which runs in C; Prim does a heap operation in Python for every edge. On very dense graphs, a version of Prim's algorithm without a heap, which scans an array instead, takes O(V²), better than any edge-sorting approach (Exercise 1).

> **Interesting Fact:** The problem is older than computers. In 1926, Otakar Borůvka solved it to plan the most economical electrical network for the Moravia region of what's now the Czech Republic. Vojtěch Jarník published the algorithm now usually credited to Prim in 1930; Joseph Kruskal published his in 1956 and Robert Prim his in 1957, in a paper about telephone networks.

## Key Takeaways

- A minimum spanning tree connects all V vertices with V - 1 edges of minimum total weight.
- Kruskal: sort the edges, take each one that doesn't close a loop (union-find). O(E log E).
- Prim: grow one tree, always adding the lightest edge to a new vertex (a heap). O(E log V).
- Both are greedy, and both are correct because of the cut property.
- An MST minimizes the total weight; it does not give shortest paths between vertices (that's Chapter 22).

## Exercises

1. **Connect the points.** Points on a grid can be joined at a cost equal to their Manhattan distance, |x1 - x2| + |y1 - y2|. Find the minimum total cost to connect them all. Every pair can be joined, so the graph is dense: use Prim's algorithm with a plain array instead of a heap, in O(V²).
2. **Maximum spanning tree.** Find the spanning tree with the *largest* total weight, for example the strongest set of links in a network, by reusing `kruskal`.
