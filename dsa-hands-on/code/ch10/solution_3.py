"""Exercise 10.3: integer square root by binary search on the answer:
the largest r with r * r <= n, even for huge n."""

import math


def isqrt(n):
    lo, hi = 0, n + 1  # r is in lo..hi-1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if mid * mid <= n:
            lo = mid
        else:
            hi = mid
    return lo


for n in [0, 1, 15, 16, 10**30 + 7]:
    assert isqrt(n) == math.isqrt(n)
    print(n, isqrt(n))
