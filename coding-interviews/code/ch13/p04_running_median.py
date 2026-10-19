"""13.4 Running Median: after each new reading, report the median so far."""

import heapq
from bisect import insort


def running_median_brute(readings):
    seen, out = [], []
    for r in readings:
        insort(seen, r)
        n = len(seen)
        if n % 2:
            out.append(float(seen[n // 2]))
        else:
            out.append((seen[n // 2 - 1] + seen[n // 2]) / 2)
    return out


def running_median(readings):
    low = []  # max-heap (negated) holding the smaller half
    high = []  # min-heap holding the larger half
    out = []
    for r in readings:
        heapq.heappush(low, -r)
        heapq.heappush(high, -heapq.heappop(low))  # keep halves ordered
        if len(high) > len(low):
            heapq.heappush(low, -heapq.heappop(high))  # low may be +1
        if len(low) > len(high):
            out.append(float(-low[0]))
        else:
            out.append((-low[0] + high[0]) / 2)
    return out


SOLUTIONS = [running_median, running_median_brute]
EXAMPLES = [
    (([5, 15, 1, 3],), [5.0, 10.0, 5.0, 4.0]),
    (([],), []),
]


def random_case(rng):
    return ([rng.randint(-20, 20) for _ in range(rng.randint(0, 15))],)
