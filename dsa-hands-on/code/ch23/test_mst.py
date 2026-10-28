"""Kruskal and Prim must find trees of the same, smallest total weight;
on small graphs, checked by trying every set of n - 1 edges."""

import itertools
import random

from mst import kruskal, prim
from union_find import UnionFind


def is_spanning_tree(n, chosen):
    uf = UnionFind(n)
    return len(chosen) == n - 1 and all(
        uf.union(u, v) for _, u, v in chosen
    )


def test_against_brute_force():
    rng = random.Random(2026)
    for _ in range(150):
        n = rng.randint(2, 6)
        edges = [
            (rng.randint(1, 9), i, i + 1) for i in range(n - 1)
        ]  # connected
        edges += [
            (rng.randint(1, 9), rng.randrange(n), rng.randrange(n))
            for _ in range(rng.randint(0, 6))
        ]
        edges = [e for e in edges if e[1] != e[2]]
        best = min(
            sum(w for w, _, _ in combo)
            for combo in itertools.combinations(edges, n - 1)
            if is_spanning_tree(n, combo)
        )
        graph = {v: {} for v in range(n)}
        for w, u, v in edges:
            if w < graph[u].get(v, 99):
                graph[u][v] = graph[v][u] = w
        k, p = kruskal(n, edges), prim(graph, 0)
        assert is_spanning_tree(n, k) and is_spanning_tree(n, p)
        assert sum(w for w, _, _ in k) == best == sum(w for w, _, _ in p)
