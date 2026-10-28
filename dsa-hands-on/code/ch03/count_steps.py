"""Count the basic steps two functions take, as n grows."""


def find(items, target):
    """Linear search. Returns (index or -1, comparisons made)."""
    steps = 0
    for i, x in enumerate(items):
        steps += 1
        if x == target:
            return i, steps
    return -1, steps


def has_duplicate(items):
    """Compare every pair. Returns (answer, comparisons made)."""
    steps = 0
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            steps += 1
            if items[i] == items[j]:
                return True, steps
    return False, steps


print(f"{'n':>6} {'find: steps':>12} {'duplicates: steps':>18}")
for n in [10, 20, 40, 80, 160]:
    items = list(range(n))
    _, find_steps = find(items, -1)  # not there: the worst case
    _, pair_steps = has_duplicate(items)  # no duplicates: the worst case
    print(f"{n:>6} {find_steps:>12,} {pair_steps:>18,}")
