"""LRUCache checked against a simple model built on OrderedDict."""

import random
from collections import OrderedDict

import pytest

from lru_cache import LRUCache


class Model:
    """Obviously correct, if not obviously O(1)."""

    def __init__(self, capacity):
        self.capacity, self.d = capacity, OrderedDict()

    def get(self, key):
        if key not in self.d:
            return None
        self.d.move_to_end(key, last=False)  # to the front
        return self.d[key]

    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key, last=False)
        if len(self.d) > self.capacity:
            self.d.popitem(last=True)  # drop the back


def test_eviction_order():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    c.get("a")  # now b is the least recently used
    c.put("c", 3)
    assert c.get("b") is None and c.get("a") == 1 and c.get("c") == 3
    assert list(c.keys()) == ["c", "a"] and len(c) == 2
    assert (c.hits, c.misses) == (3, 1)


def test_bad_capacity():
    with pytest.raises(ValueError):
        LRUCache(0)


def test_random_operations_match_model():
    rng = random.Random(2026)
    for capacity in (1, 2, 5, 20):
        c, m = LRUCache(capacity), Model(capacity)
        for _ in range(5000):
            key = rng.randint(0, 30)
            if rng.random() < 0.5:
                assert c.get(key) == m.get(key)
            else:
                value = rng.randint(0, 999)
                c.put(key, value)
                m.put(key, value)
            assert list(c.keys()) == list(m.d)
