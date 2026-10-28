"""A mixed workload of gets and puts: our LRUCache, an OrderedDict
version, and a dict with no limit (the fastest possible, unbounded)."""

import random
from collections import OrderedDict

import bench
from lru_cache import LRUCache

rng = random.Random(2026)
keys = [rng.randint(0, 2_000) for _ in range(100_000)]


class OrderedLRU:
    def __init__(self, capacity):
        self.capacity, self.d = capacity, OrderedDict()

    def get(self, key, default=None):
        if key in self.d:
            self.d.move_to_end(key)
            return self.d[key]
        return default

    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.capacity:
            self.d.popitem(last=False)


class Unbounded(dict):
    """A dict with the same get() and put() methods; it never evicts."""

    put = dict.__setitem__


def workload(cache):
    for k in keys:
        if cache.get(k) is None:
            cache.put(k, k)


caches = {
    "LRUCache": lambda: LRUCache(500),
    "OrderedDict LRU": lambda: OrderedLRU(500),
    "plain dict": Unbounded,
}
for name, make in caches.items():
    cache = make()
    seconds = bench.measure(lambda c=cache: workload(c))
    print(f"{name:>16}: {bench.show_time(seconds)} for 100,000 requests")
