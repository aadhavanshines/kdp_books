"""Mock 1: Bus Transfers. routes[i] lists the stops bus i visits (it loops).
What is the fewest buses you must ride to get from stop src to stop dst?
0 if src == dst, -1 if impossible."""

from collections import defaultdict, deque


def bus_transfers(routes, src, dst):
    if src == dst:
        return 0
    buses_at = defaultdict(list)  # stop -> buses that visit it
    for bus, stops in enumerate(routes):
        for stop in stops:
            buses_at[stop].append(bus)
    queue = deque([(src, 0)])
    seen_stops, used_buses = {src}, set()
    while queue:
        stop, rides = queue.popleft()
        for bus in buses_at[stop]:
            if bus in used_buses:
                continue  # its stops were all queued already
            used_buses.add(bus)
            for nxt in routes[bus]:
                if nxt == dst:
                    return rides + 1
                if nxt not in seen_stops:
                    seen_stops.add(nxt)
                    queue.append((nxt, rides + 1))
    return -1


def bus_transfers_graph(routes, src, dst):
    """BFS over buses: two buses connect if they share a stop."""
    if src == dst:
        return 0
    sets = [set(r) for r in routes]
    start = [b for b, s in enumerate(sets) if src in s]
    dist = {b: 1 for b in start}
    queue = deque(start)
    while queue:
        b = queue.popleft()
        if dst in sets[b]:
            return dist[b]
        for other in range(len(sets)):
            if other not in dist and sets[b] & sets[other]:
                dist[other] = dist[b] + 1
                queue.append(other)
    return -1


SOLUTIONS = [bus_transfers, bus_transfers_graph]
EXAMPLES = [
    (([[1, 2, 7], [3, 6, 7]], 1, 6), 2),
    (([[7, 12], [4, 5, 15], [6], [15, 19], [9, 12, 13]], 15, 12), -1),
    (([[1, 2]], 3, 3), 0),
]


def random_case(rng):
    routes = [
        rng.sample(range(8), rng.randint(1, 4))
        for _ in range(rng.randint(1, 5))
    ]
    return (routes, rng.randint(0, 7), rng.randint(0, 7))
