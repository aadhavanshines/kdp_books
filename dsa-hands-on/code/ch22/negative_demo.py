"""Why Dijkstra needs weights >= 0. A negative edge (a rebate, say)
can make a route through a far vertex cheaper after Dijkstra has
already finalized a nearer one."""

from shortest import bellman_ford, dijkstra

g = {"s": {"a": 2, "b": 5}, "b": {"a": -4}, "a": {"t": 1}, "t": {}}
print("Dijkstra:    ", dijkstra(g, "s")[0])
print("Bellman-Ford:", bellman_ford(g, "s")[0])
