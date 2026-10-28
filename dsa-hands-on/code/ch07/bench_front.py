"""Adding at the front: LinkedList against list and deque."""

from collections import deque

import bench
from linked_list import LinkedList


def make_list(n):
    return (list(range(n)),)


def make_linked(n):
    return (LinkedList(range(n)),)


def make_deque(n):
    return (deque(range(n)),)


def list_front(items):
    items.insert(0, 0)
    items.pop(0)


def linked_front(items):
    items.push_front(0)
    items.pop_front()


def deque_front(items):
    items.appendleft(0)
    items.popleft()


sizes = [10_000, 20_000, 40_000, 80_000, 160_000]
results = {
    "list": bench.doubling(list_front, make_list, sizes),
    "LinkedList": bench.doubling(linked_front, make_linked, sizes),
    "deque": bench.doubling(deque_front, make_deque, sizes),
}
bench.table(results)
bench.chart(results, "ch07_front.png", "Add and remove at the front")
