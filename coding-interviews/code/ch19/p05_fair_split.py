"""19.5 Fair Split: can the parcels be divided into two groups of exactly
equal total weight?"""

from itertools import product


def fair_split(weights):
    total = sum(weights)
    if total % 2:
        return False
    reachable = {0}  # sums that some group of parcels can make
    for w in weights:
        reachable |= {s + w for s in reachable}
    return total // 2 in reachable


def fair_split_bits(weights):
    total = sum(weights)
    if total % 2:
        return False
    sums = 1  # bit s is set when sum s is reachable
    for w in weights:
        sums |= sums << w
    return bool(sums >> (total // 2) & 1)


def fair_split_brute(weights):
    total = sum(weights)
    return any(
        2 * sum(w for w, p in zip(weights, picks) if p) == total
        for picks in product((0, 1), repeat=len(weights))
    )


SOLUTIONS = [fair_split, fair_split_bits, fair_split_brute]
EXAMPLES = [
    (([3, 1, 4, 2, 2],), True),
    (([1, 2, 4, 9],), False),
    (([],), True),
]


def random_case(rng):
    return ([rng.randint(1, 9) for _ in range(rng.randint(0, 10))],)
