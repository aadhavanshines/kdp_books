"""Exercise 10.1: the first and last position of a target in a sorted
list, with two binary searches: [first, last] or [-1, -1]."""

from binary_search import lower_bound, upper_bound


def first_and_last(items, target):
    first = lower_bound(items, target)
    if first == len(items) or items[first] != target:
        return [-1, -1]
    return [first, upper_bound(items, target) - 1]


items = [5, 7, 7, 8, 8, 8, 10]
for t in [8, 7, 6, 10]:
    print(t, first_and_last(items, t))
