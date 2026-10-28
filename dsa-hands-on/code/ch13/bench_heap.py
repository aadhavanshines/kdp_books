"""Building a heap: n pushes against heapify, ours and heapq's."""

import heapq
import random

import bench
from binary_heap import MinHeap

rng = random.Random(2026)


def data(n):
    return (rng.sample(range(n), n),)


def ours_push(items):
    h = MinHeap()
    for x in items:
        h.push(x)


def heapq_push(items):
    h = []
    for x in items:
        heapq.heappush(h, x)


sizes = [10_000, 20_000, 40_000, 80_000]
results = {
    "MinHeap pushes": bench.doubling(ours_push, data, sizes),
    "MinHeap.heapify": bench.doubling(MinHeap.heapify, data, sizes),
    "heappush": bench.doubling(heapq_push, data, sizes),
    "heapq.heapify": bench.doubling(heapq.heapify, data, sizes, fresh=True),
}
bench.table(results)
