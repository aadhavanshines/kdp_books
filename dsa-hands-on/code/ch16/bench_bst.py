"""Looking up a key: a BST built from random keys, one built from
sorted keys, and Python's dict."""

import random

import bench
from bst import BST

rng = random.Random(2026)


def built(order):
    def make(n):
        t = BST()
        for k in order(n):
            t.put(k, None)
        return t, n - 1  # the largest key: deepest in the sorted tree

    return make


def lookup(t, key):
    return key in t


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "random keys": bench.doubling(
        lookup, built(lambda n: rng.sample(range(n), n)), sizes
    ),
    "sorted keys": bench.doubling(lookup, built(range), sizes),
    "dict": bench.doubling(
        lookup, lambda n: (dict.fromkeys(range(n)), n - 1), sizes
    ),
}
bench.table(results)
bench.chart(results, "ch16_bst.png", "Looking up the largest key")
