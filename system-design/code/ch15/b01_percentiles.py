"""Chapter 15: why averages hide slow requests, and error budgets."""

import math
import random


def percentile(values, p):
    """Nearest-rank percentile: the smallest value with at least p% of
    values at or below it."""
    ordered = sorted(values)
    rank = max(1, math.ceil(p / 100 * len(ordered)))
    return ordered[rank - 1]


def percentile_brute(values, p):
    for v in sorted(set(values)):
        if sum(x <= v for x in values) >= p / 100 * len(values):
            return v


SOLUTIONS = [percentile, percentile_brute]
EXAMPLES = [(([15, 20, 35, 40, 50], 30), 20), (([5], 99), 5)]


def random_case(rng):
    return (
        [rng.randint(1, 50) for _ in range(rng.randint(1, 30))],
        rng.randint(1, 100),
    )


def error_budget(slo, days=30):
    """Minutes of full outage allowed per period by an availability SLO."""
    return (1 - slo) * days * 24 * 60


def demo():
    rng = random.Random(9)
    # 98% of requests are fast; 2% hit a slow path (cache miss + disk).
    lat = [
        rng.uniform(20, 40)
        if rng.random() < 0.98
        else rng.uniform(800, 1200)
        for _ in range(100_000)
    ]
    print(f"mean {sum(lat) / len(lat):.0f} ms")
    for p in [50, 95, 99, 99.9]:
        print(f"p{p:<4} {percentile(lat, p):.0f} ms")
    for slo in [0.99, 0.999, 0.9999]:
        print(
            f"SLO {slo:.2%}: {error_budget(slo):.1f} minutes of downtime per 30 days"
        )
