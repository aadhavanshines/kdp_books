"""Greedy answers checked by trying everything; backtracking checked
against itertools and known counts."""

import itertools
import random

from backtracking import combination_sum, permutations, queens, subsets
from greedy import (
    can_reach_end,
    merge_intervals,
    most_meetings,
    rooms_needed,
)

rng = random.Random(2026)


def random_meetings():
    out = []
    for _ in range(rng.randint(0, 7)):
        start = rng.randint(0, 10)
        out.append((start, start + rng.randint(1, 4)))
    return out


def overlap(a, b):
    return a[0] < b[1] and b[0] < a[1]


def test_most_meetings_is_optimal():
    for _ in range(500):
        m = random_meetings()
        best = max(
            (
                len(s)
                for k in range(len(m) + 1)
                for s in itertools.combinations(m, k)
                if not any(
                    overlap(a, b) for a, b in itertools.combinations(s, 2)
                )
            ),
        )
        chosen = most_meetings(m)
        assert len(chosen) == best
        assert not any(
            overlap(a, b) for a, b in itertools.combinations(chosen, 2)
        )


def test_rooms_needed():
    for _ in range(500):
        m = random_meetings()
        busiest = max(
            (sum(s <= t < e for s, e in m) for t in range(20)), default=0
        )
        assert rooms_needed(m) == busiest


def test_merge_and_jumps():
    assert merge_intervals([(1, 3), (2, 6), (8, 10), (9, 12)]) == [
        [1, 6],
        [8, 12],
    ]
    assert can_reach_end([2, 3, 1, 1, 4]) and not can_reach_end(
        [3, 2, 1, 0, 4]
    )


def test_backtracking():
    items = [1, 2, 3, 4]
    assert sorted(map(tuple, subsets(items))) == sorted(
        c for k in range(5) for c in itertools.combinations(items, k)
    )
    assert permutations(items) == [
        list(p) for p in itertools.permutations(items)
    ]
    assert combination_sum([2, 3, 6, 7], 7) == [[2, 2, 3], [7]]
    assert [queens(n) for n in range(1, 9)] == [1, 0, 0, 2, 10, 4, 40, 92]
