"""Exercise 19.1: in a network that started as a tree, one extra cable
made a loop. Find the first cable that joins two already-connected
computers."""

from union_find import UnionFind


def redundant(n, cables):
    uf = UnionFind(n)
    for a, b in cables:
        if not uf.union(a, b):
            return a, b
    return None


print(redundant(5, [(0, 1), (1, 2), (3, 4), (2, 3), (1, 4)]))
