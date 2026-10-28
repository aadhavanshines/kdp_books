"""An expression as a tree: operators inside, numbers at the leaves.
Post-order evaluates it: both sides first, then the operator."""

import operator

from tree import TreeNode

OPS = {"+": operator.add, "-": operator.sub, "*": operator.mul}


def evaluate(node):
    if node.left is None:  # a leaf: a number
        return node.value
    left, right = evaluate(node.left), evaluate(node.right)
    return OPS[node.value](left, right)


def to_text(node):
    """In-order, with brackets around every operation."""
    if node.left is None:
        return str(node.value)
    return f"({to_text(node.left)} {node.value} {to_text(node.right)})"


# (3 + 4) * (5 - 2)
expr = TreeNode(
    "*",
    TreeNode("+", TreeNode(3), TreeNode(4)),
    TreeNode("-", TreeNode(5), TreeNode(2)),
)
print(to_text(expr), "=", evaluate(expr))
