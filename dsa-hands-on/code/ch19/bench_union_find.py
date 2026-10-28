"""n unions that build one long chain, then a find on every item:
naive union-find against path compression and union by size."""

import bench
from union_find import NaiveUnionFind, UnionFind


def chain_then_find(make, n):
    uf = make(n)
    for i in range(n - 1):
        uf.union(i, i + 1)  # the naive version builds a chain
    for i in range(n):
        uf.find(i)


sizes = [1_000, 2_000, 4_000, 8_000]
results = {
    "naive": bench.doubling(
        chain_then_find, lambda n: (NaiveUnionFind, n), sizes
    ),
    "compressed": bench.doubling(
        chain_then_find, lambda n: (UnionFind, n), sizes
    ),
}
bench.table(results)
bench.chart(results, "ch19_union_find.png", "Union-find: a chain of n")
