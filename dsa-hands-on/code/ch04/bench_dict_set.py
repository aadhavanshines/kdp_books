"""Dict and set operations take about the same time at any size."""

import bench


def make_dict(n):
    return ({i: i for i in range(n)},)


def make_set(n):
    return (set(range(n)),)


def dict_get(d):
    return d.get(12345)


def dict_set_delete(d):
    d[-1] = 0
    del d[-1]


def set_add_remove(s):
    s.add(-1)
    s.remove(-1)


sizes = [10_000, 100_000, 1_000_000]
results = {
    "dict get": bench.doubling(dict_get, make_dict, sizes),
    "dict set + del": bench.doubling(dict_set_delete, make_dict, sizes),
    "set add + remove": bench.doubling(set_add_remove, make_set, sizes),
}
bench.table(results)
