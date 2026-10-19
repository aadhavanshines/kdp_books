"""12.5 Closest Common Manager: in a binary tree with distinct values, the
lowest node that has both a and b in its subtree (a node counts as its
own descendant). Both are present."""

from common.structures import build_tree


def common_ancestor(root, a, b):
    if root is None or root.val in (a, b):
        return root
    left = common_ancestor(root.left, a, b)
    right = common_ancestor(root.right, a, b)
    if left and right:
        return root  # a and b are on different sides
    return left or right


def path_to(root, x):
    if root is None:
        return None
    if root.val == x:
        return [root.val]
    for child in (root.left, root.right):
        p = path_to(child, x)
        if p:
            return [root.val] + p
    return None


def lca_main(values, a, b):
    return common_ancestor(build_tree(values), a, b).val


def lca_paths(values, a, b):
    root = build_tree(values)
    pa, pb = path_to(root, a), path_to(root, b)
    last = None
    for x, y in zip(pa, pb):
        if x != y:
            break
        last = x
    return last


SOLUTIONS = [lca_main, lca_paths]
EXAMPLES = [
    (([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 1), 3),
    (([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 5, 4), 5),
    (([1, 2], 1, 2), 1),
]


def random_case(rng):
    from common.structures import tree_values

    n = rng.randint(1, 12)
    vals = list(range(n))
    rng.shuffle(vals)
    shape = [
        v if i == 0 or rng.random() < 0.8 else None
        for i, v in enumerate(vals)
    ]
    present = [v for v in tree_values(build_tree(shape)) if v is not None]
    return (shape, rng.choice(present), rng.choice(present))
