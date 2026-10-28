"""Sorts that never compare two items, for small non-negative integers."""


def counting_sort(numbers, largest):
    """Sort integers from 0 to largest by counting each value:
    time and memory proportional to n + largest."""
    counts = [0] * (largest + 1)
    for x in numbers:
        counts[x] += 1
    out = []
    for value, count in enumerate(counts):
        out.extend([value] * count)
    return out


def counting_sort_by(items, key, largest):
    """A stable counting sort of any items by an integer key."""
    counts = [0] * (largest + 1)
    for item in items:
        counts[key(item)] += 1
    starts, total = [0] * (largest + 1), 0
    for value in range(largest + 1):  # where each key's items begin
        starts[value], total = total, total + counts[value]
    out = [None] * len(items)
    for item in items:  # in input order: equal keys stay in order
        k = key(item)
        out[starts[k]] = item
        starts[k] += 1
    return out


def radix_sort(numbers, base=256):
    """Sort non-negative integers digit by digit, least significant
    digit first, with a stable counting sort for each digit."""
    if not numbers:
        return []
    out, place = list(numbers), 1
    while place <= max(numbers):
        out = counting_sort_by(out, lambda x: x // place % base, base - 1)
        place *= base
    return out
