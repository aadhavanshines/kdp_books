"""The sequence DPs against exhaustive search on small inputs."""

import itertools
import random

from dp_sequences import edit_distance, knapsack, lcs, lis, lis_quadratic

rng = random.Random(2026)


def subsequences(s):
    for k in range(len(s) + 1):
        yield from itertools.combinations(s, k)


def test_lcs():
    for _ in range(500):
        a = "".join(rng.choices("abc", k=rng.randint(0, 6)))
        b = "".join(rng.choices("abc", k=rng.randint(0, 6)))
        common = set(subsequences(a)) & set(subsequences(b))
        found = lcs(a, b)
        assert len(found) == max(map(len, common))
        assert tuple(found) in common


def test_edit_distance():
    def slow(a, b):  # plain recursion: tries everything
        if not a or not b:
            return len(a) + len(b)
        if a[0] == b[0]:
            return slow(a[1:], b[1:])
        return 1 + min(slow(a[1:], b), slow(a, b[1:]), slow(a[1:], b[1:]))

    for _ in range(500):
        a = "".join(rng.choices("ab", k=rng.randint(0, 6)))
        b = "".join(rng.choices("ab", k=rng.randint(0, 6)))
        assert edit_distance(a, b) == slow(a, b)
    assert edit_distance("kitten", "sitting") == 3


def test_knapsack():
    for _ in range(300):
        items = [
            (rng.randint(1, 8), rng.randint(1, 20))
            for _ in range(rng.randint(0, 7))
        ]
        cap = rng.randint(0, 20)
        best = max(
            sum(v for _, v in chosen)
            for chosen in subsequences(items)
            if sum(w for w, _ in chosen) <= cap
        )
        assert knapsack(items, cap) == best


def test_lis():
    for _ in range(500):
        nums = [rng.randint(0, 9) for _ in range(rng.randint(0, 9))]
        best = max(
            (
                len(s)
                for s in subsequences(nums)
                if all(x < y for x, y in zip(s, s[1:]))
            ),
            default=0,
        )
        assert lis(nums) == lis_quadratic(nums) == best
