"""Lay fiber between six (fictional) offices as cheaply as possible.
Costs are in thousands of dollars."""

from mst import kruskal, prim

offices = ["HQ", "Depot", "Lab", "Shop", "Mill", "Port"]
costs = [
    (7, 0, 1),
    (5, 0, 3),
    (8, 1, 2),
    (9, 1, 3),
    (7, 1, 4),
    (5, 2, 4),
    (15, 3, 4),
    (6, 3, 5),
    (8, 4, 5),
    (11, 0, 5),
]
tree = kruskal(len(offices), costs)
for cost, a, b in tree:
    print(f"{offices[a]:>5} -- {offices[b]:<5} {cost}")
print(
    "total:", sum(c for c, _, _ in tree), "of", sum(c for c, _, _ in costs)
)

graph = {i: {} for i in range(len(offices))}
for c, a, b in costs:
    graph[a][b] = graph[b][a] = c
print("Prim's total:", sum(c for c, _, _ in prim(graph, 0)))
