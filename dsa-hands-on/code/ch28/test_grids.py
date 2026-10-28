"""Grid searches checked against union-find and a slow relaxation."""

import random

from grids import count_islands, minutes_to_rot, shortest_route

rng = random.Random(2026)


def random_grid(rows, cols, chars, weights):
    return [
        "".join(rng.choices(chars, weights, k=cols)) for _ in range(rows)
    ]


def islands_by_union_find(grid):
    parent = {}

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    cells = [
        (r, c)
        for r, row in enumerate(grid)
        for c, x in enumerate(row)
        if x == "#"
    ]
    for cell in cells:
        parent[cell] = cell
    for r, c in cells:
        for n in ((r + 1, c), (r, c + 1)):
            if n in parent:
                parent[find(n)] = find((r, c))
    return len({find(c) for c in cells})


def test_islands():
    for _ in range(300):
        g = random_grid(rng.randint(1, 8), rng.randint(1, 8), "#.", (1, 1))
        assert count_islands(g) == islands_by_union_find(g)


def test_shortest_route_length():
    for _ in range(300):
        g = random_grid(rng.randint(1, 7), rng.randint(1, 7), "#.", (1, 2))
        g[0] = "." + g[0][1:]
        goal = (len(g) - 1, len(g[0]) - 1)
        steps, path = shortest_route(g, (0, 0), goal)
        # slow check: relax distances until nothing changes
        inf = 10**9
        d = {
            (r, c): inf
            for r in range(len(g))
            for c in range(len(g[0]))
            if g[r][c] != "#"
        }
        d[(0, 0)] = 0
        for _ in range(len(d)):
            for (r, c), v in list(d.items()):
                for n in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if n in d and v + 1 < d[n]:
                        d[n] = v + 1
        expected = d.get(goal, inf)
        assert steps == (None if expected == inf else expected)
        if steps is not None:
            assert len(path) == steps + 1 and path[-1] == goal


def test_rotting():
    assert minutes_to_rot(["RFF", "FFF", "FFF"]) == 4
    assert minutes_to_rot(["RF.", ".FF", "F.F"]) == -1
    assert minutes_to_rot(["..", ".."]) == 0
