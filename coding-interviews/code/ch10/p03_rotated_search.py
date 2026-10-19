"""10.3 Rotated Catalogue: a sorted list of distinct values was rotated
(e.g. [9, 12, 1, 4, 7]). Find target's index in O(log n), or -1."""


def rotated_search_brute(items, target):
    return items.index(target) if target in items else -1


def rotated_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[lo] <= items[mid]:  # left half is sorted
            if items[lo] <= target < items[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:  # right half is sorted
            if items[mid] < target <= items[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


SOLUTIONS = [rotated_search, rotated_search_brute]
EXAMPLES = [
    (([9, 12, 1, 4, 7], 4), 3),
    (([9, 12, 1, 4, 7], 10), -1),
    (([5], 5), 0),
    (([], 3), -1),
]


def random_case(rng):
    items = sorted(
        set(rng.randint(0, 40) for _ in range(rng.randint(0, 10)))
    )
    k = rng.randint(0, len(items))
    return (items[k:] + items[:k], rng.randint(0, 40))
