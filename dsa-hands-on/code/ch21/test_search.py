"""BFS distances checked by brute force, and topological orders checked
on random directed graphs."""

import itertools
import random

from search import (
    bfs,
    components,
    shortest_path,
    topological_order,
    two_colors,
)


def random_graph(rng, n, m, directed):
    g = {v: [] for v in range(n)}
    for _ in range(m):
        a, b = rng.randrange(n), rng.randrange(n)
        if a != b and b not in g[a]:
            g[a].append(b)
            if not directed:
                g[b].append(a)
    return g


def brute_distances(g, start):
    """Repeatedly relax every edge: slow but obviously right."""
    dist = {start: 0}
    for _ in range(len(g)):
        for v in list(dist):
            for w in g[v]:
                if dist[v] + 1 < dist.get(w, len(g) + 1):
                    dist[w] = dist[v] + 1
    return dist


def test_bfs_distances():
    rng = random.Random(2026)
    for _ in range(200):
        g = random_graph(rng, rng.randint(1, 15), rng.randint(0, 30), True)
        assert bfs(g, 0)[0] == brute_distances(g, 0)


def test_shortest_path_and_components():
    g = {"a": ["b"], "b": ["a", "c"], "c": ["b"], "x": ["y"], "y": ["x"]}
    assert shortest_path(g, "a", "c") == ["a", "b", "c"]
    assert shortest_path(g, "a", "x") is None
    assert sorted(map(sorted, components(g))) == [
        ["a", "b", "c"],
        ["x", "y"],
    ]


def test_topological_order():
    rng = random.Random(2026)
    for _ in range(300):
        g = random_graph(rng, rng.randint(1, 8), rng.randint(0, 12), True)
        order = topological_order(g)
        # A valid order exists exactly when some permutation works
        exists = any(
            all(p.index(v) < p.index(w) for v in g for w in g[v])
            for p in itertools.permutations(g)
        )
        assert (order is not None) == exists
        if order:
            assert all(
                order.index(v) < order.index(w) for v in g for w in g[v]
            )


def test_two_colors():
    square = {0: [1, 3], 1: [0, 2], 2: [1, 3], 3: [2, 0]}
    triangle = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
    colors = two_colors(square)
    assert all(colors[v] != colors[w] for v in square for w in square[v])
    assert two_colors(triangle) is None
