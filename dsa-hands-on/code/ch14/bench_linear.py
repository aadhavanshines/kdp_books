"""Our counting and radix sorts against sorted(), on n numbers from 0
to 999. Fewer steps in theory; but sorted() runs in C."""

import random

import bench
from linear_sorts import counting_sort, radix_sort

rng = random.Random(2026)


def data(n):
    return ([rng.randint(0, 999) for _ in range(n)],)


sizes = [100_000, 200_000, 400_000, 800_000]
results = {
    "counting_sort": bench.doubling(
        lambda d: counting_sort(d, 999), data, sizes
    ),
    "radix_sort": bench.doubling(radix_sort, data, sizes),
    "sorted()": bench.doubling(sorted, data, sizes),
}
bench.table(results)
