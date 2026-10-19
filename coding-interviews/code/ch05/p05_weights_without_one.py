"""5.5 Product Without Me: product of all other values, without division."""


def without_one_brute(values):
    out = []
    for i in range(len(values)):
        p = 1
        for j, v in enumerate(values):
            if j != i:
                p *= v
        out.append(p)
    return out


def without_one(values):
    n = len(values)
    out = [1] * n
    left = 1
    for i in range(n):  # out[i] = product of everything to the left
        out[i] = left
        left *= values[i]
    right = 1
    for i in range(n - 1, -1, -1):  # times everything to the right
        out[i] *= right
        right *= values[i]
    return out


SOLUTIONS = [without_one, without_one_brute]
EXAMPLES = [
    (([2, 3, 4, 5],), [60, 40, 30, 24]),
    (([4, 0, 2],), [0, 8, 0]),
    (([0, 0, 3],), [0, 0, 0]),
    (([9],), [1]),
]


def random_case(rng):
    return ([rng.randint(-3, 5) for _ in range(rng.randint(1, 8))],)
