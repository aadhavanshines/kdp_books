"""A singly linked list: each node points to the next one."""


class Node:
    __slots__ = ("value", "next")  # saves memory: no per-node dict

    def __init__(self, value, next=None):
        self.value = value
        self.next = next


class LinkedList:
    def __init__(self, items=()):
        self.head = None  # first node
        self.tail = None  # last node, so append() needn't walk the list
        self._n = 0
        for x in items:
            self.append(x)

    def __len__(self):
        return self._n

    def __iter__(self):
        node = self.head
        while node:
            yield node.value
            node = node.next

    def __repr__(self):
        return " -> ".join(map(repr, self)) or "(empty)"

    def push_front(self, value):
        self.head = Node(value, self.head)
        if self.tail is None:
            self.tail = self.head
        self._n += 1

    def append(self, value):
        node = Node(value)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node
        self._n += 1

    def pop_front(self):
        if self.head is None:
            raise IndexError("pop from an empty list")
        node = self.head
        self.head = node.next
        if self.head is None:
            self.tail = None
        self._n -= 1
        return node.value

    def find(self, value):
        """The first node holding value, or None."""
        node = self.head
        while node and node.value != value:
            node = node.next
        return node

    def remove(self, value):
        """Unlink the first node holding value. Raise ValueError if none."""
        before, node = None, self.head
        while node and node.value != value:
            before, node = node, node.next
        if node is None:
            raise ValueError(f"{value!r} not in list")
        if before is None:
            self.head = node.next
        else:
            before.next = node.next
        if node is self.tail:
            self.tail = before
        self._n -= 1

    def reverse(self):
        """Reverse the list in place by turning every arrow around."""
        before, node = None, self.head
        self.tail = node
        while node:
            node.next, before, node = before, node, node.next
        self.head = before
