# Part V: Graphs

# Chapter 20: Graphs

A **graph** is a set of things, called **vertices** (or nodes), and connections between pairs of them, called **edges**. That's all, and it's enough to describe a remarkable range of things: road networks and airline routes, friendships and follower lists, web pages and their links, computers and cables, courses and their prerequisites, tasks and their dependencies, the states of a puzzle and the moves between them. Trees and linked lists are graphs too, with extra rules.

This chapter introduces the vocabulary and the ways to store a graph in memory. The next three chapters are about what you can compute on them.

## Words for Graphs

- In an **undirected** graph, an edge connects two vertices both ways, like a friendship or a two-way road. In a **directed** graph, each edge goes one way, like a follow, a link or a one-way street.
- In a **weighted** graph, each edge has a number: a distance, a cost, a travel time.
- Two vertices joined by an edge are **adjacent**, or **neighbors**. A vertex's **degree** is its number of edges; in a directed graph, its **out-degree** and **in-degree** count edges leaving and arriving.
- A **path** is a sequence of vertices, each joined to the next by an edge. A **cycle** is a path that returns to its start. A graph with no cycles that is directed is a **DAG**, a directed acyclic graph.
- A graph is **connected** if there's a path between every pair of vertices. The **connected components** are its maximal connected pieces.
- A graph with V vertices has at most about V² edges. One with far fewer, like a road network where each junction meets a handful of roads, is **sparse**; one close to the maximum is **dense**.

## Three Ways to Store a Graph

The same small graph, written down three ways:

```python
@include code/ch20/representations.py
```

```
@include code/ch20/representations.out
```

- An **edge list** is just the edges. It's the simplest, and the natural input format, but answering "who are B's neighbors?" means scanning every edge.
- An **adjacency list** maps each vertex to a list of its neighbors. Finding a vertex's neighbors is immediate, and it uses memory proportional to V + E.
- An **adjacency matrix** is a V × V grid with a 1 where an edge exists. Checking one edge is a single lookup, but it uses V² memory however few edges there are, and finding a vertex's neighbors means scanning a whole row.

For sparse graphs, which are most real graphs, the difference in memory is enormous:

```python
@include code/ch20/memory_sizes.py
```

```
@include code/ch20/memory_sizes.out
```

A road network with 100,000 junctions needs 400,000 adjacency-list entries, but a matrix of ten billion cells. Adjacency lists are the default; a matrix makes sense only for small or dense graphs.

## A Graph Class

```python
@include code/ch20/graph.py
```

This class stores an **adjacency map**: each vertex maps to a dictionary from neighbor to edge weight. It combines the best of both: neighbors are listed quickly, like an adjacency list, and `has_edge` is an O(1) dictionary lookup, like a matrix. An undirected edge is stored in both directions. `edges()` reports each undirected edge once, by remembering which ones it has already produced.

Many algorithms in the next chapters use a plain dictionary of lists, `{vertex: [neighbors]}`, or of dictionaries, `{vertex: {neighbor: weight}}`, instead of a class. It's the same structure without the methods, and it's what you'll write in an interview.

```python
@include code/ch20/test_graph.py
```

```
@include code/ch20/test_graph.out
```

## Checking an Edge

How long does "is there an edge from u to v?" take with each representation? Each vertex here has ten neighbors:

```python
@include code/ch20/bench_edge_query.py
```

```
@include code/ch20/bench_edge_query.out
```

All three are flat as the graph grows, because the number of neighbors per vertex stays at ten. The list version scans those ten, so it's slower; with vertices of very high degree it would grow. Sets and the matrix are single lookups. Choosing the representation is choosing which questions are cheap.

> **Real-World Use:** Graphs are often stored without being called graphs. A web crawler's frontier, a package manager's dependency list (each package lists what it needs: an adjacency list), the links in a spreadsheet's formulas, and the tables of who-follows-whom in a social network are all graphs held as some form of adjacency list. Python's standard library even includes a graph algorithm, in the `graphlib` module (Python 3.9 and later), which Chapter 21 uses.

## Key Takeaways

- A graph is vertices plus edges; edges can be directed or undirected, weighted or not.
- An adjacency list uses O(V + E) memory and lists neighbors quickly; it's the default for sparse graphs.
- An adjacency matrix checks any edge in O(1) but always uses O(V²) memory.
- A dictionary of neighbor dictionaries gives fast neighbor lists and O(1) edge checks.
- Most real graphs are sparse.

## Exercises

1. **Degrees.** For a directed graph, print each vertex's in-degree and out-degree.
2. **The town judge.** In a town of n people, the judge trusts nobody and is trusted by everybody else. Given who trusts whom, find the judge, or -1 if there isn't one.
3. **Reverse the edges.** Build the transpose of a directed graph, with every edge reversed, and use it to list, for each page of a small website, the pages that link to it.
