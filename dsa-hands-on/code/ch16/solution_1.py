"""Exercise 16.1: is a tree a valid BST? Every node must lie strictly
between the bounds set by its ancestors, not only beat its parent."""

from bst import BST, Node


def is_bst(node, low=None, high=None):
    if node is None:
        return True
    if (low is not None and node.key <= low) or (
        high is not None and node.key >= high
    ):
        return False
    return is_bst(node.left, low, node.key) and is_bst(
        node.right, node.key, high
    )


t = BST()
for k in [50, 30, 70, 20, 40]:
    t.put(k, None)
print(is_bst(t.root))
t.root.left.right = Node(55, None)  # 55 is right of 30 but left of 50
print(is_bst(t.root))
