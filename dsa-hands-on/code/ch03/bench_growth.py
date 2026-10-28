"""Three functions, three growth rates, measured by doubling n."""

import bench


def first(items):  # constant: one step, whatever n is
    return items[0]


def total(items):  # linear: one step per item
    s = 0
    for x in items:
        s += x
    return s


def has_duplicate(items):  # quadratic: one step per pair of items
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                return True
    return False


def make(n):
    return (list(range(n)),)


sizes = [250, 500, 1_000, 2_000, 4_000]
results = {
    "first item": bench.doubling(first, make, sizes),
    "sum": bench.doubling(total, make, sizes),
    "all pairs": bench.doubling(has_duplicate, make, sizes),
}
bench.table(results)
bench.chart(results, "ch03_growth.png", "Three growth rates", log=True)
