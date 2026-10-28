"""Timing one call with a stopwatch: the numbers jump around."""

import time

numbers = list(range(100_000))
for attempt in range(5):
    start = time.perf_counter()
    sum(numbers)
    elapsed = time.perf_counter() - start
    print(f"attempt {attempt + 1}: {elapsed * 1e6:.0f} microseconds")
