"""How long does `x in collection` take, for a list and for a set?"""

import bench


def make_list(n):
    return list(range(n)), -1  # -1 is never there: the worst case


def make_set(n):
    return set(range(n)), -1


def contains(collection, x):
    return x in collection


sizes = [1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000]
results = {
    "list": bench.doubling(contains, make_list, sizes),
    "set": bench.doubling(contains, make_set, sizes),
}
bench.table(results)
bench.chart(results, "ch01_list_vs_set.png", "x in list vs x in set")
