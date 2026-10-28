"""Python's sorted() (Timsort) finds runs that are already in order."""

import random

import bench

rng = random.Random(2026)
n = 1_000_000
ordered = list(range(n))
nearly = list(range(n))
for _ in range(100):
    i, j = rng.randrange(n), rng.randrange(n)
    nearly[i], nearly[j] = nearly[j], nearly[i]
cases = {
    "random": rng.sample(range(n), n),
    "sorted": ordered,
    "reversed": ordered[::-1],
    "100 swaps": nearly,
}
for name, data in cases.items():
    seconds = bench.measure(lambda: sorted(data))
    print(f"{name:>10}: {bench.show_time(seconds)}")
