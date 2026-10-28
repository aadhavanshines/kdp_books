"""Each sliding-window solution against a brute-force one."""

import random

from window import (
    longest_unique,
    max_sum_k,
    min_window,
    shortest_with_sum,
    window_maxima,
)

rng = random.Random(2026)


def test_max_sum_and_maxima():
    for _ in range(2000):
        nums = [rng.randint(-9, 9) for _ in range(rng.randint(1, 12))]
        k = rng.randint(1, len(nums))
        windows = [nums[i : i + k] for i in range(len(nums) - k + 1)]
        assert max_sum_k(nums, k) == max(map(sum, windows))
        assert window_maxima(nums, k) == [max(w) for w in windows]


def test_longest_unique():
    for _ in range(2000):
        s = "".join(rng.choices("abcd", k=rng.randint(0, 12)))
        best = max(
            (
                j - i
                for i in range(len(s))
                for j in range(i + 1, len(s) + 1)
                if len(set(s[i:j])) == j - i
            ),
            default=0,
        )
        assert longest_unique(s) == best


def test_shortest_with_sum():
    for _ in range(2000):
        nums = [rng.randint(1, 9) for _ in range(rng.randint(0, 12))]
        target = rng.randint(1, 30)
        lengths = [
            j - i
            for i in range(len(nums))
            for j in range(i + 1, len(nums) + 1)
            if sum(nums[i:j]) >= target
        ]
        assert shortest_with_sum(nums, target) == min(lengths, default=0)


def test_min_window():
    from collections import Counter

    for _ in range(1000):
        s = "".join(rng.choices("abc", k=rng.randint(0, 10)))
        t = "".join(rng.choices("abc", k=rng.randint(1, 3)))
        fits = [
            s[i:j]
            for i in range(len(s))
            for j in range(i + 1, len(s) + 1)
            if not Counter(t) - Counter(s[i:j])
        ]
        found = min_window(s, t)
        assert len(found) == min(map(len, fits), default=0)
        assert not fits or not Counter(t) - Counter(found)
