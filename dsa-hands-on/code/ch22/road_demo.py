"""The shortest drive between towns (fictional, in kilometers)."""

from shortest import dijkstra, path_to

roads = [
    ("Ashford", "Brookton", 12),
    ("Ashford", "Cliffside", 35),
    ("Brookton", "Cliffside", 18),
    ("Brookton", "Dunmore", 40),
    ("Cliffside", "Dunmore", 9),
    ("Dunmore", "Eastvale", 14),
    ("Cliffside", "Eastvale", 30),
]
graph = {}
for a, b, km in roads:
    graph.setdefault(a, {})[b] = km
    graph.setdefault(b, {})[a] = km

dist, parent = dijkstra(graph, "Ashford")
for town in sorted(dist, key=dist.get):
    route = " -> ".join(path_to(parent, town))
    print(f"{town:>9} {dist[town]:>3} km: {route}")
