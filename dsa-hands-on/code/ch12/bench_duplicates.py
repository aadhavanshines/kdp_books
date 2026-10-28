"""Many equal items: the two-way and three-way quicksorts."""

import random
import sys

import bench
from quicksort import quicksort, quicksort3

sys.setrecursionlimit(10_000)
rng = random.Random(2026)


def few_values(n):
    return ([rng.randint(0, 9) for _ in range(n)],)  # only 10 values


sizes = [2_000, 4_000, 8_000, 16_000]
results = {
    "quicksort": bench.doubling(quicksort, few_values, sizes, fresh=True),
    "quicksort3": bench.doubling(quicksort3, few_values, sizes, fresh=True),
}
bench.table(results)
