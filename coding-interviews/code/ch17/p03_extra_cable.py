"""17.3 The Extra Cable: n computers 1..n were connected as a tree, then one
extra cable was added, creating a loop. Return the cable that can be
removed to make it a tree again; if several can, the last one listed."""


def extra_cable(cables):
    parent = list(range(len(cables) + 1))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # shorten the path as we go
            x = parent[x]
        return x

    for a, b in cables:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]  # a and b were already connected
        parent[ra] = rb
    return []


def is_tree_without(cables, skip):
    n = len(cables)
    adj = {i: [] for i in range(1, n + 1)}
    for k, (a, b) in enumerate(cables):
        if k != skip:
            adj[a].append(b)
            adj[b].append(a)
    seen, stack = {1}, [1]
    while stack:
        for v in adj[stack.pop()]:
            if v not in seen:
                seen.add(v)
                stack.append(v)
    return len(seen) == n


def extra_cable_brute(cables):
    for k in range(len(cables) - 1, -1, -1):
        if is_tree_without(cables, k):
            return list(cables[k])
    return []


SOLUTIONS = [extra_cable, extra_cable_brute]
EXAMPLES = [
    (([[1, 2], [1, 3], [2, 3]],), [2, 3]),
    (([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]],), [1, 4]),
]


def random_case(rng):
    n = rng.randint(3, 8)
    edges = [[rng.randint(1, v - 1), v] for v in range(2, n + 1)]
    a, b = rng.sample(range(1, n + 1), 2)
    while [min(a, b), max(a, b)] in [sorted(e) for e in edges]:
        a, b = rng.sample(range(1, n + 1), 2)
    edges.append([a, b])
    rng.shuffle(edges)
    return (edges,)
