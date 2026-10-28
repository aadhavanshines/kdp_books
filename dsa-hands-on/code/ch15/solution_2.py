"""Exercise 15.2: the diameter of a tree, the number of edges on the
longest path between any two nodes. Each node's best path through it
is its left height + its right height + 2."""

from tree import from_levels


def diameter(root):
    best = 0

    def height(node):
        nonlocal best
        if node is None:
            return -1
        left, right = height(node.left), height(node.right)
        best = max(best, left + right + 2)
        return 1 + max(left, right)

    height(root)
    return best


print(diameter(from_levels([1, 2, 3, 4, 5])))  # 4-2-1-3 or 5-2-1-3
print(diameter(from_levels([1, 2, None, 3, 4, 5, None, None, 6])))
