"""The three two-sum solutions, when no pair exists (the worst case)."""

import random

import bench
from two_sum import two_sum_brute, two_sum_hash, two_sum_sorted

rng = random.Random(2026)


def make(n):
    return [rng.randrange(0, 10**9, 2) for _ in range(n)], 1  # all even


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "brute force": bench.doubling(two_sum_brute, make, sizes),
    "sort + pointers": bench.doubling(two_sum_sorted, make, sizes),
    "hash map": bench.doubling(two_sum_hash, make, sizes),
}
bench.table(results)
bench.chart(results, "ch24_two_sum.png", "Two sum: three solutions")
