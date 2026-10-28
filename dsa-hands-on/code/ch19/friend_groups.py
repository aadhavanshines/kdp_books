"""Group people who are friends, directly or through others."""

from union_find import UnionFind

people = ["Ana", "Ben", "Cat", "Dan", "Eve", "Fay", "Gus"]
index = {name: i for i, name in enumerate(people)}
friendships = [
    ("Ana", "Ben"),
    ("Cat", "Dan"),
    ("Ben", "Cat"),
    ("Eve", "Fay"),
]

uf = UnionFind(len(people))
for a, b in friendships:
    uf.union(index[a], index[b])

groups = {}
for name in people:
    groups.setdefault(uf.find(index[name]), []).append(name)
print(f"{uf.sets} groups:", list(groups.values()))
print("Ana and Dan connected?", uf.connected(index["Ana"], index["Dan"]))
