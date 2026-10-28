"""Union-find checked against connected components found by search."""

import random

from union_find import NaiveUnionFind, UnionFind


def components(n, edges):
    """Label each item with its component, by depth-first search."""
    neighbors = {i: [] for i in range(n)}
    for a, b in edges:
        neighbors[a].append(b)
        neighbors[b].append(a)
    label = {}
    for start in range(n):
        if start in label:
            continue
        stack = [start]
        while stack:
            x = stack.pop()
            if x not in label:
                label[x] = start
                stack.extend(neighbors[x])
    return label


def test_small_example():
    uf = UnionFind(6)
    assert uf.union(0, 1) and uf.union(1, 2) and uf.union(3, 4)
    assert not uf.union(0, 2)  # already connected
    assert uf.connected(0, 2) and not uf.connected(2, 3)
    assert uf.sets == 3


def test_random_graphs_match_search():
    rng = random.Random(2026)
    for _ in range(200):
        n = rng.randint(1, 60)
        edges = [
            (rng.randrange(n), rng.randrange(n))
            for _ in range(rng.randint(0, n))
        ]
        label = components(n, edges)
        for make in (UnionFind, NaiveUnionFind):
            uf = make(n)
            for a, b in edges:
                uf.union(a, b)
            for a in range(n):
                for b in range(n):
                    same = uf.find(a) == uf.find(b)
                    assert same == (label[a] == label[b])
