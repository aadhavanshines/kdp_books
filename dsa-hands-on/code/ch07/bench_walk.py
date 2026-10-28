"""Walking through every item: LinkedList against list."""

import bench
from linked_list import LinkedList


def walk(items):
    total = 0
    for x in items:
        total += x
    return total


sizes = [10_000, 20_000, 40_000, 80_000]
results = {
    "list": bench.doubling(walk, lambda n: (list(range(n)),), sizes),
    "LinkedList": bench.doubling(
        walk, lambda n: (LinkedList(range(n)),), sizes
    ),
}
bench.table(results)
