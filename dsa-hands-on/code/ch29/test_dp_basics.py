"""The DP solutions against exhaustive search on small inputs."""

import itertools
import random

from dp_basics import (
    climb_ways,
    coin_ways,
    fewest_coins,
    fewest_coins_memo,
    min_path_sum,
    rob,
)

rng = random.Random(2026)


def test_climb_ways():
    for n in range(12):
        # every sequence of 1s and 2s with sum n
        count = sum(
            1
            for k in range(n + 1)
            for steps in itertools.product((1, 2), repeat=k)
            if sum(steps) == n
        )
        assert climb_ways(n) == count


def test_rob():
    for _ in range(500):
        houses = [rng.randint(0, 9) for _ in range(rng.randint(0, 9))]
        best = 0
        for mask in range(1 << len(houses)):
            if mask & (mask >> 1) == 0:  # no two neighbors
                best = max(
                    best,
                    sum(h for i, h in enumerate(houses) if mask >> i & 1),
                )
        assert rob(houses) == best


def test_coins():
    for _ in range(300):
        coins = sorted(
            set(rng.randint(1, 9) for _ in range(rng.randint(1, 3)))
        )
        amount = rng.randint(0, 20)
        combos = [
            combo
            for k in range(amount + 1)
            for combo in itertools.combinations_with_replacement(coins, k)
            if sum(combo) == amount
        ]
        fewest = min((len(c) for c in combos), default=-1)
        assert fewest_coins(coins, amount) == fewest
        assert fewest_coins_memo(coins, amount) == fewest
        assert coin_ways(coins, amount) == len(combos)


def test_min_path_sum():
    for _ in range(300):
        rows, cols = rng.randint(1, 4), rng.randint(1, 4)
        grid = [
            [rng.randint(0, 9) for _ in range(cols)] for _ in range(rows)
        ]
        best = min(
            sum(grid[r][c] for r, c in path) for path in paths(rows, cols)
        )
        assert min_path_sum(grid) == best


def paths(rows, cols):
    """Every right/down path from (0, 0) to the bottom-right corner."""
    moves = rows - 1 + cols - 1
    for downs in itertools.combinations(range(moves), rows - 1):
        r = c = 0
        cells = [(0, 0)]
        for m in range(moves):
            if m in downs:
                r += 1
            else:
                c += 1
            cells.append((r, c))
        yield cells
