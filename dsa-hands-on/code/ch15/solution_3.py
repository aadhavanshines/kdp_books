"""Exercise 15.3: the lowest common ancestor of two values: the deepest
node that has both below it (or is one of them)."""

from tree import from_levels


def lca(node, a, b):
    if node is None or node.value in (a, b):
        return node
    left, right = lca(node.left, a, b), lca(node.right, a, b)
    if left and right:  # one on each side: this node joins them
        return node
    return left or right


t = from_levels([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
for a, b in [(5, 1), (6, 4), (7, 8), (5, 4)]:
    print(a, b, "->", lca(t, a, b).value)
