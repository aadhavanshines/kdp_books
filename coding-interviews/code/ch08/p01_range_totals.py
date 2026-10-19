"""8.1 Range Totals: answer many "total from day a to day b" questions."""


class RangeTotals:
    def __init__(self, values):
        # prefix[i] = sum of the first i values
        self.prefix = [0]
        for v in values:
            self.prefix.append(self.prefix[-1] + v)

    def total(self, a, b):
        """Sum of values[a] .. values[b], inclusive."""
        return self.prefix[b + 1] - self.prefix[a]


def range_totals(values, queries):
    rt = RangeTotals(values)
    return [rt.total(a, b) for a, b in queries]


def range_totals_brute(values, queries):
    return [sum(values[a : b + 1]) for a, b in queries]


SOLUTIONS = [range_totals, range_totals_brute]
EXAMPLES = [
    (([4, -2, 7, 1, 3], [(0, 2), (1, 4), (3, 3)]), [9, 9, 1]),
]


def random_case(rng):
    n = rng.randint(1, 10)
    vals = [rng.randint(-5, 9) for _ in range(n)]
    qs = []
    for _ in range(5):
        a = rng.randint(0, n - 1)
        qs.append((a, rng.randint(a, n - 1)))
    return (vals, qs)
