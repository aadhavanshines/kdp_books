"""14.1 Merge Bookings: combine overlapping [start, end] bookings.
Bookings that touch (end == next start) are merged too."""


def merge_bookings(bookings):
    merged = []
    for start, end in sorted(bookings):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)  # extend the last one
        else:
            merged.append([start, end])
    return merged


def merge_bookings_brute(bookings):
    if not bookings:
        return []
    hi = max(e for _, e in bookings)
    covered = [False] * (2 * hi + 2)  # half-steps so touching works
    points = set()
    for s, e in bookings:
        points.add(2 * s)
        for x in range(2 * s, 2 * e + 1):
            covered[x] = True
    out, x = [], 0
    while x < len(covered):
        if covered[x]:
            start = x
            while x + 1 < len(covered) and covered[x + 1]:
                x += 1
            out.append([start // 2, x // 2])
        x += 1
    return out


SOLUTIONS = [merge_bookings, merge_bookings_brute]
EXAMPLES = [
    (([[1, 3], [8, 10], [2, 6], [15, 18]],), [[1, 6], [8, 10], [15, 18]]),
    (([[1, 4], [4, 5]],), [[1, 5]]),
    (([],), []),
]


def random_case(rng):
    out = []
    for _ in range(rng.randint(0, 6)):
        s = rng.randint(0, 12)
        out.append([s, s + rng.randint(0, 4)])
    return (out,)
