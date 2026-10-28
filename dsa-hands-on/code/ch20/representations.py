"""One small undirected graph, written down three ways."""

edges = [("A", "B"), ("A", "C"), ("B", "C"), ("C", "D")]
print("edge list:", edges)

adjacency = {}
for u, v in edges:
    adjacency.setdefault(u, []).append(v)
    adjacency.setdefault(v, []).append(u)
print("adjacency list:")
for v, nbrs in sorted(adjacency.items()):
    print(f"  {v}: {nbrs}")

names = sorted(adjacency)
position = {v: i for i, v in enumerate(names)}
matrix = [[0] * len(names) for _ in names]
for u, v in edges:
    matrix[position[u]][position[v]] = matrix[position[v]][position[u]] = 1
print("adjacency matrix:")
print("    " + " ".join(names))
for name, row in zip(names, matrix):
    print(f"  {name} " + " ".join(map(str, row)))
