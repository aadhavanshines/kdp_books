"""Three-sum: every triple (O(n^3)) against two pointers (O(n^2))."""

import itertools
import random

import bench
from two_pointers import three_sum

rng = random.Random(2026)


def brute(nums):
    return {
        tuple(sorted(c))
        for c in itertools.combinations(nums, 3)
        if sum(c) == 0
    }


def make(n):
    return ([rng.randint(-10_000, 10_000) for _ in range(n)],)


sizes = [100, 200, 400, 800]
results = {
    "all triples": bench.doubling(brute, make, sizes),
    "two pointers": bench.doubling(three_sum, make, sizes),
}
bench.table(results)
