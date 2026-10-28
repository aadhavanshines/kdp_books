"""Fewest stops between stations on a small (fictional) metro."""

from search import bfs, dfs, shortest_path

lines = {
    "Red": ["Harbor", "Market", "Central", "Park", "Zoo"],
    "Blue": ["Airport", "Central", "Museum", "Stadium"],
    "Green": ["Market", "Museum", "University"],
}
metro = {}
for stations in lines.values():
    for a, b in zip(stations, stations[1:]):
        metro.setdefault(a, []).append(b)
        metro.setdefault(b, []).append(a)

print(" -> ".join(shortest_path(metro, "Harbor", "Stadium")))
print(" -> ".join(shortest_path(metro, "Zoo", "University")))
dist, _ = bfs(metro, "Central")
for stops in sorted(set(dist.values())):
    names = [s for s, d in dist.items() if d == stops]
    print(f"{stops} away from Central: {', '.join(names)}")
print("depth-first from Harbor:")
print(", ".join(dfs(metro, "Harbor")))
