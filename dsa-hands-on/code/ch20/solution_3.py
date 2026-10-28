"""Exercise 20.3: reverse every edge of a directed graph (its
transpose), as used to find who links to a page."""

from graph import Graph

links = Graph.from_edges(
    [("home", "about"), ("home", "blog"), ("blog", "about")],
    directed=True,
)
reverse = Graph(directed=True)
for v in links.vertices():
    reverse.add_vertex(v)
for u, v, w in links.edges():
    reverse.add_edge(v, u, w)
for page in sorted(reverse.vertices()):
    print(f"{page} is linked from {sorted(reverse.neighbors(page))}")
