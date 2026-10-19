"""21.1 The Lonely Number: every value appears twice except one. Find it
in O(n) time and O(1) extra space."""

from collections import Counter
from functools import reduce
from operator import xor


def lonely(values):
    result = 0
    for v in values:
        result ^= v  # pairs cancel out: x ^ x == 0
    return result


def lonely_reduce(values):
    return reduce(xor, values, 0)


def lonely_count(values):
    return next(v for v, c in Counter(values).items() if c == 1)


SOLUTIONS = [lonely, lonely_reduce, lonely_count]
EXAMPLES = [(([4, 1, 2, 1, 2],), 4), (([7],), 7), (([-3, 5, 5],), -3)]


def random_case(rng):
    pool = rng.sample(range(-20, 20), rng.randint(1, 6))
    values = pool[1:] * 2 + pool[:1]
    rng.shuffle(values)
    return (values,)
