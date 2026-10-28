"""Exercise 2.2: largest() with best = 0 is wrong whenever every number
is negative. The random test finds such a list quickly, because many
random lists are short, and a list of one negative number is enough."""

import random


def largest_buggy(numbers):
    best = 0  # the bug: 0 may be bigger than every item
    for x in numbers:
        if x > best:
            best = x
    return best


print(largest_buggy([-5, -2, -9]), "instead of", max([-5, -2, -9]))

rng = random.Random(2026)
for attempt in range(1, 1001):
    nums = [rng.randint(-100, 100) for _ in range(rng.randint(1, 50))]
    if largest_buggy(nums) != max(nums):
        print(f"random list number {attempt} exposes it: {nums}")
        break
