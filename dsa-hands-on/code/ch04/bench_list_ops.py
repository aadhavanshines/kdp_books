"""What each list operation costs, as the list grows."""

import bench


def make(n):
    return (list(range(n)),)


def append_pop(items):  # add at the end, then take it off again
    items.append(0)
    items.pop()


def insert_pop_front(items):  # add at the front, then take it off
    items.insert(0, 0)
    items.pop(0)


def read_middle(items):
    return items[len(items) // 2]


sizes = [10_000, 20_000, 40_000, 80_000, 160_000]
results = {
    "append + pop()": bench.doubling(append_pop, make, sizes),
    "items[i]": bench.doubling(read_middle, make, sizes),
    "insert(0) + pop(0)": bench.doubling(insert_pop_front, make, sizes),
}
bench.table(results)
bench.chart(results, "ch04_list_ops.png", "List operations")
