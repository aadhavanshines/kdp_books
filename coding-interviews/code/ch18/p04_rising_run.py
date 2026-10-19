"""18.4 Longest Rising Sequence: the length of the longest strictly
increasing subsequence (not necessarily consecutive)."""

from bisect import bisect_left


def rising_quadratic(values):
    best = [1] * len(values)  # best[i]: longest ending at values[i]
    for i in range(len(values)):
        for j in range(i):
            if values[j] < values[i]:
                best[i] = max(best[i], best[j] + 1)
    return max(best, default=0)


def rising(values):
    tails = []  # tails[k]: smallest tail of a rising run of length k+1
    for v in values:
        k = bisect_left(tails, v)
        if k == len(tails):
            tails.append(v)
        else:
            tails[k] = v  # a smaller tail is easier to extend later
    return len(tails)


SOLUTIONS = [rising, rising_quadratic]
EXAMPLES = [
    (([3, 8, 4, 5, 1, 9, 6, 7],), 5),
    (([7, 7, 7],), 1),
    (([],), 0),
]


def random_case(rng):
    return ([rng.randint(0, 15) for _ in range(rng.randint(0, 12))],)
