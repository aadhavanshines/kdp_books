"""23.2 Telemetry Spikes: flag every reading that differs from the average
of the previous k readings by more than `limit`. The first k readings are
never flagged. Return the flagged indices."""

from collections import deque


def spikes(readings, k, limit):
    window = deque()
    total = 0.0
    flagged = []
    for i, r in enumerate(readings):
        if len(window) == k and abs(r - total / k) > limit:
            flagged.append(i)
        window.append(r)
        total += r
        if len(window) > k:
            total -= window.popleft()  # keep a running sum, O(1) per step
    return flagged


def spikes_brute(readings, k, limit):
    return [
        i
        for i in range(k, len(readings))
        if abs(readings[i] - sum(readings[i - k : i]) / k) > limit
    ]


SOLUTIONS = [spikes, spikes_brute]
EXAMPLES = [
    (([10, 11, 10, 30, 10, 11, 9], 3, 5), [3, 4, 5, 6]),
    (([5, 5], 3, 1), []),
]


def random_case(rng):
    vals = [rng.randint(0, 20) for _ in range(rng.randint(0, 15))]
    return (vals, rng.randint(1, 4), rng.randint(1, 8) + 0.5)
