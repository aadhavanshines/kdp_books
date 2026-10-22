"""Chapter 13: a Bloom filter. "No" is always right; "maybe" can be wrong."""

import hashlib
import math


class BloomFilter:
    def __init__(self, n_items, fp_rate):
        # Standard sizing formulas for m bits and k hash functions.
        self.m = math.ceil(-n_items * math.log(fp_rate) / math.log(2) ** 2)
        self.k = max(1, round(self.m / n_items * math.log(2)))
        self.bits = bytearray(self.m)

    def _positions(self, item):
        d = hashlib.sha256(item.encode()).digest()
        h1 = int.from_bytes(d[:8], "big")
        h2 = int.from_bytes(d[8:16], "big") | 1
        return [(h1 + i * h2) % self.m for i in range(self.k)]

    def add(self, item):
        for p in self._positions(item):
            self.bits[p] = 1

    def might_contain(self, item):
        return all(self.bits[p] for p in self._positions(item))


def demo():
    bf = BloomFilter(10_000, 0.01)
    for i in range(10_000):
        bf.add(f"seen-{i}")
    false_pos = sum(bf.might_contain(f"new-{i}") for i in range(100_000))
    print(
        f"{bf.m:,} bits ({bf.m / 8 / 1024:.1f} KB), {bf.k} hash functions"
    )
    print(f"false positive rate: {false_pos / 100_000:.2%} (target 1%)")


def test():
    bf = BloomFilter(2000, 0.02)
    items = [f"x{i}" for i in range(2000)]
    for it in items:
        bf.add(it)
    assert all(bf.might_contain(it) for it in items)  # no false negatives
    fp = sum(bf.might_contain(f"y{i}") for i in range(20_000)) / 20_000
    assert fp < 0.04
