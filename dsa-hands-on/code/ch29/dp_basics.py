"""Dynamic programming: solve each smaller problem once, store the
answer, and build bigger answers from smaller ones."""

import math
from functools import cache


def climb_ways(n):
    """Ways to climb n stairs taking 1 or 2 at a time. The last step was
    a 1 or a 2, so ways(n) = ways(n - 1) + ways(n - 2)."""
    a, b = 1, 1  # ways(0), ways(1)
    for _ in range(n - 1):
        a, b = b, a + b
    return b if n else 1


def rob(houses):
    """The most money from houses in a row, never two neighbors. Each
    house: skip it (best so far) or take it (best two back + it)."""
    two_back = one_back = 0
    for money in houses:
        two_back, one_back = one_back, max(one_back, two_back + money)
    return one_back


def fewest_coins_memo(coins, amount):
    """Top-down: recursion plus a cache."""

    @cache
    def best(a):
        if a == 0:
            return 0
        options = [best(a - c) + 1 for c in coins if c <= a]
        return min(options, default=math.inf)

    answer = best(amount)
    return -1 if answer == math.inf else answer


def fewest_coins(coins, amount):
    """Bottom-up: fill a table from 0 up to amount. table[a] is the
    fewest coins that make a (inf if none)."""
    table = [0] + [math.inf] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and table[a - c] + 1 < table[a]:
                table[a] = table[a - c] + 1
    return -1 if table[amount] == math.inf else table[amount]


def coin_ways(coins, amount):
    """How many combinations of coins make amount (order doesn't
    matter). Looping over coins on the outside counts each combination
    once."""
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]


def min_path_sum(grid):
    """The cheapest path from top-left to bottom-right moving only right
    or down: each cell's best is its cost plus the better of the cells
    above and to the left."""
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            above = best[r - 1][c] if r else math.inf
            left = best[r][c - 1] if c else math.inf
            start = 0 if r == c == 0 else min(above, left)
            best[r][c] = grid[r][c] + start
    return best[-1][-1]
