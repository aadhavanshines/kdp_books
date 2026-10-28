"""A queue of n items filled, then emptied: four implementations."""

from collections import deque

import bench
from ring_queue import RingQueue
from two_stack_queue import TwoStackQueue


def with_list(n):
    q = []
    for i in range(n):
        q.append(i)
    while q:
        q.pop(0)  # every remaining item shifts left


def with_deque(n):
    q = deque()
    for i in range(n):
        q.append(i)
    while q:
        q.popleft()


def with_class(make):
    def run(n):
        q = make()
        for i in range(n):
            q.enqueue(i)
        while len(q):
            q.dequeue()

    return run


sizes = [5_000, 10_000, 20_000, 40_000, 80_000]
results = {
    "list.pop(0)": bench.doubling(with_list, lambda n: (n,), sizes),
    "deque": bench.doubling(with_deque, lambda n: (n,), sizes),
    "RingQueue": bench.doubling(
        with_class(RingQueue), lambda n: (n,), sizes
    ),
    "TwoStackQueue": bench.doubling(
        with_class(TwoStackQueue), lambda n: (n,), sizes
    ),
}
bench.table(results)
bench.chart(results, "ch08_queues.png", "Fill and empty a queue")
