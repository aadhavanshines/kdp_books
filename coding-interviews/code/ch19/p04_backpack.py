"""19.4 Backpack: items have weights and values; each can be packed once.
What is the most value that fits within the capacity?"""

from itertools import product


def backpack(weights, values, capacity):
    best = [0] * (capacity + 1)  # best[c]: most value within capacity c
    for w, v in zip(weights, values):
        for c in range(capacity, w - 1, -1):  # backwards: use item once
            best[c] = max(best[c], best[c - w] + v)
    return best[capacity]


def backpack_brute(weights, values, capacity):
    best = 0
    for picks in product((0, 1), repeat=len(weights)):
        w = sum(x for x, p in zip(weights, picks) if p)
        if w <= capacity:
            best = max(best, sum(x for x, p in zip(values, picks) if p))
    return best


SOLUTIONS = [backpack, backpack_brute]
EXAMPLES = [
    (([1, 3, 4, 5], [1, 4, 5, 7], 7), 9),
    (([], [], 5), 0),
    (([6], [10], 5), 0),
]


def random_case(rng):
    n = rng.randint(0, 8)
    return (
        [rng.randint(1, 6) for _ in range(n)],
        [rng.randint(0, 9) for _ in range(n)],
        rng.randint(0, 15),
    )
