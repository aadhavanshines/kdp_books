"""10.2 First Bad Build: builds 1..n; once a build is bad, every later one
is bad too. Find the first bad one using as few checks as possible."""


def first_bad_brute(n, is_bad):
    for b in range(1, n + 1):
        if is_bad(b):
            return b
    return -1


def first_bad(n, is_bad):
    lo, hi = 1, n + 1  # the answer is in [lo, hi]; n + 1 means "none"
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(mid):
            hi = mid  # mid might be the first bad build
        else:
            lo = mid + 1  # the first bad build is after mid
    return lo if lo <= n else -1


def run(n, first, solver):
    return solver(n, lambda b: b >= first)


def find_first_bad(n, first):
    return run(n, first, first_bad)


def find_first_bad_brute(n, first):
    return run(n, first, first_bad_brute)


SOLUTIONS = [find_first_bad, find_first_bad_brute]
EXAMPLES = [((10, 7), 7), ((1, 1), 1), ((5, 99), -1)]


def random_case(rng):
    n = rng.randint(1, 40)
    return (n, rng.randint(1, n + 3))


def test():
    calls = []

    def is_bad(b):
        calls.append(b)
        return b >= 600_001

    assert first_bad(1_000_000, is_bad) == 600_001
    assert len(calls) <= 21, len(calls)  # about log2 of a million
