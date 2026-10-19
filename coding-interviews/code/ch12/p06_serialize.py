"""12.6 Save and Restore a Tree: turn a binary tree into a string and back."""

from common.structures import build_tree, tree_values
from common.structures import TreeNode


def serialize(root):
    out = []

    def walk(node):
        if node is None:
            out.append("#")
            return
        out.append(str(node.val))
        walk(node.left)
        walk(node.right)

    walk(root)
    return ",".join(out)


def deserialize(text):
    tokens = iter(text.split(","))

    def build():
        tok = next(tokens)
        if tok == "#":
            return None
        node = TreeNode(int(tok))
        node.left = build()
        node.right = build()
        return node

    return build()


def round_trip(values):
    return tree_values(deserialize(serialize(build_tree(values))))


def identity(values):
    return tree_values(build_tree(values))


SOLUTIONS = [round_trip, identity]
EXAMPLES = [
    (([1, 2, 3, None, None, 4, 5],), [1, 2, 3, None, None, 4, 5]),
    (([],), []),
    (([-7],), [-7]),
]


def random_case(rng):
    vals = [
        rng.choice([None, rng.randint(-20, 20)])
        if i
        else rng.randint(-20, 20)
        for i in range(rng.randint(0, 14))
    ]
    return (vals,)


def test():
    assert (
        serialize(build_tree([1, 2, 3, None, None, 4, 5]))
        == "1,2,#,#,3,4,#,#,5,#,#"
    )
