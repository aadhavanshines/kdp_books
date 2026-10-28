"""Exercise 23.1: connect points on a grid, where joining two costs
their Manhattan distance |x1 - x2| + |y1 - y2|. Every pair can be
joined, so this is a dense graph: Prim with a plain array, in V^2."""

import math


def connect_points(points):
    n = len(points)
    best = [math.inf] * n  # cheapest edge into the tree for each point
    best[0], total, in_tree = 0, 0, [False] * n
    for _ in range(n):
        u = min(
            (i for i in range(n) if not in_tree[i]), key=best.__getitem__
        )
        in_tree[u] = True
        total += best[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(points[u][0] - points[v][0]) + abs(
                    points[u][1] - points[v][1]
                )
                best[v] = min(best[v], d)
    return total


print(connect_points([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)]))
