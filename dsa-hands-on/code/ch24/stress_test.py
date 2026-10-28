"""A stress test: compare a fast solution with a brute-force one on
thousands of small random inputs. The first difference is a bug, and
the input is small enough to debug by hand."""

import random

from two_sum import two_sum_brute, two_sum_hash, two_sum_sorted


def valid(answer, nums, target, brute_answer):
    """Is answer right? There may be several right pairs, so check the
    pair itself rather than comparing it with brute force's pair."""
    if answer is None:
        return brute_answer is None
    i, j = answer
    return 0 <= i < j < len(nums) and nums[i] + nums[j] == target


def stress(fast, slow, make_input, tries=5000, seed=2026):
    rng = random.Random(seed)
    for t in range(tries):
        nums, target = make_input(rng)
        answer = fast(nums, target)
        if not valid(answer, nums, target, slow(nums, target)):
            return f"FAILED on try {t}: {nums}, {target} -> {answer}"
    return f"passed {tries} random tests"


def small_case(rng):
    nums = [rng.randint(-5, 5) for _ in range(rng.randint(0, 6))]
    return nums, rng.randint(-6, 6)


def two_sum_buggy(nums, target):
    """Looks fine, but may use the same position twice."""
    seen = {x: i for i, x in enumerate(nums)}
    for i, x in enumerate(nums):
        if target - x in seen:
            return tuple(sorted((i, seen[target - x])))
    return None


print("hash:  ", stress(two_sum_hash, two_sum_brute, small_case))
print("sorted:", stress(two_sum_sorted, two_sum_brute, small_case))
print("buggy: ", stress(two_sum_buggy, two_sum_brute, small_case))
