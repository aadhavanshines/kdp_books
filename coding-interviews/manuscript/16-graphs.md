# Chapter 16: Graphs: BFS and DFS

A graph is a set of nodes connected by edges: cities and roads, people and friendships, web pages and links, cells of a grid and their neighbours. Interview graph problems rarely say "graph"; recognizing one hidden in a grid, a word list or a set of rules is half the work. Once you see it, two searches cover most problems: **depth-first search** to explore everything connected, and **breadth-first search** to find shortest paths when every step costs the same.

## Representing a Graph

- An **adjacency list** maps each node to its neighbours: `graph[node] = [neighbour, ...]`. Build it from a list of edges with a loop. It is the right default.
- A **grid** is already a graph: each cell's neighbours are the cells up, down, left and right of it, which you compute on the fly.
- An **implicit graph** has nodes you generate as you go, such as all words one letter away from the current word (Problem 16.5).

## When to Use Which Search

- **DFS** (recursion or a stack): count or label connected regions, check whether something is reachable, detect cycles, check two-colourability.
- **BFS** (a queue): the **shortest path** in steps; anything spreading **in waves**, one step per minute; levels of distance.

Both visit each node and edge once: O(V + E) time. And both need a **visited set**, or a mark in the grid, to avoid going round in circles.

> **Warning:** Mark a node as visited when you *add* it to the BFS queue, not when you take it out. Otherwise the same node can be added many times before it's processed, which wastes time and, on large grids, memory.

## 16.1 Count Islands (Medium)

A map is a grid of "1" (land) and "0" (water). An island is a group of land cells connected up, down, left or right. How many islands are there?

```
@include code/ch16/p01_count_islands.examples.txt
```

**The idea.** Scan the grid. Each time you find unvisited land, that's a new island: count it, then "sink" all its connected land with a DFS, so it is never counted again.

```python
@include code/ch16/p01_count_islands.py::count_islands
```

**Complexity:** O(r × c) time; O(r × c) space for the copy and the recursion in the worst case. For very large grids, the BFS version in the code files avoids Python's recursion limit.

## 16.2 Paint Bucket (Easy)

Recolour the region of same-coloured cells containing a given cell, like the fill tool in a paint program.

```
@include code/ch16/p02_flood_fill.examples.txt
```

**The idea.** An iterative DFS with an explicit stack: recolour a cell if it has the old colour, then push its neighbours.

```python
@include code/ch16/p02_flood_fill.py::flood_fill
```

**Complexity:** O(r × c) time and space.

> **Common Mistake:** Forgetting the case where the new colour equals the old colour. The search then never stops, because recoloured cells still match. The early return handles it.

## 16.3 Warehouse Route (Medium)

A robot moves through a warehouse grid of open cells (0) and shelves (1), one step at a time up, down, left or right. What is the fewest number of steps from the top-left corner to the bottom-right corner? Return -1 if it is impossible.

```
@include code/ch16/p03_warehouse_route.examples.txt
```

**The idea.** BFS explores cells in order of distance: all cells one step away, then two, and so on. The first time it reaches the goal, that distance is the shortest.

```python
@include code/ch16/p03_warehouse_route.py::warehouse_route
```

**Complexity:** O(r × c) time and space.

> **Interviewer's View:** Why BFS and not DFS? Because DFS finds *a* path, not the shortest one. Saying this before coding shows you chose the algorithm deliberately.

## 16.4 Spreading Mould (Medium)

A tray holds bread: 0 is empty, 1 is fresh bread, 2 is mouldy bread. Every minute, mould spreads from each mouldy piece to fresh pieces next to it. How many minutes until no fresh bread is left? Return -1 if some bread can never go mouldy.

```
@include code/ch16/p04_spreading_mould.examples.txt
```

**Think first:** Mould starts in several places at once. How do you run BFS from many starting points?

**The idea.** A *multi-source* BFS: put every mouldy cell in the queue at time 0. The queue then processes the tray in waves, minute by minute. Count fresh pieces at the start, and check whether any are left at the end.

```python
@include code/ch16/p04_spreading_mould.py::spreading_mould
```

**Complexity:** O(r × c) time and space. A minute-by-minute simulation is simpler but O((r × c)²) in the worst case; the tests use it as a check.

## 16.5 Word Steps (Hard)

Change a start word into a goal word one letter at a time; every intermediate word must be in a dictionary. How many words are in the shortest such chain, including both ends? Return 0 if no chain exists.

```
@include code/ch16/p05_word_steps.examples.txt
```

**Think first:** What are the nodes and edges of this graph?

**The idea.** Words are nodes, and two words are connected if they differ in exactly one letter. Instead of comparing every pair of words, generate each word's neighbours directly: change each position to each letter of the alphabet, and keep the results that are in the dictionary. Then BFS from the start word.

```python
@include code/ch16/p05_word_steps.py::word_steps
```

**Complexity:** O(n × L × 26 × L) for n words of length L: each word generates 26L candidates, and building or hashing each takes O(L).

> **Follow-Up:** A *bidirectional* BFS from both ends, always expanding the smaller frontier, explores far fewer words on large dictionaries.

## 16.6 Two Teams (Medium)

People 0 to n-1 must be split into two teams, and certain pairs refuse to be on the same team. Is it possible?

```
@include code/ch16/p06_two_teams.examples.txt
```

**The idea.** This asks whether the graph is *bipartite*: two-colourable. Give the first person of each connected group team 0, and each rival the opposite team of the person who reached them. A conflict between two people on the same team means it's impossible, which happens exactly when the graph has a cycle of odd length.

```python
@include code/ch16/p06_two_teams.py::two_teams
```

**Complexity:** O(n + e) time and space.

## Key Takeaways

- Look for the hidden graph: grids, words, rules and dependencies are all graphs.
- DFS explores and labels connected regions; BFS finds shortest paths in unweighted graphs.
- Multi-source BFS models anything spreading from several places at once.
- Always track visited nodes, marking them when they are queued.
- Build neighbours on the fly when the graph is implicit.
