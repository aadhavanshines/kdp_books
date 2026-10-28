"""Fewest coins: plain recursion, recursion with a cache, and a table."""

import math
import sys

import bench
from dp_basics import fewest_coins, fewest_coins_memo

sys.setrecursionlimit(10_000)
COINS = [1, 5, 10, 25]


def plain(amount):
    if amount == 0:
        return 0
    return min(
        (plain(amount - c) + 1 for c in COINS if c <= amount),
        default=math.inf,
    )


sizes = [20, 25, 30, 35]
results = {
    "plain recursion": bench.doubling(plain, lambda n: (n,), sizes),
    "memoized": bench.doubling(
        fewest_coins_memo, lambda n: (COINS, n), sizes
    ),
    "table": bench.doubling(fewest_coins, lambda n: (COINS, n), sizes),
}
bench.table(results)
