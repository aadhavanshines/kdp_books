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


def hit_counter_session(ops):
    hc, out = HitCounter(), []
    for op, t in ops:
        if op == "hit":
            hc.hit(t)
        else:
            out.append(hc.count(t))
    return out


def hit_counter_brute(ops):
    hits, out = [], []
    for op, t in ops:
        if op == "hit":
            hits.append(t)
        else:
            out.append(sum(1 for h in hits if t - 300 < h <= t))
    return out


SOLUTIONS = [hit_counter_session, hit_counter_brute]
EXAMPLES = [
    (
        (
            [
                ("hit", 10),
                ("hit", 10),
                ("hit", 200),
                ("count", 250),
                ("hit", 400),
                ("count", 400),
                ("count", 500),
            ],
        ),
        [3, 2, 1],
    ),
]


def random_case(rng):
    ops, t = [], 0
    for _ in range(rng.randint(1, 20)):
        t += rng.choice([0, 1, 50, 200])
        ops.append((rng.choice(["hit", "hit", "count"]), t))
    return (ops,)
