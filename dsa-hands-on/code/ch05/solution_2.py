"""Exercise 5.2: ways to make an amount from coins 1, 2 and 5. Either
use the biggest remaining coin type at least once, or never use it."""

import itertools
from functools import cache

COINS = (1, 2, 5)


@cache
def ways(amount, kinds=len(COINS)):
    if amount == 0:
        return 1  # one way: no more coins
    if amount < 0 or kinds == 0:
        return 0
    coin = COINS[kinds - 1]
    return ways(amount - coin, kinds) + ways(amount, kinds - 1)


def brute(amount):
    return sum(
        1
        for a, b, c in itertools.product(range(amount + 1), repeat=3)
        if a * 1 + b * 2 + c * 5 == amount
    )


print([ways(a) for a in range(11)])
assert [ways(a) for a in range(11)] == [brute(a) for a in range(11)]
print(ways(1000))
