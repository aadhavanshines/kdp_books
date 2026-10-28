"""Exercise 13.1: heapsort with MinHeap: heapify, then pop n times."""

import random

from binary_heap import MinHeap


def heapsort(items):
    h = MinHeap.heapify(items)
    return [h.pop() for _ in range(len(items))]


rng = random.Random(2026)
data = [rng.randint(0, 99) for _ in range(12)]
print(heapsort(data))
assert heapsort(data) == sorted(data)
