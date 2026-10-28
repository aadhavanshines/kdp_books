"""Exercise 23.2: a maximum spanning tree, keeping the heaviest edges,
for example the strongest links of a network. Kruskal with the
weights negated."""

from mst import kruskal

edges = [(4, 0, 1), (8, 0, 2), (2, 1, 2), (6, 1, 3), (3, 2, 3)]
tree = kruskal(4, [(-w, u, v) for w, u, v in edges])
print(
    [(-w, u, v) for w, u, v in tree], "total", -sum(w for w, _, _ in tree)
)
