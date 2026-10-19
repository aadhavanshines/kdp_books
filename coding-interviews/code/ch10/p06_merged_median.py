"""10.6 Median of Two Sorted Lists in O(log(min(m, n)))."""


def merged_median_brute(a, b):
    merged = sorted(a + b)
    n = len(merged)
    if n % 2:
        return float(merged[n // 2])
    return (merged[n // 2 - 1] + merged[n // 2]) / 2


def merged_median(a, b):
    if len(a) > len(b):
        a, b = b, a  # binary search the shorter list
    m, n = len(a), len(b)
    half = (m + n + 1) // 2  # size of the left half
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2  # take i items from a, half - i from b
        j = half - i
        a_left = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i] if i < m else float("inf")
        b_left = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j] if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1  # took too many from a
        else:
            lo = i + 1  # took too few from a
    raise ValueError("inputs must be sorted and not both empty")


SOLUTIONS = [merged_median, merged_median_brute]
EXAMPLES = [
    (([2, 9], [4]), 4.0),
    (([1, 5], [6, 8]), 5.5),
    (([], [5]), 5.0),
    (([4, 4], [4]), 4.0),
]


def random_case(rng):
    a = sorted(rng.randint(-10, 10) for _ in range(rng.randint(0, 6)))
    b = sorted(rng.randint(-10, 10) for _ in range(rng.randint(0, 6)))
    if not a and not b:
        b = [rng.randint(-10, 10)]
    return (a, b)
