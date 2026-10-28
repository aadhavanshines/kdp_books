"""Count quicksort's comparisons on random and on sorted input.
With the last item as pivot, sorted input splits off one item at a
time: n * (n - 1) / 2 comparisons, and n levels of recursion."""

import math
import random
import sys

import quicksort as q

calls = {"compared": 0}
original = q.partition


def counting_partition(items, lo, hi):
    calls["compared"] += hi - lo  # the loop compares each item once
    return original(items, lo, hi)


q.partition = counting_partition
sys.setrecursionlimit(5000)  # the naive version recurses n levels deep
random.seed(2026)
n = 2000
for name, sort in [
    ("naive", q.quicksort_naive),
    ("random pivot", q.quicksort),
]:
    for label, data in [
        ("random", random.sample(range(n), n)),
        ("sorted", list(range(n))),
    ]:
        calls["compared"] = 0
        sort(data)
        count = calls["compared"]
        print(f"{name:>12}, {label} input: {count:>9,} comparisons")
print(f"n log2 n = {n * math.log2(n):,.0f}")
print(f"n (n - 1) / 2 = {n * (n - 1) // 2:,}")
