"""12.4 Valid Search Tree: is every left subtree smaller, and every right
subtree larger, than its node (no duplicates)?"""

from common.structures import build_tree


def valid_bst(root, low=float("-inf"), high=float("inf")):
    if root is None:
        return True
    if not low < root.val < high:
        return False
    return valid_bst(root.left, low, root.val) and valid_bst(
        root.right, root.val, high
    )


def valid_bst_inorder(root):
    values = []

    def walk(node):
        if node:
            walk(node.left)
            values.append(node.val)
            walk(node.right)

    walk(root)
    return all(a < b for a, b in zip(values, values[1:]))


def is_search_tree(values):
    return valid_bst(build_tree(values))


def is_search_tree_inorder(values):
    return valid_bst_inorder(build_tree(values))


SOLUTIONS = [is_search_tree, is_search_tree_inorder]
EXAMPLES = [
    (([5, 3, 8, 1, 4, 7, 9],), True),
    (([5, 3, 8, 1, 6],), False),  # 6 is left of 5 but bigger
    (([],), True),
    (([2, 2],), False),
]


def random_case(rng):
    vals = [
        rng.choice([None, rng.randint(0, 9)]) if i else rng.randint(0, 9)
        for i in range(rng.randint(0, 10))
    ]
    return (vals,)
