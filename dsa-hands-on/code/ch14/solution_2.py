"""Exercise 14.2: bucket sort for floats spread evenly in [0, 1):
put each number in one of n buckets by its value, sort each small
bucket, and join them."""

import random


def bucket_sort(numbers):
    n = len(numbers)
    buckets = [[] for _ in range(n)]
    for x in numbers:
        buckets[int(x * n)].append(x)
    out = []
    for b in buckets:
        out.extend(sorted(b))  # each bucket holds about one number
    return out


rng = random.Random(2026)
data = [rng.random() for _ in range(10_000)]
assert bucket_sort(data) == sorted(data)
print([f"{x:.6f}" for x in bucket_sort(data)[:4]])
