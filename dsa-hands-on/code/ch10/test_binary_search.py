"""Tests for binary search, checked against the bisect module."""

import bisect
import random

from binary_search import binary_search, lower_bound, upper_bound


def test_found_and_not_found():
    items = [2, 3, 5, 7, 11, 13]
    for i, x in enumerate(items):
        assert binary_search(items, x) == i
    for x in [0, 4, 12, 99]:
        assert binary_search(items, x) == -1
    assert binary_search([], 1) == -1


def test_bounds_with_duplicates():
    items = [1, 2, 2, 2, 5]
    assert lower_bound(items, 2) == 1
    assert upper_bound(items, 2) == 4
    assert upper_bound(items, 2) - lower_bound(items, 2) == 3  # count
    assert lower_bound(items, 6) == 5 and upper_bound(items, 0) == 0


def test_random_lists_match_bisect():
    rng = random.Random(2026)
    for _ in range(2000):
        n = rng.randint(0, 30)
        items = sorted(rng.randint(0, 20) for _ in range(n))
        target = rng.randint(-1, 21)
        assert lower_bound(items, target) == bisect.bisect_left(
            items, target
        )
        assert upper_bound(items, target) == bisect.bisect_right(
            items, target
        )
        found = binary_search(items, target)
        assert (found == -1) == (target not in items)
        if found != -1:
            assert items[found] == target
