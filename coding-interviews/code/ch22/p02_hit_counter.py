"""22.2 Hit Counter: record hits with a timestamp (seconds, never
decreasing) and report how many hits happened in the last 300 seconds,
i.e. in (t - 300, t]."""

from collections import deque


class HitCounter:
    WINDOW = 300

    def __init__(self):
        self.hits = deque()  # (timestamp, count), oldest first

    def hit(self, t):
        if self.hits and self.hits[-1][0] == t:
            self.hits[-1] = (t, self.hits[-1][1] + 1)  # group same second
        else:
            self.hits.append((t, 1))

    def count(self, t):
        while self.hits and self.hits[0][0] <= t - self.WINDOW:
            self.hits.popleft()  # too old to ever count again
        return sum(c for _, c in self.hits)


def run_ops(ops):
    hc, out = HitCounter(), []
    for op, t in ops:
        if op == "hit":
            hc.hit(t)
        else:
            out.append(hc.count(t))
    return out


def run_ops_brute(ops):
    hits, out = [], []
    for op, t in ops:
        if op == "hit":
            hits.append(t)
        else:
            out.append(sum(1 for h in hits if t - 300 < h <= t))
    return out


SOLUTIONS = [run_ops, run_ops_brute]
EXAMPLES = [
    (
        (
            [
                ("hit", 1),
                ("hit", 2),
                ("hit", 3),
                ("count", 4),
                ("hit", 300),
                ("count", 300),
                ("count", 301),
            ],
        ),
        [3, 4, 3],
    ),
]


def random_case(rng):
    ops, t = [], 0
    for _ in range(rng.randint(1, 20)):
        t += rng.choice([0, 1, 50, 200])
        ops.append((rng.choice(["hit", "hit", "count"]), t))
    return (ops,)
