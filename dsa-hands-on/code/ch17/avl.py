"""An AVL tree: a binary search tree that rebalances itself.

Every node records its height. After each insert or delete, any node
whose two subtrees differ in height by more than one is fixed with one
or two rotations, so the tree's height stays below 1.44 log2(n + 2).
"""


class Node:
    __slots__ = ("key", "value", "left", "right", "height")

    def __init__(self, key, value):
        self.key, self.value = key, value
        self.left = self.right = None
        self.height = 0


def height(node):
    return node.height if node else -1


def update(node):
    node.height = 1 + max(height(node.left), height(node.right))


def balance(node):
    """Positive when the left side is taller, negative when the right is."""
    return height(node.left) - height(node.right)


def rotate_right(node):
    """Lift the left child above node; returns the new subtree root.

          node            left
          /  \\           /  \\
        left  c   ->     a   node
        /  \\                 /  \\
       a    b               b    c
    """
    left = node.left
    node.left, left.right = left.right, node
    update(node)
    update(left)
    return left


def rotate_left(node):
    """The mirror image of rotate_right."""
    right = node.right
    node.right, right.left = right.left, node
    update(node)
    update(right)
    return right


def rebalance(node):
    update(node)
    if balance(node) > 1:  # left side too tall
        if balance(node.left) < 0:  # left-right case: two rotations
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if balance(node) < -1:  # right side too tall
        if balance(node.right) > 0:  # right-left case
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node


class AVLTree:
    def __init__(self):
        self.root = None
        self._n = 0

    def __len__(self):
        return self._n

    def get(self, key, default=None):
        node = self.root
        while node:
            if key == node.key:
                return node.value
            node = node.left if key < node.key else node.right
        return default

    def __contains__(self, key):
        node = self.root
        while node and node.key != key:
            node = node.left if key < node.key else node.right
        return node is not None

    def put(self, key, value):
        self.root = self._put(self.root, key, value)

    def _put(self, node, key, value):
        if node is None:
            self._n += 1
            return Node(key, value)
        if key == node.key:
            node.value = value
            return node
        if key < node.key:
            node.left = self._put(node.left, key, value)
        else:
            node.right = self._put(node.right, key, value)
        return rebalance(node)  # fix every node on the way back up

    def delete(self, key):
        self.root = self._delete(self.root, key)
        self._n -= 1

    def _delete(self, node, key):
        if node is None:
            raise KeyError(key)
        if key < node.key:
            node.left = self._delete(node.left, key)
        elif key > node.key:
            node.right = self._delete(node.right, key)
        elif node.left and node.right:
            successor = node.right  # the next key takes this node's place
            while successor.left:
                successor = successor.left
            node.key, node.value = successor.key, successor.value
            node.right = self._delete(node.right, successor.key)
        else:
            return node.left or node.right
        return rebalance(node)

    def __iter__(self):
        stack, node = [], self.root
        while stack or node:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            yield node.key
            node = node.right

    def height(self):
        return height(self.root)
