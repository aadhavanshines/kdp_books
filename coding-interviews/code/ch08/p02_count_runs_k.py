"""8.2 Exact Total Runs: how many consecutive runs of values add up to
exactly k? Values may be negative."""


def count_runs_brute(values, k):
    count = 0
    for i in range(len(values)):
        total = 0
        for j in range(i, len(values)):
            total += values[j]
            if total == k:
                count += 1
    return count


def count_runs(values, k):
    seen = {0: 1}  # prefix sum -> how many times we've seen it
    prefix = 0
    count = 0
    for v in values:
        prefix += v
        # A run ending here sums to k when an earlier prefix was prefix-k.
        count += seen.get(prefix - k, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count


SOLUTIONS = [count_runs, count_runs_brute]
EXAMPLES = [
    (([1, 2, 3, -3, 3], 3), 5),
    (([2, 2, 2], 4), 2),
    (([], 0), 0),
    (([0, 0], 0), 3),
]


def random_case(rng):
    v = [rng.randint(-3, 3) for _ in range(rng.randint(0, 10))]
    return (v, rng.randint(-3, 5))
