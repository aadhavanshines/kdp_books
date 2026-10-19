"""10.5 Integer Square Root: the largest r with r * r <= n, without
using math.sqrt or ** 0.5."""

import math


def integer_root_library(n):
    return math.isqrt(n)


def integer_root(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2  # round up so the loop always moves
        if mid * mid <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo


SOLUTIONS = [integer_root, integer_root_library]
EXAMPLES = [((0,), 0), ((1,), 1), ((8,), 2), ((9,), 3), ((10**12,), 10**6)]


def random_case(rng):
    return (rng.randint(0, 10**9),)
