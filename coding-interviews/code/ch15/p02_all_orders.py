"""15.2 All Orders: every ordering of distinct items."""

from itertools import permutations


def all_orders(items):
    out = []
    order = []
    used = [False] * len(items)

    def place():
        if len(order) == len(items):
            out.append(order[:])
            return
        for i, item in enumerate(items):
            if not used[i]:
                used[i] = True
                order.append(item)
                place()
                order.pop()
                used[i] = False

    place()
    return out


def all_orders_lib(items):
    return [list(p) for p in permutations(items)]


SOLUTIONS = [all_orders, all_orders_lib]
EXAMPLES = [
    (
        ([1, 2, 3],),
        [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]],
    ),
    (([],), [[]]),
]


def random_case(rng):
    return (list(range(rng.randint(0, 5))),)
