"""17.6 Cheapest Wiring: connect all sensors (points on a grid) with cables
whose cost is the Manhattan distance between their ends. What is the
minimum total cost?"""

import heapq
from itertools import combinations


def cheapest_wiring(points):
    n = len(points)
    connected = [False] * n
    heap = [(0, 0)]  # (cost to connect, point index)
    total = 0
    joined = 0
    while joined < n:
        cost, i = heapq.heappop(heap)
        if connected[i]:
            continue
        connected[i] = True
        total += cost
        joined += 1
        xi, yi = points[i]
        for j in range(n):
            if not connected[j]:
                xj, yj = points[j]
                heapq.heappush(heap, (abs(xi - xj) + abs(yi - yj), j))
    return total


def cheapest_wiring_kruskal(points):
    parent = list(range(len(points)))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    edges = sorted(
        (abs(a[0] - b[0]) + abs(a[1] - b[1]), i, j)
        for (i, a), (j, b) in combinations(enumerate(points), 2)
    )
    total = 0
    for cost, i, j in edges:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[ri] = rj
            total += cost
    return total


SOLUTIONS = [cheapest_wiring, cheapest_wiring_kruskal]
EXAMPLES = [
    (([(0, 0), (2, 2), (3, 10), (5, 2), (7, 0)],), 20),
    (([(1, 1)],), 0),
]


def random_case(rng):
    return (
        [
            (rng.randint(-5, 5), rng.randint(-5, 5))
            for _ in range(rng.randint(1, 8))
        ],
    )
