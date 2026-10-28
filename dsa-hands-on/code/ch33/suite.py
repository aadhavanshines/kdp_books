"""A small benchmark suite of this book's kinds of work. Run it with
each Python you have to compare them: python3.12 suite.py, and so on.
With --json, prints the results as JSON instead of a table."""

import heapq
import json
import random
import sys
from collections import deque

import bench

rng = random.Random(2026)
NUMBERS = [rng.random() for _ in range(100_000)]
GRID = 200


def append_loop():
    items = []
    for i in range(100_000):
        items.append(i)


def dict_work():
    d = {}
    for i in range(50_000):
        d[i] = i
    return sum(d[i] for i in range(50_000))


def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


def heap_work():
    h = []
    for x in NUMBERS[:50_000]:
        heapq.heappush(h, x)
    while h:
        heapq.heappop(h)


def bfs_grid():
    seen, queue = {(0, 0)}, deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        for n in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= n[0] < GRID and 0 <= n[1] < GRID and n not in seen:
                seen.add(n)
                queue.append(n)


class Node:
    __slots__ = ("value", "next")

    def __init__(self, value, next=None):
        self.value, self.next = value, next


def linked_list():
    head = None
    for i in range(50_000):
        head = Node(i, head)
    total = 0
    while head:
        total += head.value
        head = head.next


def insertion_sort():
    items = NUMBERS[:1_500]
    for i in range(1, len(items)):
        x, j = items[i], i - 1
        while j >= 0 and items[j] > x:
            items[j + 1] = items[j]
            j -= 1
        items[j + 1] = x


TESTS = {
    "list append": append_loop,
    "dict set and get": dict_work,
    "recursion (fib 22)": lambda: fib(22),
    "heap push and pop": heap_work,
    "BFS on a grid": bfs_grid,
    "linked list": linked_list,
    "insertion sort": insertion_sort,
    "sorted() 100,000": lambda: sorted(NUMBERS),
}

results = {name: bench.measure(test) for name, test in TESTS.items()}
if "--json" in sys.argv:
    print(json.dumps(results))
else:
    version = ".".join(map(str, sys.version_info[:3]))
    print(f"Python {version}")
    for name, seconds in results.items():
        print(f"{name:>20}: {bench.show_time(seconds)}")
