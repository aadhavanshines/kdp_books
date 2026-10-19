"""18.3 Fewest Coins: the fewest coins (any number of each value) that
make the amount exactly. -1 if impossible."""

from functools import cache


def fewest_coins(coins, amount):
    inf = float("inf")
    best = [0] + [inf] * amount  # best[a] = fewest coins for amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and best[a - c] + 1 < best[a]:
                best[a] = best[a - c] + 1
    return -1 if best[amount] == inf else best[amount]


def fewest_coins_memo(coins, amount):
    @cache
    def need(a):
        if a == 0:
            return 0
        options = [need(a - c) for c in coins if c <= a]
        options = [o for o in options if o >= 0]
        return 1 + min(options) if options else -1

    return need(amount)


SOLUTIONS = [fewest_coins, fewest_coins_memo]
EXAMPLES = [
    (([1, 5, 10, 25], 63), 6),
    (([2], 3), -1),
    (([1], 0), 0),
    (([1, 3, 4], 6), 2),
]


def random_case(rng):
    coins = rng.sample(range(1, 10), rng.randint(1, 3))
    return (coins, rng.randint(0, 25))
