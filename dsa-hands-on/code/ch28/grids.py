"""Grids as graphs: every cell is a vertex joined to its neighbors up,
down, left and right. No adjacency lists needed: compute the neighbors
on the fly."""

from collections import deque

STEPS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def neighbors(grid, r, c):
    for dr, dc in STEPS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]):
            yield nr, nc


def count_islands(grid):
    """Groups of connected "#" cells. Each new "#" starts a DFS that
    marks its whole island as seen."""
    seen, islands = set(), 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == "#" and (r, c) not in seen:
                islands += 1
                stack = [(r, c)]
                seen.add((r, c))
                while stack:
                    cell = stack.pop()
                    for n in neighbors(grid, *cell):
                        if grid[n[0]][n[1]] == "#" and n not in seen:
                            seen.add(n)
                            stack.append(n)
    return islands


def shortest_route(grid, start, goal):
    """Fewest steps from start to goal avoiding "#" walls (BFS), and the
    path; (None, []) if the goal can't be reached."""
    parent = {start: None}
    queue = deque([start])
    while queue:
        cell = queue.popleft()
        if cell == goal:
            path = [cell]
            while parent[path[-1]]:
                path.append(parent[path[-1]])
            return len(path) - 1, path[::-1]
        for n in neighbors(grid, *cell):
            if grid[n[0]][n[1]] != "#" and n not in parent:
                parent[n] = cell
                queue.append(n)
    return None, []


def minutes_to_rot(grid):
    """Every minute, rot spreads from each rotten orange ("R") to fresh
    neighbors ("F"). Minutes until none is fresh, or -1. A BFS that
    starts from all rotten oranges at once (multi-source BFS)."""
    rows = [list(row) for row in grid]
    queue = deque(
        (r, c)
        for r, row in enumerate(rows)
        for c, x in enumerate(row)
        if x == "R"
    )
    fresh = sum(row.count("F") for row in rows)
    minutes = 0
    while queue and fresh:
        minutes += 1
        for _ in range(len(queue)):  # one whole level = one minute
            for nr, nc in neighbors(rows, *queue.popleft()):
                if rows[nr][nc] == "F":
                    rows[nr][nc] = "R"
                    fresh -= 1
                    queue.append((nr, nc))
    return -1 if fresh else minutes


def word_ladder(start, goal, words):
    """Fewest one-letter changes from start to goal, each step a word in
    words. The graph is implicit: neighbors are generated, not stored."""
    words = set(words)
    dist, queue = {start: 0}, deque([start])
    while queue:
        w = queue.popleft()
        if w == goal:
            return dist[w]
        for i in range(len(w)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                nxt = w[:i] + ch + w[i + 1 :]
                if nxt in words and nxt not in dist:
                    dist[nxt] = dist[w] + 1
                    queue.append(nxt)
    return None
