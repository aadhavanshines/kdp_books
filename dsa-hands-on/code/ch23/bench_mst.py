"""Kruskal against Prim on random connected graphs: n vertices, 5n
edges."""

import random

import bench
from mst import kruskal, prim

rng = random.Random(2026)


def make(n):
    edges = [(rng.randint(1, 1000), i, i + 1) for i in range(n - 1)]
    edges += [
        (rng.randint(1, 1000), rng.randrange(n), rng.randrange(n))
        for _ in range(4 * n)
    ]
    graph = {v: {} for v in range(n)}
    for w, u, v in edges:
        if u != v:
            graph[u][v] = graph[v][u] = w
    return edges, graph


sizes = [2_000, 4_000, 8_000, 16_000]
built = {n: make(n) for n in sizes}
results = {
    "kruskal": bench.doubling(kruskal, lambda n: (n, built[n][0]), sizes),
    "prim": bench.doubling(prim, lambda n: (built[n][1], 0), sizes),
}
bench.table(results)
