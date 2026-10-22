"""Chapter 6: an LRU cache whose entries also expire after a TTL."""

from collections import OrderedDict


class TTLCache:
    def __init__(self, capacity, ttl, clock):
        self.capacity, self.ttl, self.clock = capacity, ttl, clock
        self.data = OrderedDict()  # key -> (value, expires_at)

    def get(self, key):
        item = self.data.get(key)
        if item is None:
            return None
        value, expires = item
        if self.clock() >= expires:  # expired: treat as a miss
            del self.data[key]
            return None
        self.data.move_to_end(key)  # most recently used
        return value

    def put(self, key, value):
        self.data[key] = (value, self.clock() + self.ttl)
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)  # evict least recently used


def session(capacity, ttl, ops):
    now = [0]
    cache = TTLCache(capacity, ttl, lambda: now[0])
    out = []
    for op in ops:
        if op[0] == "tick":
            now[0] += op[1]
        elif op[0] == "put":
            cache.put(op[1], op[2])
        else:
            out.append(cache.get(op[1]))
    return out


def session_brute(capacity, ttl, ops):
    now, items, out = 0, [], []  # items: [key, value, expires, last_use]
    for op in ops:
        if op[0] == "tick":
            now += op[1]
        elif op[0] == "put":
            items = [i for i in items if i[0] != op[1]]
            items.append([op[1], op[2], now + ttl, now])
            if len(items) > capacity:
                items.remove(min(items, key=lambda i: i[3]))
        else:
            hit = [i for i in items if i[0] == op[1]]
            if hit and now < hit[0][2]:
                hit[0][3] = now
                out.append(hit[0][1])
            else:
                items = [i for i in items if i[0] != op[1]]
                out.append(None)
        now += 0.001  # distinct "last use" times, as in a real clock
    return out


SOLUTIONS = [session, session_brute]
EXAMPLES = [
    (
        (
            2,
            10,
            [
                ("put", "a", 1),
                ("put", "b", 2),
                ("get", "a"),
                ("put", "c", 3),
                ("get", "b"),
                ("tick", 10),
                ("get", "a"),
            ],
        ),
        [1, None, None],
    )
]


def random_case(rng):
    ops = []
    for _ in range(rng.randint(1, 25)):
        r = rng.random()
        if r < 0.4:
            ops.append(("put", rng.choice("abcd"), rng.randint(0, 9)))
        elif r < 0.8:
            ops.append(("get", rng.choice("abcd")))
        else:
            ops.append(("tick", rng.randint(1, 6)))
    return (rng.randint(1, 3), rng.randint(1, 10), ops)
