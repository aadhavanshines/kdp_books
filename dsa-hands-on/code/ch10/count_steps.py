"""How many steps does binary search take? range() can be indexed
like a list without storing it, so we can search a billion numbers."""


def steps_to_find(items, target):
    lo, hi, steps = 0, len(items), 0
    while lo < hi:
        steps += 1
        mid = (lo + hi) // 2
        if items[mid] == target:
            break
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return steps


for n in [1_000, 1_000_000, 1_000_000_000]:
    worst = max(steps_to_find(range(n), t) for t in (-1, 0, n - 1, n))
    print(f"{n:>13,} items: at most {worst} steps")
