"""18.1 Stair Ways: how many ways to climb n steps taking 1 or 2 at a time?"""

from functools import cache


def stair_ways_brute(n):
    if n <= 1:
        return 1
    return stair_ways_brute(n - 1) + stair_ways_brute(n - 2)


@cache
def stair_ways_memo(n):
    if n <= 1:
        return 1
    return stair_ways_memo(n - 1) + stair_ways_memo(n - 2)


def stair_ways(n):
    a, b = 1, 1  # ways to reach steps i - 1 and i
    for _ in range(n - 1):
        a, b = b, a + b
    return b


SOLUTIONS = [stair_ways, stair_ways_memo, stair_ways_brute]
EXAMPLES = [((1,), 1), ((2,), 2), ((5,), 8), ((0,), 1)]


def random_case(rng):
    return (rng.randint(0, 20),)


def test():
    assert stair_ways(90) == stair_ways_memo(90)
