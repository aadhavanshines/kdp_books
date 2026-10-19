"""23.5 Token Bucket Rate Limiter: a bucket holds up to `capacity`
tokens and gains `rate` tokens per second (continuously). Each request
takes one token if available. Given request times (seconds, non-
decreasing), return True/False for each. The bucket starts full."""


class TokenBucket:
    def __init__(self, capacity, rate):
        self.capacity, self.rate = capacity, rate
        self.tokens = float(capacity)
        self.last = None

    def allow(self, t):
        if self.last is not None:
            elapsed = t - self.last
            self.tokens = min(
                self.capacity, self.tokens + elapsed * self.rate
            )
        self.last = t
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False


def limit(capacity, rate, times):
    bucket = TokenBucket(capacity, rate)
    return [bucket.allow(t) for t in times]


def limit_replay(capacity, rate, times):
    """Slow but simple: for each request, replay the whole history."""
    out = []
    for i in range(len(times)):
        tokens = capacity
        for j in range(i + 1):
            if j:
                gained = (times[j] - times[j - 1]) * rate
                tokens = min(capacity, tokens + gained)
            if j < i and out[j]:
                tokens -= 1  # request j took a token
        out.append(tokens >= 1)
    return out


SOLUTIONS = [limit, limit_replay]
EXAMPLES = [
    ((2, 1, [0, 0, 0, 1, 1.5, 3]), [True, True, False, True, False, True])
]


def random_case(rng):
    times, t = [], 0
    for _ in range(rng.randint(1, 12)):
        t += rng.choice([0, 0.25, 0.5, 1, 2])
        times.append(t)
    return (rng.randint(1, 3), rng.choice([0.5, 1, 2]), times)
