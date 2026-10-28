"""The median of a stream of numbers, after each new one, with two
heaps: a max-heap for the smaller half and a min-heap for the larger."""

import heapq


class RunningMedian:
    def __init__(self):
        self.low = []  # max-heap of the smaller half (values negated)
        self.high = []  # min-heap of the larger half

    def add(self, x):
        heapq.heappush(self.low, -x)
        # move the biggest of the low half up, then rebalance
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2


m = RunningMedian()
for x in [5, 15, 1, 3, 8, 7]:
    m.add(x)
    print(f"add {x:>2}: median {m.median()}")
