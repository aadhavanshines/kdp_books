"""12.2 Mirror a Tree: swap every node's left and right children."""

from common.structures import build_tree, tree_values


def mirror(root):
    if root:
        root.left, root.right = mirror(root.right), mirror(root.left)
    return root


def mirror_iterative(root):
    stack = [root]
    while stack:
        node = stack.pop()
        if node:
            node.left, node.right = node.right, node.left
            stack.extend((node.left, node.right))
    return root


def mirrored(values):
    return tree_values(mirror(build_tree(values)))


def mirrored_stack(values):
    return tree_values(mirror_iterative(build_tree(values)))


SOLUTIONS = [mirrored, mirrored_stack]
EXAMPLES = [
    (([4, 2, 7, 1, 3, 6, 9],), [4, 7, 2, 9, 6, 3, 1]),
    (([],), []),
    (([1, 2],), [1, None, 2]),
]


def random_case(rng):
    vals = [
        rng.choice([None, rng.randint(0, 9)]) if i else rng.randint(0, 9)
        for i in range(rng.randint(0, 12))
    ]
    return (vals,)
