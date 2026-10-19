"""17.4 Signal Time: a signal leaves node k of a network with n nodes
(1..n). Links (u, v, t) carry it from u to v in t ms. How long until
every node has it? -1 if some never do."""

import heapq


def signal_time(n, links, k):
    graph = {u: [] for u in range(1, n + 1)}
    for u, v, t in links:
        graph[u].append((v, t))
    arrival = {}
    heap = [(0, k)]
    while heap:
        time, u = heapq.heappop(heap)
        if u in arrival:
            continue  # already reached by a faster route
        arrival[u] = time
        for v, t in graph[u]:
            if v not in arrival:
                heapq.heappush(heap, (time + t, v))
    return max(arrival.values()) if len(arrival) == n else -1


def signal_time_bellman(n, links, k):
    inf = float("inf")
    dist = {u: inf for u in range(1, n + 1)}
    dist[k] = 0
    for _ in range(n - 1):
        for u, v, t in links:
            if dist[u] + t < dist[v]:
                dist[v] = dist[u] + t
    worst = max(dist.values())
    return -1 if worst == inf else worst


SOLUTIONS = [signal_time, signal_time_bellman]
EXAMPLES = [
    ((4, [(2, 1, 1), (2, 3, 1), (3, 4, 1)], 2), 2),
    ((2, [(1, 2, 1)], 2), -1),
    ((1, [], 1), 0),
]


def random_case(rng):
    n = rng.randint(1, 6)
    links = [
        (rng.randint(1, n), rng.randint(1, n), rng.randint(0, 9))
        for _ in range(rng.randint(0, 10))
    ]
    return (n, links, rng.randint(1, n))
