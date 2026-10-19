"""6.5 Merge Two Logs: merge two sorted lists of timestamps into one."""


def merge_logs_simple(a, b):
    return sorted(a + b)


def merge_logs(a, b):
    i = j = 0
    merged = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            merged.append(a[i])
            i += 1
        else:
            merged.append(b[j])
            j += 1
    merged.extend(a[i:])  # at most one of these is non-empty
    merged.extend(b[j:])
    return merged


SOLUTIONS = [merge_logs, merge_logs_simple]
EXAMPLES = [
    (([1, 4, 9], [2, 3, 10, 11]), [1, 2, 3, 4, 9, 10, 11]),
    (([], [5]), [5]),
    (([2, 2], [2]), [2, 2, 2]),
]


def random_case(rng):
    a = sorted(rng.randint(0, 20) for _ in range(rng.randint(0, 6)))
    b = sorted(rng.randint(0, 20) for _ in range(rng.randint(0, 6)))
    return (a, b)
