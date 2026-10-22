"""Chapter 17: a token bucket shared by many gateway servers.

Each gateway reads the bucket from a shared store, updates it and writes
it back. If two gateways interleave, a plain read-then-write loses one
update and lets extra requests through. Compare-and-set (or an atomic
script in the store) retries instead, so the limit holds.
"""

import random


class Store:
    def __init__(self):
        self.data, self.version = {}, {}

    def get(self, key):
        return self.data.get(key), self.version.get(key, 0)

    def set(self, key, value):
        self.data[key] = value
        self.version[key] = self.version.get(key, 0) + 1

    def cas(self, key, value, expected_version):
        if self.version.get(key, 0) != expected_version:
            return False  # someone else wrote first
        self.set(key, value)
        return True


def run(atomic, gateways=4, requests=400, capacity=100, seed=1):
    """All requests arrive within one second (no refill). Gateways take
    turns in a random interleaving. Returns how many were allowed."""
    rng = random.Random(seed)
    store = Store()
    store.set("bucket", capacity)
    pending = [requests // gateways] * gateways
    reads = [None] * gateways  # value and version each gateway has read
    allowed = 0
    while any(pending) or any(reads):
        g = rng.choice(
            [i for i in range(gateways) if pending[i] or reads[i]]
        )
        if reads[g] is None:  # step 1: read
            reads[g] = store.get("bucket")
            pending[g] -= 1
            continue
        tokens, version = reads[g]  # step 2: decide and write
        reads[g] = None
        if tokens < 1:
            continue  # rejected
        if atomic:
            if store.cas("bucket", tokens - 1, version):
                allowed += 1
            else:
                pending[g] += 1  # lost the race: re-read and retry
        else:
            store.set("bucket", tokens - 1)
            allowed += 1
    return allowed


def demo():
    print("limit 100 per second, 400 requests through 4 gateways:")
    print("  read-then-write allows", run(atomic=False))
    print("  compare-and-set allows", run(atomic=True))


def test():
    for seed in range(20):
        assert run(atomic=True, seed=seed) == 100
    assert any(run(atomic=False, seed=s) > 100 for s in range(5))
