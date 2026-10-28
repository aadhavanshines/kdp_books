"""Lookups in our two maps and in Python's dict, as they grow."""

import bench
from chained_map import ChainedMap
from open_map import OpenMap


def filled(make):
    def make_input(n):
        m = make()
        for i in range(n):
            m[i * 7919] = i  # spread-out integer keys
        return m, (n // 2) * 7919

    return make_input


def lookup(m, key):
    return m[key]


sizes = [1_000, 10_000, 100_000, 1_000_000]
results = {
    "dict": bench.doubling(lookup, filled(dict), sizes),
    "ChainedMap": bench.doubling(lookup, filled(ChainedMap), sizes),
    "OpenMap": bench.doubling(lookup, filled(OpenMap), sizes),
}
bench.table(results)
