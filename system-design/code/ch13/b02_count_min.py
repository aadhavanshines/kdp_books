"""Chapter 13: Count-Min sketch for approximate frequency counts.

It never underestimates; with width w, each estimate exceeds the true
count by at most about e/w of the total, with high probability.
"""

import hashlib
import random
from collections import Counter


class CountMin:
    def __init__(self, width=1000, depth=4):
        self.w, self.d = width, depth
        self.rows = [[0] * width for _ in range(depth)]

    def _cols(self, item):
        d = hashlib.sha256(item.encode()).digest()
        return [
            int.from_bytes(d[4 * i : 4 * i + 4], "big") % self.w
            for i in range(self.d)
        ]

    def add(self, item, count=1):
        for row, col in zip(self.rows, self._cols(item)):
            row[col] += count

    def estimate(self, item):
        return min(
            row[col] for row, col in zip(self.rows, self._cols(item))
        )


def test():
    rng = random.Random(2)
    stream = [f"q{int(rng.paretovariate(1.2))}" for _ in range(50_000)]
    cm, true = CountMin(width=500, depth=4), Counter(stream)
    for s in stream:
        cm.add(s)
    for item, c in true.items():
        est = cm.estimate(item)
        assert est >= c  # never underestimates
    big_errors = sum(
        cm.estimate(i) - c > 2.72 / 500 * 50_000 for i, c in true.items()
    )
    assert big_errors <= 0.05 * len(true)
