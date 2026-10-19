"""8.6 Divisible Runs: how many consecutive runs have a total divisible
by k (k > 0)?"""


def divisible_runs_brute(values, k):
    count = 0
    for i in range(len(values)):
        total = 0
        for j in range(i, len(values)):
            total += values[j]
            if total % k == 0:
                count += 1
    return count


def divisible_runs(values, k):
    seen = [0] * k  # remainder of prefix sum -> how many times
    seen[0] = 1
    prefix = 0
    count = 0
    for v in values:
        prefix = (prefix + v) % k  # Python's % is never negative here
        count += seen[prefix]
        seen[prefix] += 1
    return count


SOLUTIONS = [divisible_runs, divisible_runs_brute]
EXAMPLES = [
    (([4, 5, 0, -2, -3, 1], 5), 7),
    (([5], 9), 0),
    (([], 3), 0),
]


def random_case(rng):
    v = [rng.randint(-6, 6) for _ in range(rng.randint(0, 10))]
    return (v, rng.randint(1, 6))
