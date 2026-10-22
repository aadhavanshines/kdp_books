"""Chapter 6: how cache size affects hit rate when popularity is skewed.

Keys follow a Zipf-like distribution: key k is requested with weight
1 / k, so a few keys are very popular and most are rarely requested.
"""

import random
from collections import OrderedDict


def hit_rate(cache_size, keys=100_000, requests=200_000, seed=7):
    rng = random.Random(seed)
    weights = [1 / k for k in range(1, keys + 1)]
    stream = rng.choices(range(keys), weights=weights, k=requests)
    cache, hits = OrderedDict(), 0
    for key in stream:
        if key in cache:
            hits += 1
            cache.move_to_end(key)
        else:
            cache[key] = True
            if len(cache) > cache_size:
                cache.popitem(last=False)
    return hits / requests


def demo():
    for size in [100, 1_000, 10_000]:
        share = size / 100_000
        print(
            f"cache holds {share:>5.1%} of keys -> "
            f"hit rate {hit_rate(size):.0%}"
        )


def test():
    small, large = (
        hit_rate(100, 10_000, 20_000),
        hit_rate(1000, 10_000, 20_000),
    )
    assert 0 < small < large < 1
