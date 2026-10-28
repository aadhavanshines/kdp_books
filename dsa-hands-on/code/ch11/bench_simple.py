"""The three simple sorts on random lists, and insertion sort on a
nearly sorted list."""

import random

import bench
from simple_sorts import bubble_sort, insertion_sort, selection_sort

rng = random.Random(2026)


def shuffled(n):
    return (rng.sample(range(n), n),)


def nearly_sorted(n):
    items = list(range(n))
    for _ in range(n // 100):  # one neighbor swap per 100 items
        i = rng.randrange(n - 1)
        items[i], items[i + 1] = items[i + 1], items[i]
    return (items,)


sizes = [250, 500, 1_000, 2_000]
results = {
    "bubble": bench.doubling(bubble_sort, shuffled, sizes, fresh=True),
    "selection": bench.doubling(
        selection_sort, shuffled, sizes, fresh=True
    ),
    "insertion": bench.doubling(
        insertion_sort, shuffled, sizes, fresh=True
    ),
    "nearly sorted": bench.doubling(  # insertion sort
        insertion_sort, nearly_sorted, sizes, fresh=True
    ),
}
bench.table(results)
bench.chart(results, "ch11_simple.png", "Simple sorts")
