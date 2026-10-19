"""15.3 Exact Change: all combinations of coin values (each value usable
any number of times) that add up to the amount. Values are distinct and
positive; list each combination in non-decreasing order."""


def exact_change(coins, amount):
    coins = sorted(coins)
    out, combo = [], []

    def pick(start, remaining):
        if remaining == 0:
            out.append(combo[:])
            return
        for i in range(start, len(coins)):
            if coins[i] > remaining:
                break  # sorted, so every later coin is too big as well
            combo.append(coins[i])
            pick(i, remaining - coins[i])  # i again: reuse allowed
            combo.pop()

    pick(0, amount)
    return out


def exact_change_brute(coins, amount):
    found = set()

    def grow(combo, total):
        if total == amount:
            found.add(tuple(sorted(combo)))
            return
        for c in coins:
            if total + c <= amount:
                grow(combo + [c], total + c)

    grow([], 0)
    return sorted(list(t) for t in found)


SOLUTIONS = [exact_change, exact_change_brute]
EXAMPLES = [
    (([2, 3, 6, 7], 7), [[2, 2, 3], [7]]),
    (([2], 1), []),
    (([5], 0), [[]]),
]


def random_case(rng):
    coins = rng.sample(range(1, 8), rng.randint(1, 3))
    return (coins, rng.randint(0, 10))
