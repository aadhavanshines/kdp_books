"""Exercise 20.1: in-degree and out-degree of every vertex in a
directed graph."""

from graph import Graph

g = Graph.from_edges(
    [("a", "b"), ("a", "c"), ("b", "c"), ("c", "a"), ("d", "c")],
    directed=True,
)
indegree = dict.fromkeys(g.vertices(), 0)
for _, v, _ in g.edges():
    indegree[v] += 1
for v in sorted(g.vertices()):
    print(f"{v}: out {g.degree(v)}, in {indegree[v]}")
