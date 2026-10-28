"""Every sort must agree with sorted() on many random lists."""

import random

import pytest

from simple_sorts import bubble_sort, insertion_sort, selection_sort


@pytest.mark.parametrize(
    "sort", [selection_sort, insertion_sort, bubble_sort]
)
def test_matches_sorted(sort):
    rng = random.Random(2026)
    cases = [
        [],
        [1],
        [2, 1],
        [3, 3, 3],
        list(range(10)),
        list(range(9, -1, -1)),
    ]
    cases += [
        [rng.randint(-50, 50) for _ in range(rng.randint(0, 60))]
        for _ in range(300)
    ]
    for case in cases:
        items = list(case)
        sort(items)
        assert items == sorted(case)
