"""12.7 Best Path: the largest sum of values along any path between two
nodes (a path never revisits a node and need not pass the root)."""

from common.structures import build_tree


def best_path(root):
    best = float("-inf")

    def gain(node):
        """Best sum of a path that starts at node and goes down."""
        nonlocal best
        if node is None:
            return 0
        left = max(gain(node.left), 0)  # ignore negative branches
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)  # path bends here
        return node.val + max(left, right)

    gain(root)
    return best


def best_path_brute(root):
    nodes, adj = [], {}

    def collect(node, parent):
        if node:
            nodes.append(node)
            adj[id(node)] = []
            if parent:
                adj[id(node)].append(parent)
                adj[id(parent)].append(node)
            collect(node.left, node)
            collect(node.right, node)

    collect(root, None)
    best = float("-inf")

    def dfs(node, prev, total):
        nonlocal best
        total += node.val
        best = max(best, total)
        for nxt in adj[id(node)]:
            if nxt is not prev:
                dfs(nxt, node, total)

    for start in nodes:
        dfs(start, None, 0)
    return best


def best_path_sum(values):
    return best_path(build_tree(values))


def best_path_sum_brute(values):
    return best_path_brute(build_tree(values))


SOLUTIONS = [best_path_sum, best_path_sum_brute]
EXAMPLES = [
    (([-10, 9, 20, None, None, 15, 7],), 42),
    (([1, 2, 3],), 6),
    (([-3],), -3),
]


def random_case(rng):
    vals = [
        rng.choice([None, rng.randint(-9, 9)]) if i else rng.randint(-9, 9)
        for i in range(rng.randint(1, 12))
    ]
    return (vals,)
