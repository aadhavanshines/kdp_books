"""14.5 Reach the Last Stone: from stone i you may jump up to hops[i]
stones forward. Can you reach the last stone from the first?"""


def reach_last(hops):
    farthest = 0
    for i, h in enumerate(hops):
        if i > farthest:
            return False  # this stone can't be reached
        farthest = max(farthest, i + h)
    return True


def reach_last_brute(hops):
    n = len(hops)
    ok = [False] * n
    if n:
        ok[n - 1] = True
    for i in range(n - 2, -1, -1):
        ok[i] = any(ok[j] for j in range(i + 1, min(n, i + hops[i] + 1)))
    return ok[0] if n else True


SOLUTIONS = [reach_last, reach_last_brute]
EXAMPLES = [
    (([1, 3, 0, 1, 2, 0],), True),
    (([2, 1, 0, 3],), False),
    (([0],), True),
]


def random_case(rng):
    return ([rng.randint(0, 3) for _ in range(rng.randint(1, 10))],)
