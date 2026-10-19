"""13.3 Closest Stations: the k stations nearest to the origin (0, 0).
Return them sorted by distance, then by (x, y)."""

import heapq


def closest_sort(stations, k):
    return sorted(stations, key=lambda p: (p[0] ** 2 + p[1] ** 2, p))[:k]


def closest(stations, k):
    heap = []  # max-heap of the k closest, using negated keys
    for x, y in stations:
        key = (-(x * x + y * y), -x, -y)
        if len(heap) < k:
            heapq.heappush(heap, key)
        elif key > heap[0]:  # closer than the farthest kept station
            heapq.heapreplace(heap, key)
    result = [(-nx, -ny) for _, nx, ny in heap]
    return sorted(result, key=lambda p: (p[0] ** 2 + p[1] ** 2, p))


SOLUTIONS = [closest, closest_sort]
EXAMPLES = [
    (([(1, 3), (-2, 2), (5, -1)], 1), [(-2, 2)]),
    (([(3, 3), (5, -1), (-2, 4)], 2), [(3, 3), (-2, 4)]),
]


def random_case(rng):
    pts = [
        (rng.randint(-5, 5), rng.randint(-5, 5))
        for _ in range(rng.randint(1, 10))
    ]
    return (pts, rng.randint(1, len(pts)))
