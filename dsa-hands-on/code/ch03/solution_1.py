"""Exercise 3.1: an inner loop that runs i times for each i makes
0 + 1 + ... + (n - 1) = n(n - 1)/2 steps: O(n^2), like all pairs."""


def steps(n):
    count = 0
    for i in range(n):
        for _ in range(i):
            count += 1
    return count


for n in [10, 100, 1_000]:
    formula = n * (n - 1) // 2
    print(f"n = {n:>5,}: {steps(n):>7,} steps; n(n - 1)/2 = {formula:,}")
