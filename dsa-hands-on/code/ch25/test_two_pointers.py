"""Each two-pointer solution against a brute-force one, on random
inputs."""

import itertools
import random

from two_pointers import (
    dedupe_sorted,
    is_palindrome,
    most_water,
    move_zeros,
    pair_sum_sorted,
    three_sum,
)

rng = random.Random(2026)


def small_lists(count=2000, low=-6, high=6, longest=9):
    for _ in range(count):
        yield [
            rng.randint(low, high) for _ in range(rng.randint(0, longest))
        ]


def test_pair_sum_sorted():
    for nums in small_lists():
        nums.sort()
        target = rng.randint(-12, 12)
        found = pair_sum_sorted(nums, target)
        pairs = [
            p
            for p in itertools.combinations(range(len(nums)), 2)
            if nums[p[0]] + nums[p[1]] == target
        ]
        assert (found is None) == (not pairs)
        if found:
            assert nums[found[0]] + nums[found[1]] == target


def test_dedupe_and_move_zeros():
    for nums in small_lists():
        s = sorted(nums)
        expected = sorted(set(nums))
        assert dedupe_sorted(s) == len(expected) and s == expected
        moved = list(nums)
        move_zeros(moved)
        nonzero = [x for x in nums if x]
        assert moved == nonzero + [0] * (len(nums) - len(nonzero))


def test_most_water():
    for heights in small_lists(low=0, high=9):
        best = max(
            (
                (j - i) * min(heights[i], heights[j])
                for i, j in itertools.combinations(range(len(heights)), 2)
            ),
            default=0,
        )
        assert most_water(heights) == best


def test_three_sum():
    for nums in small_lists():
        expected = sorted(
            {
                tuple(sorted(c))
                for c in itertools.combinations(nums, 3)
                if sum(c) == 0
            }
        )
        assert sorted(three_sum(nums)) == expected


def test_is_palindrome():
    assert is_palindrome("A man, a plan, a canal: Panama")
    assert not is_palindrome("race a car") and is_palindrome("")
