"""Tests for Graph."""

from graph import Graph


def test_undirected_edges_go_both_ways():
    g = Graph.from_edges([("A", "B"), ("B", "C", 5)])
    assert g.has_edge("B", "A") and g.weight("C", "B") == 5
    assert not g.has_edge("A", "C")
    assert sorted(g.neighbors("B")) == ["A", "C"]
    assert g.degree("B") == 2 and len(g) == 3
    assert sorted(g.edges()) == [("A", "B", 1), ("B", "C", 5)]


def test_directed_edges_go_one_way():
    g = Graph.from_edges([(1, 2), (2, 3), (3, 1)], directed=True)
    assert g.has_edge(1, 2) and not g.has_edge(2, 1)
    assert len(list(g.edges())) == 3


def test_lone_vertex():
    g = Graph()
    g.add_vertex("solo")
    assert g.vertices() == ["solo"] and list(g.neighbors("solo")) == []
