"""13.1 Kth Largest Score: the k-th largest value (counting duplicates)."""

import heapq


def kth_largest_sort(scores, k):
    return sorted(scores, reverse=True)[k - 1]


def kth_largest(scores, k):
    heap = []  # the k largest so far; heap[0] is the smallest of them
    for s in scores:
        if len(heap) < k:
            heapq.heappush(heap, s)
        elif s > heap[0]:
            heapq.heapreplace(heap, s)
    return heap[0]


SOLUTIONS = [kth_largest, kth_largest_sort]
EXAMPLES = [
    (([71, 88, 64, 93, 88, 50], 3), 88),
    (([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4),
    (([7], 1), 7),
]


def random_case(rng):
    s = [rng.randint(-9, 9) for _ in range(rng.randint(1, 12))]
    return (s, rng.randint(1, len(s)))
