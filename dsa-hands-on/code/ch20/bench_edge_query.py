"""Is there an edge from u to v? With neighbor lists, neighbor sets
and a matrix, as the graph grows (each vertex has 10 neighbors)."""

import random

import bench

rng = random.Random(2026)


def make(n):
    nbrs = [rng.sample(range(n), 10) for _ in range(n)]
    lists = nbrs
    sets = [set(x) for x in nbrs]
    matrix = [[False] * n for _ in range(n)]
    for u, row in enumerate(nbrs):
        for v in row:
            matrix[u][v] = True
    return lists, sets, matrix


sizes = [250, 500, 1_000, 2_000]
built = {n: make(n) for n in sizes}
results = {}
for i, name in enumerate(["lists", "sets", "matrix"]):
    if name == "matrix":

        def query(r):
            return r[7][-1]  # row 7, the last column
    else:

        def query(r):
            return -1 in r[7]  # not there: a list scans all 10

    results[name] = bench.doubling(
        query, lambda n, i=i: (built[n][i],), sizes
    )
bench.table(results)
