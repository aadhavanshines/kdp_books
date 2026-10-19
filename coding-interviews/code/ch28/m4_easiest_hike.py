"""Mock 4: Easiest Hike. A grid gives heights. A hike goes from the top-left
to the bottom-right moving up/down/left/right. Its effort is the largest
height difference between two consecutive cells. Find the smallest
possible effort."""

import heapq
from collections import deque


def easiest_hike(heights):
    rows, cols = len(heights), len(heights[0])
    best = [[float("inf")] * cols for _ in range(rows)]
    best[0][0] = 0
    heap = [(0, 0, 0)]  # (effort so far, row, col)
    while heap:
        effort, r, c = heapq.heappop(heap)
        if (r, c) == (rows - 1, cols - 1):
            return effort
        if effort > best[r][c]:
            continue  # stale entry
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                step = abs(heights[nr][nc] - heights[r][c])
                e = max(effort, step)  # effort is the worst step so far
                if e < best[nr][nc]:
                    best[nr][nc] = e
                    heapq.heappush(heap, (e, nr, nc))
    return 0


def reachable(heights, limit):
    rows, cols = len(heights), len(heights[0])
    seen, queue = {(0, 0)}, deque([(0, 0)])
    while queue:
        r, c = queue.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if (
                0 <= nr < rows
                and 0 <= nc < cols
                and (nr, nc) not in seen
                and abs(heights[nr][nc] - heights[r][c]) <= limit
            ):
                seen.add((nr, nc))
                queue.append((nr, nc))
    return (rows - 1, cols - 1) in seen


def easiest_hike_binary(heights):
    """Binary search on the answer, checking each guess with BFS."""
    lo, hi = 0, max(map(max, heights)) - min(map(min, heights))
    while lo < hi:
        mid = (lo + hi) // 2
        if reachable(heights, mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


SOLUTIONS = [easiest_hike, easiest_hike_binary]
EXAMPLES = [
    (([[4, 6, 9], [5, 12, 8], [7, 6, 10]],), 3),
    (([[1, 10, 1], [1, 10, 1], [1, 1, 1]],), 0),
    (([[7]],), 0),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    return (
        [[rng.randint(0, 20) for _ in range(cols)] for _ in range(rows)],
    )
