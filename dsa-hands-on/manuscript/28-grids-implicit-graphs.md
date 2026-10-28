# Chapter 28: BFS and DFS on Grids and Implicit Graphs

Interview problems rarely say "here is a graph". They say "here is a map", "a maze", "a board", "a list of words". The graph is there, but you have to see it: the cells of a grid are vertices, and neighboring cells are joined by edges. Often the graph is never stored at all. Its edges are **implicit**, computed on the fly from a rule, such as "the cells up, down, left and right" or "the words one letter away". Then Chapter 21's BFS and DFS apply unchanged.

## A Grid Is a Graph

```python
@include code/ch28/grids.py#L7-L14
```

Each cell (r, c) has up to four neighbors. Instead of building adjacency lists, `neighbors` generates them, skipping any that fall off the edge. A grid with R rows and C columns has R × C vertices and fewer than 2 × R × C edges, so a full BFS or DFS of a grid is O(R × C).

## Counting Islands with DFS

```python
@include code/ch28/grids.py#L17-L33
```

An **island** is a group of `#` cells joined up, down, left or right. Scan the grid; each `#` cell not yet seen starts a new island, and a DFS from it marks the whole island as seen, so it's counted once. This is Chapter 21's `components`, with the edges computed instead of stored. Marking a cell as seen when it's *pushed*, not when it's popped, keeps any cell from entering the stack twice.

> **Real-World Use:** The paint-bucket tool in an image editor does exactly this. Clicking a pixel starts a **flood fill**: a search from that pixel through every neighboring pixel of the same color, all of which get the new color. Counting islands is a flood fill that counts how many times it had to start.

## The Shortest Way Through a Maze

```python
@include code/ch28/grids.py#L36-L52
```

BFS finds the route with the fewest steps, avoiding walls. The `parent` dictionary does double duty: it records how each cell was reached, and being in it means the cell has been seen.

```python
@include code/ch28/maze_demo.py
```

```
@include code/ch28/maze_demo.out
```

The `word_ladder` call in the demo is explained below.

## Multi-Source BFS

Every minute, rot spreads from each rotten orange to the fresh oranges next to it. How many minutes until none is fresh?

```python
@include code/ch28/grids.py#L55-L76
```

The trick is to start the BFS from *all* the rotten oranges at once: put every one of them in the queue at the start. BFS then works outward in rings from all of them together, and the ring number is the minute. Processing exactly `len(queue)` cells per round is how the code knows where one ring ends and the next begins. The same pattern finds the distance from every cell to its nearest exit, hospital or charging station: one BFS from all of them, not one BFS each (Exercise 2).

```python
@include code/ch28/rot_demo.py
```

```
@include code/ch28/rot_demo.out
```

## Implicit Graphs: The Word Ladder

Change "hit" into "cog" one letter at a time, where every step must be a real word. What's the fewest number of changes?

```python
@include code/ch28/grids.py#L79-L94
```

The vertices are words; two words are joined when they differ in exactly one letter. Building that graph would mean comparing every pair of words. Instead, `word_ladder` generates the possible neighbors of each word as it's explored, every one-letter change, and keeps those that are real words: 26 × L candidates for a word of L letters, each checked in O(1) with a set. The demo above finds hit → hot → dot → dog → cog, four changes.

Puzzles, game positions, a lock's combinations, a knight's moves on a chessboard (Exercise 3): whenever you can list the moves from a state, BFS finds the fewest moves to a goal.

## Why Not Recursion?

DFS on a grid is often written recursively. Here's why this book doesn't:

```python
@include code/ch28/recursion_limit_dfs.py
```

```
@include code/ch28/recursion_limit_dfs.out
```

On an open 100 × 100 grid, the recursive search snakes through thousands of cells before it ever backs up, so the calls nest thousands deep, and Python's default limit is 1,000. You could raise the limit with `sys.setrecursionlimit`, but then you have to guess how deep the largest input can go, and every nested call holds a frame in memory until the search backs up. An explicit stack needs no guess: it grows as far as the input needs.

## Testing

```python
@include code/ch28/test_grids.py
```

```
@include code/ch28/test_grids.out
```

Islands are checked against a completely different method, union-find (Chapter 19): join each `#` cell to its `#` neighbors, then count the groups. Route lengths are checked against relaxing every cell's distance until nothing changes.

## Timing

```python
@include code/ch28/bench_grid_bfs.py
```

```
@include code/ch28/bench_grid_bfs.out
```

Each row has four times the cells, and the time grows four to five times: roughly linear, as O(R × C) predicts. The drift above four most likely comes from memory: at 640,000 cells, the `parent` dictionary and its tuples outgrow the processor's fast caches, so each access costs a little more. Big O counts steps; the hardware decides what a step costs.

> **Interview Tip:** For grids, say early how you'll mark cells as seen. A `seen` set is clean; overwriting the grid itself (for example, changing `#` to `.`) saves memory but destroys the input, so ask whether that's allowed. And always check the edges: an empty grid, a single cell, a start that's a wall, a goal that can't be reached.

## Key Takeaways

- A grid is a graph: cells are vertices, and neighbors are computed from the four (or eight) directions.
- DFS counts and fills connected regions; BFS finds the fewest steps.
- Multi-source BFS starts from every source at once, giving each cell its distance to the nearest one.
- Implicit graphs generate neighbors on the fly; BFS over game states finds the fewest moves.
- On big grids, write DFS with an explicit stack, not recursion.

## Exercises

1. **The largest island.** Return the number of cells in the largest island.
2. **Distance to the nearest exit.** In a grid with walls `#` and exits `E`, find each open cell's distance to its nearest exit.
3. **Knight moves.** What's the fewest number of moves for a chess knight to go from one square of an 8 × 8 board to another?
