"""Time the naive and the memoized Fibonacci."""

from functools import cache

import bench


def fib_naive(n):
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)


def fib_memo(n):
    @cache
    def f(k):
        return k if k < 2 else f(k - 1) + f(k - 2)

    return f(n)  # a fresh cache every call, so each call does the work


sizes = [16, 18, 20, 22, 24]
results = {
    "naive": bench.doubling(fib_naive, lambda n: (n,), sizes),
    "memoized": bench.doubling(fib_memo, lambda n: (n,), sizes),
}
bench.table(results)
