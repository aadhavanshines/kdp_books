"""Exercise 19.2: friendships form over time, as (time, a, b) records.
When did everyone first belong to one group?"""

from union_find import UnionFind


def all_connected_at(n, records):
    uf = UnionFind(n)
    for time, a, b in sorted(records):
        uf.union(a, b)
        if uf.sets == 1:
            return time
    return None


records = [(20, 0, 1), (35, 3, 4), (5, 1, 2), (61, 2, 3), (50, 0, 2)]
print(all_connected_at(5, records))
print(all_connected_at(6, records))
