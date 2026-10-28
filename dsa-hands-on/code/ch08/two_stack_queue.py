"""A queue made of two stacks: an interview favorite.

New items go on the `inbox` stack. To take one out, pop from `outbox`;
when it is empty, pour the whole inbox into it, which reverses the
order so the oldest item is on top. Each item is moved at most once, so
the average cost per operation is constant.
"""


class TwoStackQueue:
    def __init__(self):
        self._inbox, self._outbox = [], []

    def __len__(self):
        return len(self._inbox) + len(self._outbox)

    def enqueue(self, value):
        self._inbox.append(value)

    def dequeue(self):
        if not self._outbox:
            while self._inbox:
                self._outbox.append(self._inbox.pop())
        if not self._outbox:
            raise IndexError("dequeue from an empty queue")
        return self._outbox.pop()
