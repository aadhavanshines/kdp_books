"""Longest increasing subsequence: O(n^2) against O(n log n)."""

import random

import bench
from dp_sequences import lis, lis_quadratic

rng = random.Random(2026)


def make(n):
    return ([rng.random() for _ in range(n)],)


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "n squared": bench.doubling(lis_quadratic, make, sizes),
    "n log n": bench.doubling(lis, make, sizes),
}
bench.table(results)
bench.chart(results, "ch30_lis.png", "Longest increasing subsequence")
