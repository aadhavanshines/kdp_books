"""13.5 Cooldown Scheduler: each task takes one time unit; two runs of the
same task type must be at least n units apart. What is the fewest units
needed to run them all (idle units allowed)?"""

import heapq
from collections import Counter, deque


def cooldown_simulate(tasks, n):
    heap = [-c for c in Counter(tasks).values()]  # max-heap of counts
    heapq.heapify(heap)
    waiting = deque()  # (time it can run again, negated remaining count)
    time = 0
    while heap or waiting:
        time += 1
        if heap:
            remaining = heapq.heappop(heap) + 1  # run the most common
            if remaining:
                waiting.append((time + n, remaining))
        if waiting and waiting[0][0] == time:
            heapq.heappush(heap, waiting.popleft()[1])
    return time


def cooldown(tasks, n):
    counts = Counter(tasks).values()
    most = max(counts)
    with_most = sum(1 for c in counts if c == most)
    # (most - 1) full blocks of length n + 1, then the last row.
    return max(len(tasks), (most - 1) * (n + 1) + with_most)


SOLUTIONS = [cooldown, cooldown_simulate]
EXAMPLES = [
    ((["A", "A", "A", "B", "B", "B"], 2), 8),
    ((["A", "A", "A", "B", "B", "B"], 0), 6),
    ((["A", "B", "C", "A"], 3), 5),
]


def random_case(rng):
    tasks = [rng.choice("ABCD") for _ in range(rng.randint(1, 12))]
    return (tasks, rng.randint(0, 4))
