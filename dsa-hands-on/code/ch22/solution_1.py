"""Exercise 22.1: a signal leaves one server and travels along timed
links. How long until every server has it? The largest of the
shortest distances, or -1 if some server is never reached."""

from shortest import dijkstra


def time_to_reach_all(n, links, start):
    graph = {v: {} for v in range(1, n + 1)}
    for a, b, ms in links:
        graph[a][b] = ms
    dist, _ = dijkstra(graph, start)
    return max(dist.values()) if len(dist) == n else -1


links = [(2, 1, 1), (2, 3, 1), (3, 4, 1)]
print(time_to_reach_all(4, links, 2))
print(time_to_reach_all(4, links, 1))
