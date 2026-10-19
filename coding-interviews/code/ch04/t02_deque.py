"""Queues with deque: O(1) at both ends."""

from collections import deque


def demo():
    queue = deque([1, 2])
    queue.append(3)  # add at the right
    queue.appendleft(0)  # add at the left
    print(queue.popleft(), queue.pop(), list(queue))

    recent = deque(maxlen=3)  # keeps only the last 3 items
    for reading in [5, 6, 7, 8]:
        recent.append(reading)
    print(list(recent))
