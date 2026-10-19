"""8.3 Balance Point: the leftmost index where the sum of everything to
its left equals the sum of everything to its right, or -1."""


def balance_point_brute(values):
    for i in range(len(values)):
        if sum(values[:i]) == sum(values[i + 1 :]):
            return i
    return -1


def balance_point(values):
    total = sum(values)
    left = 0
    for i, v in enumerate(values):
        if left == total - left - v:
            return i
        left += v
    return -1


SOLUTIONS = [balance_point, balance_point_brute]
EXAMPLES = [
    (([2, 3, -1, 8, 4],), 3),
    (([1, 2, 3],), -1),
    (([5],), 0),
    (([],), -1),
]


def random_case(rng):
    return ([rng.randint(-3, 4) for _ in range(rng.randint(0, 8))],)
