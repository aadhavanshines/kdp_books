"""10.1 Find in a Sorted Catalogue: index of target, or -1."""


def find_sorted_brute(items, target):
    return items.index(target) if target in items else -1


def find_sorted(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


SOLUTIONS = [find_sorted, find_sorted_brute]
EXAMPLES = [
    (([2, 5, 8, 12, 16, 23], 12), 3),
    (([2, 5, 8], 6), -1),
    (([], 1), -1),
]


def random_case(rng):
    items = sorted(
        set(rng.randint(0, 30) for _ in range(rng.randint(0, 10)))
    )
    return (items, rng.randint(0, 30))
