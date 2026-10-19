"""8.4 Even Split: longest consecutive run with as many wins (1) as
losses (0)."""


def even_split_brute(results):
    best = 0
    for i in range(len(results)):
        ones = 0
        for j in range(i, len(results)):
            ones += results[j]
            if 2 * ones == j - i + 1:
                best = max(best, j - i + 1)
    return best


def even_split(results):
    first_seen = {0: -1}  # balance -> first index where it occurred
    balance = 0
    best = 0
    for i, r in enumerate(results):
        balance += 1 if r == 1 else -1
        if balance in first_seen:
            best = max(best, i - first_seen[balance])
        else:
            first_seen[balance] = i
    return best


SOLUTIONS = [even_split, even_split_brute]
EXAMPLES = [
    (([0, 1, 1, 0, 1, 1, 1, 0],), 4),
    (([1, 1, 1],), 0),
    (([0, 1],), 2),
    (([],), 0),
]


def random_case(rng):
    return ([rng.randint(0, 1) for _ in range(rng.randint(0, 12))],)
