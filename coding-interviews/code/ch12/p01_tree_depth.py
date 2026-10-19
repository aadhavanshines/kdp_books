"""12.1 Tree Depth: the number of nodes on the longest root-to-leaf path."""

from collections import deque

from common.structures import build_tree


def depth(root):
    if root is None:
        return 0
    return 1 + max(depth(root.left), depth(root.right))


def depth_iterative(root):
    if root is None:
        return 0
    levels, queue = 0, deque([root])
    while queue:
        levels += 1
        for _ in range(len(queue)):  # one whole level at a time
            node = queue.popleft()
            for child in (node.left, node.right):
                if child:
                    queue.append(child)
    return levels


def tree_depth(values):
    return depth(build_tree(values))


def tree_depth_bfs(values):
    return depth_iterative(build_tree(values))


SOLUTIONS = [tree_depth, tree_depth_bfs]
EXAMPLES = [
    (([8, 4, 12, None, 6, 10],), 3),
    (([],), 0),
    (([1, None, 2, None, 3],), 3),
]


def random_tree(rng, n=12):
    return [
        rng.choice([None, rng.randint(0, 9)]) if i else rng.randint(0, 9)
        for i in range(rng.randint(0, n))
    ]


def random_case(rng):
    return (random_tree(rng),)
