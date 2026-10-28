"""Dijkstra against Bellman-Ford on random graphs with n vertices and
4n edges."""

import random

import bench
from shortest import bellman_ford, dijkstra

rng = random.Random(2026)


def make(n):
    g = {v: {} for v in range(n)}
    for v in range(n):
        g[v][(v + 1) % n] = rng.randint(1, 100)  # a ring: all reachable
        for _ in range(3):
            g[v][rng.randrange(n)] = rng.randint(1, 100)
    return g, 0


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "dijkstra": bench.doubling(dijkstra, make, sizes),
    "bellman_ford": bench.doubling(bellman_ford, make, sizes),
}
bench.table(results)
bench.chart(results, "ch22_shortest.png", "Shortest paths from one vertex")
