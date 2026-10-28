"""Exercise 2.1: the smallest and largest items in one pass, comparing
items in pairs: about 3 comparisons per 2 items instead of 4."""

import random


def min_and_max(numbers):
    if not numbers:
        raise ValueError("min_and_max() of an empty list")
    lo = hi = numbers[0]
    for i in range(1, len(numbers) - 1, 2):
        a, b = numbers[i], numbers[i + 1]
        if a > b:
            a, b = b, a  # 1 comparison: now a <= b
        lo = min(lo, a)  # the smaller can only be a new minimum
        hi = max(hi, b)  # the larger can only be a new maximum
    if len(numbers) % 2 == 0:  # one item left over at the end
        lo, hi = min(lo, numbers[-1]), max(hi, numbers[-1])
    return lo, hi


rng = random.Random(2026)
for _ in range(1000):
    nums = [rng.randint(-100, 100) for _ in range(rng.randint(1, 50))]
    assert min_and_max(nums) == (min(nums), max(nums))
print(min_and_max([3, -1, 4, 1, -5, 9, 2]))
print("1,000 random lists: all agree with min() and max()")
