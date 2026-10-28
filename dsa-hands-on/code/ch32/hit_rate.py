"""How big should a cache be? Requests for 10,000 different pages,
where a few popular pages get most of the traffic (page k is requested
in proportion to 1 / k). Hit rate for different capacities."""

import random

from lru_cache import LRUCache

rng = random.Random(2026)
pages = range(1, 10_001)
weights = [1 / k for k in pages]
requests = rng.choices(pages, weights, k=200_000)

print(f"{'capacity':>9} {'hit rate':>9}")
for capacity in [10, 100, 1_000, 5_000]:
    cache = LRUCache(capacity)
    for page in requests:
        if cache.get(page) is None:
            cache.put(page, True)  # a miss: fetch it, then keep it
    print(f"{capacity:>9,} {cache.hits / len(requests):>9.1%}")
