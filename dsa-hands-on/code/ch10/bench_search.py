"""Searching a sorted list: scanning, our binary search, and bisect."""

import bisect

import bench
from binary_search import binary_search


def make(n):
    return list(range(n)), n - 1  # the last item: the scan's worst case


def scan(items, target):
    return target in items


def with_bisect(items, target):
    i = bisect.bisect_left(items, target)
    return i < len(items) and items[i] == target


sizes = [1_000, 10_000, 100_000, 1_000_000]
results = {
    "scan (in)": bench.doubling(scan, make, sizes),
    "binary_search": bench.doubling(binary_search, make, sizes),
    "bisect": bench.doubling(with_bisect, make, sizes),
}
bench.table(results)
bench.chart(results, "ch10_search.png", "Searching a sorted list", log=True)
