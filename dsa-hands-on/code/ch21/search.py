"""Breadth-first and depth-first search, and what they're good for.

Graphs here are plain dicts mapping each vertex to a list of neighbors,
like the adjacency lists of Chapter 20.
"""

from collections import deque


def bfs(graph, start):
    """Fewest edges from start to every reachable vertex, and each
    vertex's parent on such a shortest path."""
    dist, parent = {start: 0}, {start: None}
    queue = deque([start])
    while queue:
        v = queue.popleft()
        for w in graph[v]:
            if w not in dist:  # first visit is by a shortest path
                dist[w] = dist[v] + 1
                parent[w] = v
                queue.append(w)
    return dist, parent


def shortest_path(graph, start, goal):
    """A path with the fewest edges, as a list, or None."""
    _, parent = bfs(graph, start)
    if goal not in parent:
        return None
    path = [goal]
    while parent[path[-1]] is not None:
        path.append(parent[path[-1]])
    return path[::-1]


def dfs(graph, start):
    """Vertices in depth-first order, using an explicit stack."""
    seen, order, stack = set(), [], [start]
    while stack:
        v = stack.pop()
        if v in seen:
            continue
        seen.add(v)
        order.append(v)
        for w in reversed(graph[v]):  # so the first neighbor comes next
            if w not in seen:
                stack.append(w)
    return order


def components(graph):
    """The connected components of an undirected graph."""
    seen, out = set(), []
    for v in graph:
        if v not in seen:
            part = dfs(graph, v)
            seen.update(part)
            out.append(part)
    return out


def topological_order(graph):
    """Order a directed graph so every edge points forward (Kahn's
    algorithm), or return None if there is a cycle."""
    indegree = dict.fromkeys(graph, 0)
    for v in graph:
        for w in graph[v]:
            indegree[w] += 1
    ready = deque(v for v in graph if indegree[v] == 0)
    order = []
    while ready:
        v = ready.popleft()
        order.append(v)
        for w in graph[v]:
            indegree[w] -= 1
            if indegree[w] == 0:
                ready.append(w)
    return order if len(order) == len(graph) else None


def two_colors(graph):
    """Color an undirected graph with two colors so no edge joins two
    of the same color (bipartite), or return None if impossible."""
    color = {}
    for start in graph:
        if start in color:
            continue
        color[start] = 0
        queue = deque([start])
        while queue:
            v = queue.popleft()
            for w in graph[v]:
                if w not in color:
                    color[w] = 1 - color[v]
                    queue.append(w)
                elif color[w] == color[v]:
                    return None
    return color
