"""A stack: last in, first out. A Python list does all the work."""


class Stack:
    def __init__(self):
        self._items = []

    def push(self, value):
        self._items.append(value)  # the end of the list is the top

    def pop(self):
        if not self._items:
            raise IndexError("pop from an empty stack")
        return self._items.pop()

    def peek(self):
        if not self._items:
            raise IndexError("peek at an empty stack")
        return self._items[-1]

    def __len__(self):
        return len(self._items)

    def __bool__(self):
        return bool(self._items)
