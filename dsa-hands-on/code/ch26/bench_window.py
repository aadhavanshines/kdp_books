"""Maximum of every window of size k = n / 10: recomputing each window
against the monotonic deque."""

import random

import bench
from window import window_maxima

rng = random.Random(2026)


def brute(nums, k):
    return [max(nums[i : i + k]) for i in range(len(nums) - k + 1)]


def make(n):
    return [rng.random() for _ in range(n)], n // 10


sizes = [1_000, 2_000, 4_000, 8_000]
results = {
    "max of each window": bench.doubling(brute, make, sizes),
    "monotonic deque": bench.doubling(window_maxima, make, sizes),
}
bench.table(results)
bench.chart(results, "ch26_window.png", "Window maxima, k = n / 10")
