"""Exercise 32.2: entries that expire. Each entry stores when it was
written; get() treats anything older than ttl seconds as missing. The
clock is a parameter, so the test can move time forward."""

from lru_cache import LRUCache


class TTLCache(LRUCache):
    def __init__(self, capacity, ttl, clock):
        super().__init__(capacity)
        self.ttl, self.clock = ttl, clock

    def put(self, key, value):
        super().put(key, (self.clock(), value))

    def get(self, key, default=None):
        entry = super().get(key)
        if entry is None or self.clock() - entry[0] > self.ttl:
            return default
        return entry[1]


now = [0]
c = TTLCache(10, ttl=60, clock=lambda: now[0])
c.put("price", 9.99)
now[0] = 30
print(c.get("price"))
now[0] = 61
print(c.get("price"))
