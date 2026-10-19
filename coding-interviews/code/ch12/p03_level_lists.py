"""12.3 Level by Level: the values of a tree, one list per level."""

from collections import deque

from common.structures import build_tree


def levels(root):
    if root is None:
        return []
    out, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level)
    return out


def levels_dfs(root):
    out = []

    def visit(node, d):
        if node is None:
            return
        if d == len(out):
            out.append([])
        out[d].append(node.val)
        visit(node.left, d + 1)
        visit(node.right, d + 1)

    visit(root, 0)
    return out


def level_lists(values):
    return levels(build_tree(values))


def level_lists_dfs(values):
    return levels_dfs(build_tree(values))


SOLUTIONS = [level_lists, level_lists_dfs]
EXAMPLES = [
    (([3, 9, 20, None, None, 15, 7],), [[3], [9, 20], [15, 7]]),
    (([],), []),
]


def random_case(rng):
    vals = [
        rng.choice([None, rng.randint(0, 9)]) if i else rng.randint(0, 9)
        for i in range(rng.randint(0, 14))
    ]
    return (vals,)
