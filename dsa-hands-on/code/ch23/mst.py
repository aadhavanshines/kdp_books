"""Minimum spanning trees: connect every vertex of a weighted,
undirected graph with the least total edge weight."""

import heapq

from union_find import UnionFind  # a copy of Chapter 19's


def kruskal(n, edges):
    """Vertices 0..n-1; edges as (weight, u, v). Take edges from the
    lightest up, skipping any that would close a loop."""
    uf, tree = UnionFind(n), []
    for weight, u, v in sorted(edges):
        if uf.union(u, v):
            tree.append((weight, u, v))
            if len(tree) == n - 1:
                break
    return tree


def prim(graph, start):
    """Graph: vertex -> {neighbor: weight}. Grow one tree from start,
    always adding the lightest edge that reaches a new vertex."""
    in_tree, tree = {start}, []
    heap = [(w, start, v) for v, w in graph[start].items()]
    heapq.heapify(heap)
    while heap and len(in_tree) < len(graph):
        weight, u, v = heapq.heappop(heap)
        if v in in_tree:
            continue
        in_tree.add(v)
        tree.append((weight, u, v))
        for x, w in graph[v].items():
            if x not in in_tree:
                heapq.heappush(heap, (w, v, x))
    return tree
