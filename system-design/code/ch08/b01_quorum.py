"""Chapter 8: quorum reads and writes on N replicas.

A write succeeds once W replicas store it; a read asks R replicas and
returns the value with the highest version. Each request reaches a
random subset of replicas (the others are slow or down).
"""

import random


def stale_reads(n, w, r, trials=20_000, seed=3):
    """Fraction of reads that miss the latest acknowledged write."""
    rng = random.Random(seed)
    replicas = [0] * n  # version stored on each replica
    version, stale = 0, 0
    for _ in range(trials):
        version += 1
        for i in rng.sample(range(n), w):  # the write reaches W replicas
            replicas[i] = version
        seen = max(replicas[i] for i in rng.sample(range(n), r))
        stale += seen < version
    return stale / trials


def demo():
    for w, r in [(1, 1), (2, 1), (1, 3), (2, 2), (3, 1)]:
        overlap = "R + W > N" if r + w > 3 else "R + W <= N"
        print(
            f"N=3 W={w} R={r} ({overlap}): "
            f"{stale_reads(3, w, r):.0%} of reads are stale"
        )


def test():
    for n in range(1, 6):
        for w in range(1, n + 1):
            for r in range(1, n + 1):
                s = stale_reads(n, w, r, trials=2000)
                if r + w > n:
                    assert s == 0  # every read set overlaps the write set
                elif n > 1:
                    assert s > 0
