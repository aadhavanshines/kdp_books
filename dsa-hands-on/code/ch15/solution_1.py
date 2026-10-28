"""Exercise 15.1: mirror a tree, swapping every left and right child."""

from tree import from_levels, levels


def mirror(node):
    if node:
        node.left, node.right = mirror(node.right), mirror(node.left)
    return node


t = from_levels([1, 2, 3, 4, 5, None, 6])
print(levels(t))
print(levels(mirror(t)))
