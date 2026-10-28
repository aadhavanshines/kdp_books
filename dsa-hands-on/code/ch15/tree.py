"""Binary trees: nodes with at most two children, and ways to visit them."""

from collections import deque


class TreeNode:
    __slots__ = ("value", "left", "right")

    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def from_levels(values):
    """Build a tree from values listed level by level, left to right,
    with None for a missing child: [1, 2, 3, None, 4] is
    1 with children 2 and 3, and 4 as the right child of 2."""
    if not values or values[0] is None:
        return None
    nodes = iter(values)
    root = TreeNode(next(nodes))
    waiting = deque([root])  # nodes whose children come next
    while waiting:
        node = waiting.popleft()
        for side in ("left", "right"):
            value = next(nodes, None)
            if value is not None:
                child = TreeNode(value)
                setattr(node, side, child)
                waiting.append(child)
    return root


def preorder(node):  # the node, then its left subtree, then its right
    if node:
        yield node.value
        yield from preorder(node.left)
        yield from preorder(node.right)


def inorder(node):  # left subtree, the node, right subtree
    if node:
        yield from inorder(node.left)
        yield node.value
        yield from inorder(node.right)


def postorder(node):  # left subtree, right subtree, then the node
    if node:
        yield from postorder(node.left)
        yield from postorder(node.right)
        yield node.value


def inorder_loop(node):
    """In-order without recursion: a stack holds the nodes whose left
    side we are still exploring."""
    stack = []
    while stack or node:
        while node:  # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()
        yield node.value
        node = node.right


def levels(root):
    """Breadth-first: a list of the values on each level."""
    out, level = [], [root] if root else []
    while level:
        out.append([n.value for n in level])
        level = [c for n in level for c in (n.left, n.right) if c]
    return out


def height(node):
    """Edges on the longest path down from node; -1 for no tree."""
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))


def draw(node, depth=0):
    """Print the tree sideways: the root on the left, right side up."""
    if node:
        draw(node.right, depth + 1)
        print("    " * depth + str(node.value))
        draw(node.left, depth + 1)
