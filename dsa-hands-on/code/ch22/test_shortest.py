"""Dijkstra and Bellman-Ford checked against Floyd-Warshall, which
tries every vertex as a stop between every pair."""

import math
import random

import pytest

from shortest import bellman_ford, dijkstra, path_to


def random_graph(rng, n, m, low=1):
    g = {v: {} for v in range(n)}
    for _ in range(m):
        a, b = rng.randrange(n), rng.randrange(n)
        if a != b:
            g[a][b] = rng.randint(low, 20)
    return g


def floyd_warshall(g):
    d = {
        (a, b): 0 if a == b else g[a].get(b, math.inf) for a in g for b in g
    }
    for k in g:
        for a in g:
            for b in g:
                d[a, b] = min(d[a, b], d[a, k] + d[k, b])
    return d


def test_both_match_floyd_warshall():
    rng = random.Random(2026)
    for _ in range(200):
        g = random_graph(rng, rng.randint(1, 12), rng.randint(0, 40))
        best = floyd_warshall(g)
        expected = {b: best[0, b] for b in g if best[0, b] < math.inf}
        dist, parent = dijkstra(g, 0)
        assert dist == expected
        assert bellman_ford(g, 0)[0] == expected
        for v in dist:  # the path's weights add up to the distance
            p = path_to(parent, v)
            assert sum(g[a][b] for a, b in zip(p, p[1:])) == dist[v]


def test_negative_edges_and_cycles():
    g = {"s": {"a": 4, "b": 1}, "a": {"c": 1}, "b": {"a": -2}, "c": {}}
    assert bellman_ford(g, "s")[0] == {"s": 0, "b": 1, "a": -1, "c": 0}
    g["c"]["b"] = -1  # b -> a -> c -> b now sums to -2
    with pytest.raises(ValueError):
        bellman_ford(g, "s")
