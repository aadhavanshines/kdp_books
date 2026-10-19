"""18.2 Quiet Street: collect donations from houses in a row, but never
from two neighbouring houses. What is the largest total?"""

from itertools import product


def quiet_street(gifts):
    take, skip = 0, 0  # best totals if the last house was taken/skipped
    for g in gifts:
        take, skip = skip + g, max(take, skip)
    return max(take, skip)


def quiet_street_brute(gifts):
    best = 0
    for picks in product((0, 1), repeat=len(gifts)):
        if all(not (a and b) for a, b in zip(picks, picks[1:])):
            best = max(best, sum(g for g, p in zip(gifts, picks) if p))
    return best


SOLUTIONS = [quiet_street, quiet_street_brute]
EXAMPLES = [(([2, 7, 9, 3, 1],), 12), (([],), 0), (([5, 1, 1, 5],), 10)]


def random_case(rng):
    return ([rng.randint(0, 9) for _ in range(rng.randint(0, 10))],)
