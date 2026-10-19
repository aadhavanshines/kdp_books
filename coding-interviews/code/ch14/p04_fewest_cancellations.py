"""14.4 Fewest Cancellations: cancel as few bookings [start, end) as
possible so that none of the rest overlap."""

from itertools import combinations


def fewest_cancellations(bookings):
    kept_end = float("-inf")
    canceled = 0
    for start, end in sorted(bookings, key=lambda b: b[1]):
        if start >= kept_end:
            kept_end = end  # keep the booking that finishes earliest
        else:
            canceled += 1
    return canceled


def cancellations_brute(bookings):
    n = len(bookings)
    for keep in range(n, -1, -1):
        for group in combinations(sorted(bookings), keep):
            if all(a[1] <= b[0] for a, b in zip(group, group[1:])):
                return n - keep
    return n


SOLUTIONS = [fewest_cancellations, cancellations_brute]
EXAMPLES = [
    (([[1, 2], [2, 3], [3, 4], [1, 3]],), 1),
    (([[1, 2], [1, 2], [1, 2]],), 2),
    (([],), 0),
]


def random_case(rng):
    out = []
    for _ in range(rng.randint(0, 7)):
        s = rng.randint(0, 10)
        out.append([s, s + rng.randint(1, 4)])
    return (out,)
