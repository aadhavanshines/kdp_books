"""Exercise 13.2: the k points closest to the origin. Keep a max-heap of
the k best so far; a closer point replaces the farthest of them.
Takes n log k time and k memory, however long the input."""

import heapq


def k_closest(points, k):
    heap = []  # (-distance squared, point): the farthest is on top
    for x, y in points:
        d = x * x + y * y
        if len(heap) < k:
            heapq.heappush(heap, (-d, (x, y)))
        elif -heap[0][0] > d:
            heapq.heapreplace(heap, (-d, (x, y)))
    return sorted(p for _, p in heap)


points = [(3, 3), (5, -1), (-2, 4), (1, 1), (0, -2), (6, 6)]
print(k_closest(points, 3))
