"""A binary search tree: every key in a node's left subtree is smaller
than the node's key, and every key in its right subtree is bigger.

All loops, no recursion: a badly unbalanced tree can be thousands of
levels deep, deeper than Python's recursion limit.
"""


class Node:
    __slots__ = ("key", "value", "left", "right")

    def __init__(self, key, value):
        self.key, self.value = key, value
        self.left = self.right = None


class BST:
    def __init__(self):
        self.root = None
        self._n = 0

    def __len__(self):
        return self._n

    def _find(self, key):
        """(node with key or None, its parent)."""
        parent, node = None, self.root
        while node and node.key != key:
            parent = node
            node = node.left if key < node.key else node.right
        return node, parent

    def get(self, key, default=None):
        node, _ = self._find(key)
        return node.value if node else default

    def __contains__(self, key):
        return self._find(key)[0] is not None

    def put(self, key, value):
        node, parent = self._find(key)
        if node:
            node.value = value  # the key is there: replace its value
        elif parent is None:
            self.root = Node(key, value)
            self._n += 1
        else:
            child = Node(key, value)
            if key < parent.key:
                parent.left = child
            else:
                parent.right = child
            self._n += 1

    def delete(self, key):
        node, parent = self._find(key)
        if node is None:
            raise KeyError(key)
        if node.left and node.right:
            # Two children: copy in the next key (the smallest on the
            # right), then delete that node, which has no left child
            parent, successor = node, node.right
            while successor.left:
                parent, successor = successor, successor.left
            node.key, node.value = successor.key, successor.value
            node = successor
        child = node.left or node.right  # at most one child now
        if parent is None:
            self.root = child
        elif parent.left is node:
            parent.left = child
        else:
            parent.right = child
        self._n -= 1

    def __iter__(self):
        """Keys in sorted order: an in-order walk with a stack."""
        stack, node = [], self.root
        while stack or node:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            yield node.key
            node = node.right

    def min(self):
        node = self.root
        while node.left:
            node = node.left
        return node.key

    def floor(self, key):
        """The largest key <= key, or None."""
        node, best = self.root, None
        while node:
            if node.key == key:
                return key
            if node.key < key:
                best, node = node.key, node.right
            else:
                node = node.left
        return best

    def height(self):
        """Edges on the longest path down from the root, counted level
        by level."""
        level, h = [self.root] if self.root else [], -1
        while level:
            h += 1
            level = [c for n in level for c in (n.left, n.right) if c]
        return h
