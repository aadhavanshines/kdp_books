"""Exercise 4.1: items of a that are also in b, two ways, counting the
work each does."""

import random

rng = random.Random(2026)
a = rng.sample(range(10_000), 1_000)
b = rng.sample(range(10_000), 1_000)


def common_list(a, b):
    out, comparisons = [], 0
    for x in a:
        for y in b:  # what `x in b` does for a list
            comparisons += 1
            if x == y:
                out.append(x)
                break
    return out, comparisons


def common_set(a, b):
    b_set = set(b)  # one pass over b to build it
    return [x for x in a if x in b_set], len(a)  # one lookup per item


in_list, list_work = common_list(a, b)
in_set, set_work = common_set(a, b)
assert in_list == in_set
print(f"{len(in_list)} common items")
print(f"list: {list_work:,} comparisons; set: {set_work:,} lookups")
