"""An LRU cache of capacity 3, step by step."""

from lru_cache import LRUCache

c = LRUCache(3)
for step in [
    "put a",
    "put b",
    "put c",
    "get a",
    "put d",
    "get b",
    "get c",
    "put e",
]:
    action, key = step.split()
    if action == "put":
        c.put(key, key.upper())
        result = ""
    else:
        result = f"-> {c.get(key)}"
    print(f"{step} {result:<7} cache (newest first): {list(c.keys())}")
print(f"hits {c.hits}, misses {c.misses}")
