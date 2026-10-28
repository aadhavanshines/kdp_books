"""Counting runs with sum k: every run (O(n^2) with running sums)
against prefix sums in a hash map (O(n))."""

import random

import bench
from hashing_patterns import count_subarrays_with_sum

rng = random.Random(2026)


def brute(nums, k):
    count = 0
    for i in range(len(nums)):
        total = 0
        for j in range(i, len(nums)):
            total += nums[j]
            count += total == k
    return count


def make(n):
    return [rng.randint(-5, 5) for _ in range(n)], 3


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "every run": bench.doubling(brute, make, sizes),
    "prefix + hash": bench.doubling(count_subarrays_with_sum, make, sizes),
}
bench.table(results)
