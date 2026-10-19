"""5.1 Budget Pair: two prices that add up to exactly the budget."""


def budget_pair_brute(prices, budget):
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            if prices[i] + prices[j] == budget:
                return [i, j]
    return []


def budget_pair(prices, budget):
    seen = {}  # price -> index where we saw it
    for i, price in enumerate(prices):
        need = budget - price
        if need in seen:
            return [seen[need], i]
        seen[price] = i
    return []


SOLUTIONS = [budget_pair, budget_pair_brute]
EXAMPLES = [
    (([12, 7, 30, 18], 25), [1, 3]),
    (([5, 5], 10), [0, 1]),
    (([3, 8, 1], 100), []),
    (([], 4), []),
]


def CHECK(args, result):
    prices, budget = args
    if result == []:
        return budget_pair_brute(prices, budget) == []
    i, j = result
    return i < j and prices[i] + prices[j] == budget


def random_case(rng):
    n = rng.randint(0, 12)
    prices = [rng.randint(1, 20) for _ in range(n)]
    return (prices, rng.randint(2, 40))
