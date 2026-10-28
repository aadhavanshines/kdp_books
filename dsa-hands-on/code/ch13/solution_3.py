"""Exercise 13.3: merge k sorted lists with a heap of the next item from
each list: n log k comparisons for n items in all."""

import heapq


def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)
    out = []
    while heap:
        value, i, j = heapq.heappop(heap)
        out.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out


print(merge_k([[1, 4, 9], [2, 2, 8], [], [0, 10]]))
