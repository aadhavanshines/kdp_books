"""A doubly linked list with a sentinel node.

The sentinel is a dummy node that sits before the first node and after
the last, so the list is a circle and no operation needs a special case
for an empty list or for the ends.
"""


class DNode:
    __slots__ = ("value", "prev", "next")

    def __init__(self, value=None):
        self.value = value
        self.prev = self.next = self


class DoublyLinkedList:
    def __init__(self, items=()):
        self._sentinel = DNode()
        self._n = 0
        for x in items:
            self.append(x)

    def __len__(self):
        return self._n

    def __iter__(self):
        node = self._sentinel.next
        while node is not self._sentinel:
            yield node.value
            node = node.next

    def _insert_after(self, node, value):
        new = DNode(value)
        new.prev, new.next = node, node.next
        node.next.prev = new
        node.next = new
        self._n += 1
        return new

    def append(self, value):
        return self._insert_after(self._sentinel.prev, value)

    def appendleft(self, value):
        return self._insert_after(self._sentinel, value)

    def unlink(self, node):
        """Remove a node we already hold, in constant time."""
        node.prev.next = node.next
        node.next.prev = node.prev
        self._n -= 1
        return node.value

    def pop(self):
        if not self._n:
            raise IndexError("pop from an empty list")
        return self.unlink(self._sentinel.prev)

    def popleft(self):
        if not self._n:
            raise IndexError("pop from an empty list")
        return self.unlink(self._sentinel.next)
