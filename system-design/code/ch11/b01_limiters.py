"""Chapter 11: four rate limiters with the same interface.

allow(t) is called with non-decreasing times in seconds and returns
whether the request is allowed: at most `limit` per `window` seconds.
"""

from collections import deque


class FixedWindow:
    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.current, self.count = None, 0

    def allow(self, t):
        w = int(t // self.window)  # which window t falls in
        if w != self.current:
            self.current, self.count = w, 0
        if self.count < self.limit:
            self.count += 1
            return True
        return False


class SlidingLog:
    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.log = deque()  # times of allowed requests

    def allow(self, t):
        while self.log and self.log[0] <= t - self.window:
            self.log.popleft()
        if len(self.log) < self.limit:
            self.log.append(t)
            return True
        return False


class SlidingCounter:
    """Approximates the sliding log with two counters."""

    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.current, self.count, self.previous = None, 0, 0

    def allow(self, t):
        w = int(t // self.window)
        if w != self.current:
            if self.current is not None and w == self.current + 1:
                self.previous = self.count
            else:
                self.previous = 0
            self.current, self.count = w, 0
        overlap = (
            1 - (t % self.window) / self.window
        )  # share of last window
        if self.previous * overlap + self.count < self.limit:
            self.count += 1
            return True
        return False


class TokenBucket:
    def __init__(self, limit, window):
        self.capacity, self.rate = limit, limit / window
        self.tokens, self.last = float(limit), None

    def allow(self, t):
        if self.last is not None:
            self.tokens = min(
                self.capacity, self.tokens + (t - self.last) * self.rate
            )
        self.last = t
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


def sliding_log(limit, window, times):
    lim = SlidingLog(limit, window)
    return [lim.allow(t) for t in times]


def sliding_log_brute(limit, window, times):
    allowed = []
    out = []
    for t in times:
        recent = [a for a in allowed if a > t - window]
        ok = len(recent) < limit
        if ok:
            allowed.append(t)
        out.append(ok)
    return out


SOLUTIONS = [sliding_log, sliding_log_brute]
EXAMPLES = [
    (
        (2, 10, [0, 1, 2, 10, 10.5, 11]),
        [True, True, False, True, False, True],
    )
]


def random_case(rng):
    times, t = [], 0
    for _ in range(rng.randint(1, 30)):
        t += rng.choice([0, 0.5, 1, 3, 7])
        times.append(t)
    return (rng.randint(1, 4), rng.choice([5, 10]), times)


def demo():
    # 10 requests per 60 s. A client sends 10 at 0:59 and 10 at 1:00.
    times = [59.0] * 10 + [60.0] * 10
    for cls in [FixedWindow, SlidingLog, SlidingCounter, TokenBucket]:
        lim = cls(10, 60)
        allowed = sum(lim.allow(t) for t in times)
        print(
            f"{cls.__name__:<14} allows {allowed} of 20 requests in 2 seconds"
        )
