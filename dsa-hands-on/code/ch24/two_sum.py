"""One problem, three solutions: find two positions whose numbers add
up to target. Return them as (i, j) with i < j, or None."""


def two_sum_brute(nums, target):
    """Try every pair: O(n^2) time, O(1) extra memory."""
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return i, j
    return None


def two_sum_sorted(nums, target):
    """Sort the positions by value, then move two pointers inward:
    O(n log n) time, O(n) memory."""
    order = sorted(range(len(nums)), key=nums.__getitem__)
    lo, hi = 0, len(order) - 1
    while lo < hi:
        total = nums[order[lo]] + nums[order[hi]]
        if total == target:
            return tuple(sorted((order[lo], order[hi])))
        if total < target:
            lo += 1
        else:
            hi -= 1
    return None


def two_sum_hash(nums, target):
    """Remember where each number was seen; look up its partner:
    O(n) time, O(n) memory."""
    seen = {}
    for j, x in enumerate(nums):
        if target - x in seen:
            return seen[target - x], j
        seen[x] = j
    return None
