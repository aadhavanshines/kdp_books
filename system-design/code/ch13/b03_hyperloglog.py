"""Chapter 13: HyperLogLog counts distinct items in a few kilobytes."""

import hashlib
import math


class HyperLogLog:
    def __init__(self, p=12):
        self.p, self.m = p, 1 << p  # 2^p registers
        self.registers = [0] * self.m

    def add(self, item):
        x = int.from_bytes(
            hashlib.sha256(item.encode()).digest()[:8], "big"
        )
        idx = x >> (64 - self.p)  # first p bits choose a register
        rest = x & ((1 << (64 - self.p)) - 1)
        rank = (64 - self.p) - rest.bit_length() + 1  # leading zeros + 1
        self.registers[idx] = max(self.registers[idx], rank)

    def count(self):
        alpha = 0.7213 / (1 + 1.079 / self.m)
        raw = alpha * self.m**2 / sum(2.0**-r for r in self.registers)
        zeros = self.registers.count(0)
        if raw <= 2.5 * self.m and zeros:  # small-range correction
            return self.m * math.log(self.m / zeros)
        return raw


def demo():
    hll = HyperLogLog(p=12)
    for n in [1_000, 100_000, 1_000_000]:
        hll = HyperLogLog(p=12)
        for i in range(n):
            hll.add(f"user-{i}")
        est = hll.count()
        print(
            f"true {n:>9,}  estimate {est:>11,.0f}  error {abs(est - n) / n:.1%}"
        )
    print(
        f"memory: {hll.m} registers, about {hll.m * 6 // 8 // 1024} KB at 6 bits each"
    )


def test():
    for n in [500, 20_000]:
        hll = HyperLogLog(p=12)
        for i in range(n):
            hll.add(f"id{i}")
            hll.add(f"id{i}")  # duplicates don't change the count
        assert abs(hll.count() - n) / n < 0.05
