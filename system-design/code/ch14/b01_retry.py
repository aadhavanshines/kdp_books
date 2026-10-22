"""Chapter 14: exponential backoff with full jitter, and a circuit breaker."""

import random


def backoff_delays(attempts, base=0.1, cap=10.0, rng=None):
    """Full jitter: wait a random time between 0 and the exponential cap."""
    rng = rng or random.Random()
    return [rng.uniform(0, min(cap, base * 2**i)) for i in range(attempts)]


def retry_storm(clients=1000, jitter=True, seed=4):
    """After an outage, all clients retry. Return the most retries that
    land in any single 10 ms slot."""
    rng = random.Random(seed)
    slots = {}
    for _ in range(clients):
        t = 0.0
        for i in range(5):
            wait = min(30.0, 0.5 * 2**i)
            t += rng.uniform(0, wait) if jitter else wait
            slot = int(t * 100)
            slots[slot] = slots.get(slot, 0) + 1
    return max(slots.values())


class CircuitBreaker:
    """closed -> open after `threshold` failures in a row; open -> half
    open after `cooldown` seconds; one trial call closes or reopens it."""

    def __init__(self, threshold, cooldown, clock):
        self.threshold, self.cooldown, self.clock = (
            threshold,
            cooldown,
            clock,
        )
        self.state, self.failures, self.opened_at = "closed", 0, None

    def call(self, fn):
        if self.state == "open":
            if self.clock() - self.opened_at < self.cooldown:
                raise RuntimeError("circuit open: failing fast")
            self.state = "half open"
        try:
            result = fn()
        except Exception:
            self.failures += 1
            if self.state == "half open" or self.failures >= self.threshold:
                self.state, self.opened_at = "open", self.clock()
            raise
        self.state, self.failures = "closed", 0
        return result


def demo():
    print("busiest 10 ms of retries from 1,000 clients:")
    print("  fixed exponential backoff:", retry_storm(jitter=False))
    print("  with full jitter:         ", retry_storm(jitter=True))


def breaker_states(outcomes, times):
    """Run calls that succeed (True) or fail (False) at the given times;
    return the breaker state after each call."""
    now = [0]
    cb = CircuitBreaker(threshold=3, cooldown=30, clock=lambda: now[0])
    states = []
    for ok, t in zip(outcomes, times):
        now[0] = t

        def fn(ok=ok):
            if not ok:
                raise ValueError("downstream error")
            return "ok"

        try:
            cb.call(fn)
        except (ValueError, RuntimeError):
            pass
        states.append(cb.state)
    return states


SOLUTIONS = [breaker_states]
EXAMPLES = [
    (
        (
            [False, False, False, True, True, False, True],
            [0, 1, 2, 3, 40, 41, 80],
        ),
        ["closed", "closed", "open", "open", "closed", "closed", "closed"],
    ),
    (
        ([False, False, False, False], [0, 1, 2, 40]),
        ["closed", "closed", "open", "open"],
    ),
]


def test():
    d = backoff_delays(6, rng=random.Random(1))
    assert all(0 <= x <= min(10, 0.1 * 2**i) for i, x in enumerate(d))
    assert retry_storm(jitter=True) < retry_storm(jitter=False)
