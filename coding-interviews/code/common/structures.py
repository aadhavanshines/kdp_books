"""Small helper classes used by the linked-list and tree problems."""

from collections import deque


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def build_list(values):
    """Build a linked list from a Python list; return its head."""
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head


def list_values(head, limit=10_000):
    """The values of a linked list, as a Python list."""
    out = []
    while head and len(out) < limit:
        out.append(head.val)
        head = head.next
    return out


def build_tree(values):
    """Build a binary tree from level-order values, with None for gaps."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = deque([root])
    i = 1
    while queue and i < len(values):
        node = queue.popleft()
        for side in ("left", "right"):
            if i < len(values) and values[i] is not None:
                child = TreeNode(values[i])
                setattr(node, side, child)
                queue.append(child)
            i += 1
    return root


def tree_values(root):
    """Level-order values of a tree, with None for gaps, trailing Nones removed."""
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out
