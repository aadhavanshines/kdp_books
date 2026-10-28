"""Shortest paths in weighted graphs.

Graphs are dicts: vertex -> {neighbor: edge weight}.
"""

import heapq
import math


def dijkstra(graph, source):
    """Shortest distances from source when no weight is negative, and
    each vertex's parent on its shortest path.

    A heap hands out the closest vertex not yet finished. When a vertex
    comes off the heap its distance is final: any other route would
    pass through a vertex at least as far away, plus a weight >= 0.
    """
    dist, parent = {source: 0}, {source: None}
    heap = [(0, source)]
    done = set()
    while heap:
        d, v = heapq.heappop(heap)
        if v in done:
            continue  # an old, longer entry for v: skip it
        done.add(v)
        for w, weight in graph[v].items():
            if d + weight < dist.get(w, math.inf):
                dist[w] = d + weight
                parent[w] = v
                heapq.heappush(heap, (dist[w], w))
    return dist, parent


def path_to(parent, goal):
    path = [goal]
    while parent[path[-1]] is not None:
        path.append(parent[path[-1]])
    return path[::-1]


def bellman_ford(graph, source):
    """Shortest distances even with negative weights: relax every edge
    V - 1 times. Raises ValueError if a negative cycle can be reached,
    because then there is no shortest path."""
    dist, parent = {source: 0}, {source: None}
    for _ in range(len(graph) - 1):
        changed = False
        for v in list(dist):
            for w, weight in graph[v].items():
                if dist[v] + weight < dist.get(w, math.inf):
                    dist[w] = dist[v] + weight
                    parent[w] = v
                    changed = True
        if not changed:
            break  # nothing improved: already finished
    for v in dist:
        for w, weight in graph[v].items():
            if dist[v] + weight < dist[w]:
                raise ValueError("negative cycle")
    return dist, parent
