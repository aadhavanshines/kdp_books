"""An LRU (least recently used) cache with a fixed capacity.

A dict finds an entry's node in constant time; a doubly linked list
keeps the entries in order of use, most recent at the front. Using an
entry moves its node to the front; when the cache is full, the node at
the back (the least recently used) is evicted. Every operation is O(1).
"""


class _Node:
    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = self


class LRUCache:
    def __init__(self, capacity):
        if capacity < 1:
            raise ValueError("capacity must be at least 1")
        self.capacity = capacity
        self._map = {}  # key -> node
        self._sentinel = _Node()  # front: sentinel.next; back: .prev
        self.hits = self.misses = 0

    def __len__(self):
        return len(self._map)

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, node):
        first = self._sentinel.next
        node.prev, node.next = self._sentinel, first
        first.prev = node
        self._sentinel.next = node

    def get(self, key, default=None):
        node = self._map.get(key)
        if node is None:
            self.misses += 1
            return default
        self.hits += 1
        self._unlink(node)  # used just now: move to the front
        self._push_front(node)
        return node.value

    def put(self, key, value):
        node = self._map.get(key)
        if node:
            node.value = value
            self._unlink(node)
        else:
            if len(self._map) == self.capacity:
                oldest = self._sentinel.prev  # the back of the list
                self._unlink(oldest)
                del self._map[oldest.key]
            node = _Node(key, value)
            self._map[key] = node
        self._push_front(node)

    def keys(self):
        """Keys from most to least recently used."""
        node = self._sentinel.next
        while node is not self._sentinel:
            yield node.key
            node = node.next
