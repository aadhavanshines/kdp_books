"""Exercise 12.2: quickselect, the k-th smallest item (k = 0 is the
smallest) in linear time on average: partition, then keep only the
side that holds position k."""

import random

from quicksort import partition


def quickselect(items, k):
    items = list(items)
    lo, hi = 0, len(items) - 1
    while True:
        r = random.randint(lo, hi)
        items[r], items[hi] = items[hi], items[r]
        p = partition(items, lo, hi)
        if p == k:
            return items[p]
        if k < p:
            hi = p - 1
        else:
            lo = p + 1


random.seed(2026)
data = [7, 2, 9, 4, 1, 8, 3]
print([quickselect(data, k) for k in range(len(data))])
