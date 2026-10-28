"""A hash flood: keys that all hash to the same value turn a dict's
constant-time operations into linear ones, and filling it quadratic."""

import bench


class Key:
    def __init__(self, x, flood):
        self.x = x
        self.flood = flood

    def __hash__(self):
        return 42 if self.flood else hash(self.x)

    def __eq__(self, other):
        return self.x == other.x


def fill(n, flood):
    d = {}
    for i in range(n):
        d[Key(i, flood)] = i


sizes = [500, 1_000, 2_000, 4_000]
results = {
    "good hashes": bench.doubling(fill, lambda n: (n, False), sizes),
    "all hash to 42": bench.doubling(fill, lambda n: (n, True), sizes),
}
bench.table(results)
bench.chart(results, "ch09_flood.png", "Filling a dict: a hash flood")
