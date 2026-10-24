import numpy as np

rng = np.random.default_rng(42)  # a fixed seed: the same numbers each run
heights = rng.normal(loc=170, scale=8, size=10_000)

print(f"mean   {heights.mean():.1f}")
print(f"std    {heights.std():.1f}")
print(f"median {np.median(heights):.1f}")
print("5th and 95th percentiles:", np.percentile(heights, [5, 95]).round(1))
print("share above 185 cm:", (heights > 185).mean())

dice = rng.integers(1, 7, size=(100_000, 2)).sum(axis=1)
counts = np.bincount(dice)[2:]
print("two dice, sums 2 to 12:")
print(counts)
print("most common sum:", counts.argmax() + 2)
