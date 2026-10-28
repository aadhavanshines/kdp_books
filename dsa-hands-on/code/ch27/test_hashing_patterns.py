"""The hash-map and prefix-sum solutions against brute force."""

import random

from hashing_patterns import (
    count_subarrays_with_sum,
    first_unique,
    group_anagrams,
    longest_consecutive,
    prefix_sums,
)

rng = random.Random(2026)


def test_group_anagrams():
    groups = group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    assert sorted(map(sorted, groups)) == [
        ["ate", "eat", "tea"],
        ["bat"],
        ["nat", "tan"],
    ]


def test_first_unique():
    for _ in range(2000):
        s = "".join(rng.choices("abc", k=rng.randint(0, 8)))
        expected = next((i for i, c in enumerate(s) if s.count(c) == 1), -1)
        assert first_unique(s) == expected


def test_longest_consecutive():
    for _ in range(2000):
        nums = [rng.randint(-10, 10) for _ in range(rng.randint(0, 12))]
        best = 0
        for start in nums:
            n = 0
            while start + n in nums:
                n += 1
            best = max(best, n)
        assert longest_consecutive(nums) == best


def test_prefix_sums_and_subarrays():
    for _ in range(2000):
        nums = [rng.randint(-3, 3) for _ in range(rng.randint(0, 10))]
        prefix = prefix_sums(nums)
        k = rng.randint(-4, 4)
        brute = 0
        for i in range(len(nums)):
            for j in range(i + 1, len(nums) + 1):
                assert prefix[j] - prefix[i] == sum(nums[i:j])
                brute += sum(nums[i:j]) == k
        assert count_subarrays_with_sum(nums, k) == brute
