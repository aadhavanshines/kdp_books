"""heapq, the standard library heap, in four common patterns."""

import heapq

scores = [88, 42, 97, 63, 71, 99, 54]

# 1. The k largest (or smallest) items
print(heapq.nlargest(3, scores), heapq.nsmallest(2, scores))

# 2. A priority queue of tasks; the counter breaks ties in arrival order
tasks, counter = [], 0
for priority, task in [(2, "email"), (1, "fix bug"), (2, "lunch")]:
    heapq.heappush(tasks, (priority, counter, task))
    counter += 1
print([heapq.heappop(tasks)[2] for _ in range(3)])

# 3. Merge sorted lists lazily, one item at a time
print(list(heapq.merge([1, 4, 7], [2, 5, 8], [3, 6, 9])))

# 4. A max-heap: store negated values
max_heap = [-s for s in scores]
heapq.heapify(max_heap)
print(-heapq.heappop(max_heap))
