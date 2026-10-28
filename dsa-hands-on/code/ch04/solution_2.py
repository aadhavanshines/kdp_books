"""Exercise 4.2: where a list grows, measured with sys.getsizeof and
predicted with the rule from CPython's listobject.c."""

import sys

SLOT = 8  # bytes per reference
EMPTY = sys.getsizeof([])


def predicted(needed):
    return (needed + (needed >> 3) + 6) & ~3


items, capacity, growths = [], 0, []
for n in range(1, 201):
    items.append(None)
    measured = (sys.getsizeof(items) - EMPTY) // SLOT
    if measured != capacity:
        growths.append((n, measured, predicted(n)))
        capacity = measured
for n, measured, rule in growths:
    print(f"at length {n:>3}: capacity {measured:>3} (rule says {rule})")
