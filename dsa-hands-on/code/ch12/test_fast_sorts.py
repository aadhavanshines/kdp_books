"""Merge sort and the quicksorts must agree with sorted()."""

import random

import pytest

from merge_sort import merge, merge_sort
from quicksort import quicksort, quicksort3, quicksort_naive


def cases():
    rng = random.Random(2026)
    yield from (
        [],
        [1],
        [2, 1],
        [5] * 20,
        list(range(50)),
        list(range(50, 0, -1)),
    )
    for _ in range(300):
        n = rng.randint(0, 80)
        yield [rng.randint(0, rng.choice([3, 100])) for _ in range(n)]


def test_merge():
    assert merge([1, 4, 9], [2, 3, 10, 11]) == [1, 2, 3, 4, 9, 10, 11]
    assert merge([], [1]) == [1]


def test_merge_sort_is_stable():
    items = [(1, "b"), (0, "x"), (1, "a"), (0, "y")]
    keyed = [(k, i) for i, (k, _) in enumerate(items)]  # tag positions
    assert [i for _, i in merge_sort(keyed)] == [1, 3, 0, 2]


@pytest.mark.parametrize("sort", [quicksort_naive, quicksort, quicksort3])
def test_quicksorts_match_sorted(sort):
    random.seed(1)
    for case in cases():
        items = list(case)
        sort(items)
        assert items == sorted(case)


def test_merge_sort_matches_sorted():
    for case in cases():
        assert merge_sort(case) == sorted(case)
