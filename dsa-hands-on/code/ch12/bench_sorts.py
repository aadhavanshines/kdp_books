"""Merge sort and quicksort against Python's sorted(), on random data."""

import random

import bench
from merge_sort import merge_sort
from quicksort import quicksort, quicksort3

rng = random.Random(2026)


def shuffled(n):
    return (rng.sample(range(n), n),)


sizes = [10_000, 20_000, 40_000, 80_000]
results = {
    "merge_sort": bench.doubling(merge_sort, shuffled, sizes, fresh=True),
    "quicksort": bench.doubling(quicksort, shuffled, sizes, fresh=True),
    "quicksort3": bench.doubling(quicksort3, shuffled, sizes, fresh=True),
    "sorted()": bench.doubling(sorted, shuffled, sizes, fresh=True),
}
bench.table(results)
bench.chart(results, "ch12_sorts.png", "Sorting random lists")
