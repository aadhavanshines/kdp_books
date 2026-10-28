"""BFS with a deque as the queue, and with a list using pop(0), on two
graphs: a square grid of n cells, and a star (one center vertex joined
to n others)."""

from collections import deque

import bench


def star(n):
    g = {(0, 0): [(i, 1) for i in range(n)]}
    for i in range(n):
        g[i, 1] = [(0, 0)]
    return (g,)


def grid(n):
    side = int(n**0.5)
    g = {}
    for r in range(side):
        for c in range(side):
            g[r, c] = [
                (r + dr, c + dc)
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
                if 0 <= r + dr < side and 0 <= c + dc < side
            ]
    return (g,)


def bfs_deque(g):
    seen, queue = {(0, 0)}, deque([(0, 0)])
    while queue:
        v = queue.popleft()
        for w in g[v]:
            if w not in seen:
                seen.add(w)
                queue.append(w)


def bfs_list(g):
    seen, queue = {(0, 0)}, [(0, 0)]
    while queue:
        v = queue.pop(0)
        for w in g[v]:
            if w not in seen:
                seen.add(w)
                queue.append(w)


print("grid of n cells:")
sizes = [10_000, 40_000, 160_000, 640_000]
bench.table(
    {
        "deque": bench.doubling(bfs_deque, grid, sizes),
        "list.pop(0)": bench.doubling(bfs_list, grid, sizes),
    }
)
print("star with n leaves:")
sizes = [10_000, 20_000, 40_000, 80_000]
bench.table(
    {
        "deque": bench.doubling(bfs_deque, star, sizes),
        "list.pop(0)": bench.doubling(bfs_list, star, sizes),
    }
)
