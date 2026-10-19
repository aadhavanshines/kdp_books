"""22.1 Recently Used Cache: a fixed-size cache that, when full, evicts the
least recently used key. get and put must be O(1)."""

from collections import OrderedDict


class Node:
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}  # key -> node in the list
        self.head, self.tail = Node(), Node()  # sentinels: oldest..newest
        self.head.next, self.tail.prev = self.tail, self.head

    def _unlink(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _append(self, node):  # newest goes just before the tail
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._unlink(node)
        self._append(node)  # now the most recently used
        return node.value

    def put(self, key, value):
        if key in self.nodes:
            self._unlink(self.nodes.pop(key))
        elif len(self.nodes) == self.capacity:
            oldest = self.head.next
            self._unlink(oldest)
            del self.nodes[oldest.key]
        node = Node(key, value)
        self.nodes[key] = node
        self._append(node)


class LRUCacheOrdered:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)


def run(cls, capacity, ops):
    cache, out = cls(capacity), []
    for op in ops:
        if op[0] == "get":
            out.append(cache.get(op[1]))
        else:
            cache.put(op[1], op[2])
    return out


def lru_session(capacity, ops):
    return run(LRUCache, capacity, ops)


def lru_session_ordered(capacity, ops):
    return run(LRUCacheOrdered, capacity, ops)


SOLUTIONS = [lru_session, lru_session_ordered]
EXAMPLES = [
    (
        (
            2,
            [
                ("put", 1, 1),
                ("put", 2, 2),
                ("get", 1),
                ("put", 3, 3),
                ("get", 2),
                ("put", 4, 4),
                ("get", 1),
                ("get", 3),
                ("get", 4),
            ],
        ),
        [1, -1, -1, 3, 4],
    ),
]


def random_case(rng):
    ops = []
    for _ in range(rng.randint(1, 20)):
        if rng.random() < 0.5:
            ops.append(("get", rng.randint(0, 4)))
        else:
            ops.append(("put", rng.randint(0, 4), rng.randint(0, 9)))
    return (rng.randint(1, 3), ops)
