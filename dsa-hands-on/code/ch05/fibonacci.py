"""Fibonacci three ways, counting the calls each one makes."""

from functools import cache

calls = 0


def fib_naive(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)


@cache  # remembers every answer it has computed
def fib_memo(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib_memo(n - 1) + fib_memo(n - 2)


def fib_loop(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


for n in [10, 20, 25]:
    calls = 0
    answer = fib_naive(n)
    naive_calls = calls
    calls = 0
    fib_memo.cache_clear()
    assert fib_memo(n) == answer == fib_loop(n)
    print(
        f"fib({n}) = {answer:,}: naive {naive_calls:,} calls, "
        f"memoized {calls} calls"
    )
