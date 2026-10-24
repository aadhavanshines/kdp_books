import numpy as np

rng = np.random.default_rng(7)
flips = rng.integers(0, 2, size=(10_000, 10))  # 10,000 runs of 10 flips
heads = flips.sum(axis=1)
print("share of runs with 8 or more heads:", (heads >= 8).mean())
