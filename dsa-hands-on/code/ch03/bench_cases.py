"""Best, average and worst case: linear search for different targets."""

import bench

n = 100_000
items = list(range(n))
cases = {
    "best (first item)": 0,
    "middle item": n // 2,
    "worst (missing)": -1,
}
for name, target in cases.items():
    seconds = bench.measure(lambda: target in items)
    print(f"{name:>18}: {bench.show_time(seconds)}")
