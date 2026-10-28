"""Union-find (disjoint sets): which items are connected?

Each set is a tree; its root names the set. find() follows parents to
the root and then points every node on the way straight at it (path
compression). union() hangs the smaller tree under the larger (union by
size). Together they make each operation nearly constant time.
"""


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))  # each item starts as its own set
        self.size = [1] * n
        self.sets = n

    def find(self, x):
        root = x
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[x] != root:  # compress the path
            self.parent[x], x = root, self.parent[x]
        return root

    def union(self, a, b):
        """Join the sets of a and b. False if already in the same set."""
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra  # the smaller tree goes under the larger
        self.size[ra] += self.size[rb]
        self.sets -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)


class NaiveUnionFind:
    """No compression, no sizes: trees can become long chains."""

    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.parent[ra] = rb
        return True
