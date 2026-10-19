"""14.3 Rooms Needed: the fewest meeting rooms for meetings [start, end).
A meeting ending at 10 frees its room for one starting at 10."""

import heapq


def rooms_needed(meetings):
    ends = []  # end times of meetings in progress
    for start, end in sorted(meetings):
        if ends and ends[0] <= start:
            heapq.heapreplace(ends, end)  # reuse the room freed earliest
        else:
            heapq.heappush(ends, end)
    return len(ends)


def rooms_sweep(meetings):
    events = []
    for s, e in meetings:
        events.append((s, 1))
        events.append((e, -1))  # -1 sorts before +1 at the same time
    best = cur = 0
    for _, change in sorted(events):
        cur += change
        best = max(best, cur)
    return best


SOLUTIONS = [rooms_needed, rooms_sweep]
EXAMPLES = [
    (([[9, 12], [10, 11], [11, 13], [12, 14]],), 2),
    (([[7, 10], [2, 4]],), 1),
    (([[1, 5], [5, 9]],), 1),
    (([],), 0),
]


def random_case(rng):
    out = []
    for _ in range(rng.randint(0, 8)):
        s = rng.randint(0, 15)
        out.append([s, s + rng.randint(1, 5)])
    return (out,)
