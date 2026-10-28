"""A graph as an adjacency map: each vertex maps to its neighbors, and
each neighbor to the weight of the edge (1 when weights don't matter)."""


class Graph:
    def __init__(self, directed=False):
        self.directed = directed
        self._adj = {}  # vertex -> {neighbor: weight}

    @classmethod
    def from_edges(cls, edges, directed=False):
        """Edges as (u, v) or (u, v, weight)."""
        g = cls(directed)
        for edge in edges:
            g.add_edge(*edge)
        return g

    def add_vertex(self, v):
        self._adj.setdefault(v, {})

    def add_edge(self, u, v, weight=1):
        self.add_vertex(u)
        self.add_vertex(v)
        self._adj[u][v] = weight
        if not self.directed:
            self._adj[v][u] = weight  # an undirected edge goes both ways

    def has_edge(self, u, v):
        return v in self._adj.get(u, {})

    def neighbors(self, v):
        return self._adj[v].keys()

    def weight(self, u, v):
        return self._adj[u][v]

    def vertices(self):
        return list(self._adj)

    def edges(self):
        """Every edge once, as (u, v, weight)."""
        seen = set()
        for u, nbrs in self._adj.items():
            for v, w in nbrs.items():
                if self.directed or (v, u) not in seen:
                    seen.add((u, v))
                    yield u, v, w

    def degree(self, v):
        return len(self._adj[v])

    def __len__(self):
        return len(self._adj)
