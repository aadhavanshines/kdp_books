"""14.2 Insert a Booking into a sorted list of non-overlapping bookings,
merging where needed."""


def insert_booking(bookings, new):
    start, end = new
    out = []
    i = 0
    while i < len(bookings) and bookings[i][1] < start:
        out.append(bookings[i])  # entirely before the new booking
        i += 1
    while i < len(bookings) and bookings[i][0] <= end:
        start = min(start, bookings[i][0])  # overlaps: absorb it
        end = max(end, bookings[i][1])
        i += 1
    out.append([start, end])
    out.extend(bookings[i:])  # entirely after
    return out


def insert_brute(bookings, new):
    merged = []
    for s, e in sorted(bookings + [new]):
        if merged and s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged


SOLUTIONS = [insert_booking, insert_brute]
EXAMPLES = [
    (([[1, 3], [6, 9]], [2, 5]), [[1, 5], [6, 9]]),
    (([[1, 2], [3, 5], [6, 7], [8, 10]], [4, 8]), [[1, 2], [3, 10]]),
    (([], [4, 8]), [[4, 8]]),
]


def random_case(rng):
    out, x = [], 0
    for _ in range(rng.randint(0, 5)):
        s = x + rng.randint(1, 3)
        e = s + rng.randint(0, 3)
        out.append([s, e])
        x = e
    s = rng.randint(0, 20)
    return (out, [s, s + rng.randint(0, 6)])
