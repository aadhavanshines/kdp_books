"""5.4 Longest Unbroken Streak: longest run of consecutive day numbers."""


def longest_streak_sorting(days):
    if not days:
        return 0
    days = sorted(set(days))
    best = run = 1
    for a, b in zip(days, days[1:]):
        run = run + 1 if b == a + 1 else 1
        best = max(best, run)
    return best


def longest_streak(days):
    present = set(days)
    best = 0
    for d in present:
        if d - 1 in present:
            continue  # not the start of a streak
        end = d
        while end + 1 in present:
            end += 1
        best = max(best, end - d + 1)
    return best


SOLUTIONS = [longest_streak, longest_streak_sorting]
EXAMPLES = [
    (([5, 2, 99, 3, 4, 100],), 4),
    (([],), 0),
    (([7, 7, 7],), 1),
    (([-1, 0, 1],), 3),
]


def random_case(rng):
    return ([rng.randint(-5, 15) for _ in range(rng.randint(0, 15))],)
