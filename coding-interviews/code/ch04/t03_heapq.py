"""Priority queues with heapq: a min-heap stored in a list."""

import heapq


def demo():
    heap = [5, 1, 8, 3]
    heapq.heapify(heap)  # O(n)
    heapq.heappush(heap, 2)  # O(log n)
    print(heapq.heappop(heap), heap[0])  # smallest, then next smallest

    # A max-heap: store negated values.
    biggest = [-x for x in [5, 1, 8, 3]]
    heapq.heapify(biggest)
    print(-heapq.heappop(biggest))

    # Tuples compare item by item: (priority, tie-breaker, payload).
    tasks = [(2, "write"), (1, "plan"), (2, "test")]
    heapq.heapify(tasks)
    print([heapq.heappop(tasks)[1] for _ in range(3)])
    print(heapq.nlargest(2, [5, 1, 8, 3]))
